// ============================================================
// lib/render.js — Enjekte SEO/OG/Schema.org dinamik nan index.html
// ------------------------------------------------------------
// Pran fichye index.html "brit" (template SPA) e ranplase
// SEULMENT blòk ant <!-- SEO_BLOCK_START/END --> ak
// <!-- SCHEMA_BLOCK_START/END --> ak vèsyon espesifik pou
// yon anons. Rès fichye a (body, script.js, style.css) pa touche.
// ============================================================

const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '..', 'public', 'index.html');
const SITE_URL = (process.env.SITE_URL || 'https://ayitimarket.com').replace(/\/$/, '');

let cachedTemplate = null;
function getTemplate() {
  // Lè ou nan dev, ou ka vle dezaktive cache a pou wè chanjman vit.
  if (!cachedTemplate || process.env.NODE_ENV !== 'production') {
    cachedTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  }
  return cachedTemplate;
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replaceBlock(html, startMark, endMark, newContent) {
  const start = html.indexOf(startMark);
  const end = html.indexOf(endMark);
  if (start === -1 || end === -1) return html; // Si mak yo pa la, pa kraze anyen
  const before = html.slice(0, start + startMark.length);
  const after = html.slice(end);
  return `${before}\n${newContent}\n ${after}`;
}

// Sou paj akèy / paj jeneral — itilize SEO default yo (pa bezwen ranplase anyen)
function renderHomePage() {
  return getTemplate();
}

// Sou yon paj anons espesifik — enjekte meta/OG/Schema.org pwòp a anons lan
function renderListingPage(listing, slugUrl) {
  let html = getTemplate();

  const title = `${listing.title} — ${formatPriceForMeta(listing)} | Ayiti Market`;
  const rawDesc = listing.description || `Anons ${listing.title} sou Ayiti Market, nan ${listing.ville || 'Ayiti'}.`;
  const description = escapeHtml(rawDesc.slice(0, 160));
  const image = (listing.images && listing.images[0]) || `${SITE_URL}/og-image.jpg`;
  const url = `${SITE_URL}${slugUrl}`;
  const safeTitle = escapeHtml(title);

  const seoBlock = `
 <!-- SEO -->
 <title>${safeTitle}</title>
 <meta name="description" content="${description}">
 <meta name="keywords" content="${escapeHtml(listing.title)}, ${escapeHtml(listing.category || '')}, anons Haiti, achte vann Haiti">
 <meta name="author" content="Doberto Mr Lit">
 <meta name="robots" content="index, follow">
 <link rel="canonical" href="${url}">

 <!-- Open Graph -->
 <meta property="og:type" content="product">
 <meta property="og:url" content="${url}">
 <meta property="og:title" content="${safeTitle}">
 <meta property="og:description" content="${description}">
 <meta property="og:image" content="${image}">
 <meta property="og:image:width" content="800">
 <meta property="og:image:height" content="800">
 <meta property="og:locale" content="ht_HT">
 <meta property="og:site_name" content="Ayiti Market">
 <meta property="product:price:amount" content="${listing.price || ''}">
 <meta property="product:price:currency" content="${listing.currency || 'HTG'}">

 <!-- Twitter Card -->
 <meta name="twitter:card" content="summary_large_image">
 <meta name="twitter:title" content="${safeTitle}">
 <meta name="twitter:description" content="${description}">
 <meta name="twitter:image" content="${image}">`;

  html = replaceBlock(html, '<!-- SEO_BLOCK_START -->', '<!-- SEO_BLOCK_END -->', seoBlock);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: rawDesc,
    image: listing.images && listing.images.length ? listing.images : [image],
    url,
    category: listing.category || undefined,
    offers: {
      '@type': 'Offer',
      price: listing.price || 0,
      priceCurrency: listing.currency || 'HTG',
      availability: 'https://schema.org/InStock',
      url,
      seller: {
        '@type': 'Person',
        name: listing.profiles?.full_name || listing.profiles?.username || 'Vandè',
      },
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ayiti Market', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: listing.category || 'Kategori', item: `${SITE_URL}/?category=${encodeURIComponent(listing.category || '')}` },
      { '@type': 'ListItem', position: 3, name: listing.title, item: url },
    ],
  };

  const schemaBlock = `
 <script type="application/ld+json">
 ${JSON.stringify(jsonLd, null, 2)}
 </script>
 <script type="application/ld+json">
 ${JSON.stringify(breadcrumbLd, null, 2)}
 </script>`;

  html = replaceBlock(html, '<!-- SCHEMA_BLOCK_START -->', '<!-- SCHEMA_BLOCK_END -->', schemaBlock);

  // Bay JS kliyan an done anons lan dirèkteman nan paj la (evite yon dezyèm
  // rekèt API pou afichaj inisyal — bon pou pèfòmans ak evite "flash" san done).
  const hydrationScript = `\n <script>window.__INITIAL_LISTING__ = ${JSON.stringify(listing)};</script>\n`;
  html = html.replace('</head>', `${hydrationScript}</head>`);

  return html;
}

function formatPriceForMeta(listing) {
  if (!listing.price || listing.price === 0) return 'Prix à discuter';
  const n = Number(listing.price).toLocaleString('fr-HT');
  return `${n} ${listing.currency || 'HTG'}`;
}

module.exports = {
  renderHomePage,
  renderListingPage,
  SITE_URL,
};
