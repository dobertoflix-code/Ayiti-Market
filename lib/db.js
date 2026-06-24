// ============================================================
// lib/db.js — Koneksyon Supabase + fallback done demo
// ------------------------------------------------------------
// Si SUPABASE_URL ak SUPABASE_ANON_KEY configire (nan .env),
// fonksyon sa yo li VRÈ done nan Supabase.
// Si yo PA configire, yo retounen done demo (MOCK_LISTINGS)
// pou sit la ka mache san erè pandan devlopman.
// ============================================================

const { createClient } = require('@supabase/supabase-js');
const { MOCK_LISTINGS, CATEGORIES } = require('./mockData');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('YOUR_PROJECT')
);

const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!isSupabaseConfigured) {
  console.log('[db] SUPABASE_URL/SUPABASE_ANON_KEY pa configire — mode demo (MOCK_LISTINGS) aktive.');
} else {
  console.log('[db] Konekte ak Supabase:', SUPABASE_URL);
}

// Sèvi pou jenere yon "slug" SEO-friendly soti nan yon tit
function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // retire aksan
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

// Retounen yon lis anons aktif yo, ak filtè opsyonèl
async function getAllListings({ category, ville, search, limit = 24, offset = 0 } = {}) {
  if (supabase) {
    let query = supabase
      .from('listings')
      .select(`*, profiles(username, full_name, avatar_url, whatsapp, phone)`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) query = query.eq('category', category);
    if (ville) query = query.ilike('ville', `%${ville}%`);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) {
      console.error('[db] getAllListings error:', error.message);
      return [];
    }
    return data || [];
  }

  // Fallback demo
  let items = [...MOCK_LISTINGS];
  if (category) items = items.filter(l => l.category === category);
  if (ville) items = items.filter(l => l.ville?.toLowerCase().includes(ville.toLowerCase()));
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(l => l.title.toLowerCase().includes(q) || l.ville?.toLowerCase().includes(q));
  }
  return items.slice(offset, offset + limit);
}

async function getFeaturedListings() {
  if (supabase) {
    const { data, error } = await supabase
      .from('listings')
      .select(`*, profiles(username, avatar_url)`)
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8);
    if (error) {
      console.error('[db] getFeaturedListings error:', error.message);
      return [];
    }
    return data || [];
  }
  return MOCK_LISTINGS.filter(l => l.is_featured);
}

// Jwenn YON anons pa ID (sèvi pou paj detay SSR, OG, sitemap)
async function getListingById(id) {
  if (supabase) {
    const { data, error } = await supabase
      .from('listings')
      .select(`*, profiles(username, full_name, avatar_url, whatsapp, phone, ville)`)
      .eq('id', id)
      .eq('status', 'active')
      .single();
    if (error) {
      return null;
    }
    return data;
  }
  return MOCK_LISTINGS.find(l => String(l.id) === String(id)) || null;
}

// Jwenn TOUT anons aktif yo (pou sitemap.xml — pa gen limit)
async function getAllListingsForSitemap() {
  if (supabase) {
    const { data, error } = await supabase
      .from('listings')
      .select('id, title, updated_at, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[db] getAllListingsForSitemap error:', error.message);
      return [];
    }
    return data || [];
  }
  return MOCK_LISTINGS.map(l => ({
    id: l.id,
    title: l.title,
    updated_at: l.created_at,
    created_at: l.created_at,
  }));
}

async function incrementViews(id) {
  if (supabase) {
    await supabase.rpc('increment_views', { listing_id: id }).catch(() => {});
  }
  // Pa fè anyen an mode demo
}

module.exports = {
  isSupabaseConfigured,
  slugify,
  getAllListings,
  getFeaturedListings,
  getListingById,
  getAllListingsForSitemap,
  incrementViews,
  CATEGORIES,
};
