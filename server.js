// ============================================================
// server.js — Ayiti Market — Server Node.js / Express
// ------------------------------------------------------------
// Sa server sa a fè:
//  1. Sèvi SPA a (index.html, script.js, style.css) nòmalman
//  2. /annonce/:idSlug → SSR: enjekte OG/Schema.org/meta pwòp
//     a chak anons AVAN JS rann paj la (mache ak WhatsApp,
//     Facebook, Google menm si yo pa egzekite JS)
//  3. /sitemap.xml → jenere otomatikman ak tout anons aktif
//  4. /robots.txt → pwente sou sitemap la
//  5. /api/listings, /api/listings/:id → API pou SPA a li done
//     (Supabase si configire, sinon done demo)
// ============================================================

require('dotenv').config();
const express = require('express');
const path = require('path');

const db = require('./lib/db');
const render = require('./lib/render');

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_URL = render.SITE_URL;

app.use(express.json());

// ── HELPER: jwenn ID nan yon "slug" tankou "a1b2c3-iphone-13" ──
function extractIdFromSlug(idSlug) {
  if (!idSlug) return null;
  // ID nou yo se swa UUID (Supabase) swa nimewo senp (demo).
  // Konvansyon: ID se premye segman anvan premye "-".
  // Men UUID gen "-" ladan l, donk nou tcheke UUID konplè anvan.
  const uuidMatch = idSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (uuidMatch) return uuidMatch[0];
  // Sinon, premye segman (egz: "12-iphone-15" → "12")
  return idSlug.split('-')[0];
}

// ============================================================
// ROUTES API — done pou SPA a (kliyan)
// ============================================================

app.get('/api/listings', async (req, res) => {
  try {
    const { category, ville, search, limit, offset } = req.query;
    const items = await db.getAllListings({
      category: category || undefined,
      ville: ville || undefined,
      search: search || undefined,
      limit: limit ? Number(limit) : 24,
      offset: offset ? Number(offset) : 0,
    });
    res.json({ data: items });
  } catch (err) {
    console.error('[api/listings] erè:', err);
    res.status(500).json({ data: [], error: 'Erè sèvè' });
  }
});

app.get('/api/listings/featured', async (req, res) => {
  try {
    const items = await db.getFeaturedListings();
    res.json({ data: items });
  } catch (err) {
    console.error('[api/listings/featured] erè:', err);
    res.status(500).json({ data: [], error: 'Erè sèvè' });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const item = await db.getListingById(req.params.id);
    if (!item) return res.status(404).json({ data: null, error: 'Pa jwenn' });
    res.json({ data: item });
  } catch (err) {
    console.error('[api/listings/:id] erè:', err);
    res.status(500).json({ data: null, error: 'Erè sèvè' });
  }
});

// ============================================================
// ROUTE: /annonce/:idSlug — Paj detay anons (SSR pou SEO)
// ============================================================

app.get('/annonce/:idSlug', async (req, res, next) => {
  try {
    const id = extractIdFromSlug(req.params.idSlug);
    if (!id) return next();

    const listing = await db.getListingById(id);
    if (!listing) {
      // Anons pa egziste (oswa pa aktif ankò) — 404 pwòp
      res.status(404);
      return res.send(render.renderHomePage());
    }

    // Korije slug si li pa matche (kanonik — bon pou SEO,
    // evite kontni double sou plizyè URL pou menm anons)
    const correctSlug = `/annonce/${listing.id}-${db.slugify(listing.title)}`;
    if (req.params.idSlug !== `${listing.id}-${db.slugify(listing.title)}` && req.path !== correctSlug) {
      // Si moun antre yon vye slug men bon ID, redirije sou bon slug la
      const givenId = extractIdFromSlug(req.params.idSlug);
      if (String(givenId) === String(listing.id) && req.path !== correctSlug) {
        return res.redirect(301, correctSlug);
      }
    }

    db.incrementViews(listing.id).catch(() => {});

    const html = render.renderListingPage(listing, correctSlug);
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('[/annonce/:idSlug] erè:', err);
    next();
  }
});

// ============================================================
// ROUTE: /sitemap.xml — Jenere sitemap dinamik
// ============================================================

app.get('/sitemap.xml', async (req, res) => {
  try {
    const listings = await db.getAllListingsForSitemap();

    const staticUrls = [
      { loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${SITE_URL}/?page=about`, changefreq: 'monthly', priority: '0.5' },
    ];

    const listingUrls = listings.map(l => ({
      loc: `${SITE_URL}/annonce/${l.id}-${db.slugify(l.title)}`,
      lastmod: (l.updated_at || l.created_at || '').slice(0, 10),
      changefreq: 'weekly',
      priority: '0.8',
    }));

    const allUrls = [...staticUrls, ...listingUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('[/sitemap.xml] erè:', err);
    res.status(500).send('Erè jenerasyon sitemap');
  }
});

// ============================================================
// ROUTE: /robots.txt
// ============================================================

app.get('/robots.txt', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`);
});

// ============================================================
// SÈVI FICHYE STATIK (CSS, JS, imaj, etc.)
// ============================================================

app.use(express.static(path.join(__dirname, 'public'), {
  index: false, // pa otomatikman sèvi index.html — nou kontwole sa anba a
}));

// ============================================================
// ROUTE: paj akèy ak tout lòt wout SPA (fallback)
// ============================================================

app.get('*', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(render.renderHomePage());
});

// ============================================================
// DEMARE SERVER
// ============================================================

app.listen(PORT, () => {
  console.log(`✅ Ayiti Market server ap kouri sou pò ${PORT}`);
  console.log(`   Mode Supabase: ${db.isSupabaseConfigured ? 'AKTIVE' : 'DEMO (mock data)'}`);
  console.log(`   SITE_URL: ${SITE_URL}`);
});
