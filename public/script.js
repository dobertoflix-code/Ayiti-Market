// ============================================================
// script.js — Ayiti Market
// Application principale SPA
// ============================================================

import { Auth, Profiles, Listings, Favorites, Storage } from './supabase.js';

// ── CONFIG & STATE ───────────────────────────────────────────
const APP = {
  reportTargetId: null,
 currentPage: 'home',
 currentUser: null,
 currentProfile: null,
 currentListing: null,
 currentCategory: null,
 searchQuery: '',
 theme: localStorage.getItem('am_theme') || 'dark',
 listings: [],
 favorites: new Set(),
 offset: 0,
 limit: 24,
 loading: false,
};

const CATEGORIES = [
 { id: 'all', label: 'Tout', icon: '' },
 { id: 'phones', label: 'Telefòn & Elektwonik', icon: '' },
 { id: 'cars', label: 'Machin & Moto', icon: '' },
 { id: 'realestate', label: 'Kay & Teren', icon: '' },
 { id: 'fashion', label: 'Rad & Mòd', icon: '' },
 { id: 'services', label: 'Travay & Sèvis', icon: '' },
 { id: 'furniture', label: 'Mèb & Kay', icon: '' },
 { id: 'food', label: 'Manje & Restorasyon', icon: '' },
 { id: 'sports', label: 'Spò & Lwazisman', icon: '' },
 { id: 'animals', label: 'Bèt & Pwodwi', icon: '' },
];

const VILLES = [
 'Port-au-Prince','Pétionville','Delmas','Carrefour','Tabarre',
 'Croix-des-Bouquets','Cap-Haïtien','Gonaïves','Les Cayes',
 'Jacmel','Saint-Marc','Jérémie','Hinche','Miragoâne','Léogâne'
];

// Mock listings data (replace with Supabase calls in production)
const MOCK_LISTINGS = [
 { id:'1', title:'iPhone 15 Pro Max 256GB Nwa', price:85000, currency:'HTG', category:'phones', ville:'Pétionville', images:['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80'], created_at:'2026-06-20', views:342, profiles:{username:'maxtech',avatar_url:null}, is_featured:true },
 { id:'2', title:'Toyota Corolla 2019 Bon Kondisyon', price:1850000, currency:'HTG', category:'cars', ville:'Port-au-Prince', images:['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&q=80'], created_at:'2026-06-19', views:218, profiles:{username:'carhaiti',avatar_url:null} },
 { id:'3', title:'Appatman 3 chanm Pétionville', price:45000, currency:'HTG', category:'realestate', ville:'Pétionville', images:['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80'], created_at:'2026-06-18', views:189, profiles:{username:'immoHaiti',avatar_url:null}, is_featured:true },
 { id:'4', title:'Samsung Galaxy S24 Ultra Blan', price:72000, currency:'HTG', category:'phones', ville:'Delmas', images:['https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=400&q=80'], created_at:'2026-06-18', views:156, profiles:{username:'techshop509',avatar_url:null} },
 { id:'5', title:'Moto Honda CB500 2022', price:620000, currency:'HTG', category:'cars', ville:'Cap-Haïtien', images:['https://images.unsplash.com/photo-1558981285-6f0c68243e14?w=400&q=80'], created_at:'2026-06-17', views:201, profiles:{username:'motoking',avatar_url:null} },
 { id:'6', title:'Chèz salon modèn 6 plas', price:38000, currency:'HTG', category:'furniture', ville:'Port-au-Prince', images:['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80'], created_at:'2026-06-17', views:94, profiles:{username:'meblhaiti',avatar_url:null} },
 { id:'7', title:'Sèvis Plombri ak Elektrisite', price:5000, currency:'HTG', category:'services', ville:'Carrefour', images:['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80'], created_at:'2026-06-16', views:67, profiles:{username:'handy_man509',avatar_url:null} },
 { id:'8', title:'Rad Fèt Designer Brand Nouvo', price:12000, currency:'HTG', category:'fashion', ville:'Pétionville', images:['https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80'], created_at:'2026-06-16', views:143, profiles:{username:'fashionHT',avatar_url:null} },
 { id:'9', title:'MacBook Pro M3 16 pous', price:145000, currency:'HTG', category:'phones', ville:'Tabarre', images:['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80'], created_at:'2026-06-15', views:278, profiles:{username:'macstore',avatar_url:null}, is_featured:true },
 { id:'10', title:'Tèren 500m² Delmas 33', price:2500000, currency:'HTG', category:'realestate', ville:'Delmas', images:['https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80'], created_at:'2026-06-15', views:315, profiles:{username:'terrain509',avatar_url:null} },
 { id:'11', title:'Réfrigérateur LG Double Pòt Nouvo', price:55000, currency:'HTG', category:'furniture', ville:'Port-au-Prince', images:['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&q=80'], created_at:'2026-06-14', views:88, profiles:{username:'electroHT',avatar_url:null} },
 { id:'12', title:'Chyen Berger Alman 3 mwa', price:25000, currency:'HTG', category:'animals', ville:'Pétionville', images:['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&q=80'], created_at:'2026-06-14', views:201, profiles:{username:'petshop509',avatar_url:null} },
];

// Storage helpers
const STORAGE_KEY = 'ayiti_market_listings';
function saveListingsToStorage() {
 try {
  const userListings = MOCK_LISTINGS.filter(l => !l.images?.[0]?.includes('unsplash'));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userListings));
 } catch(e) {}
}
function loadListingsFromStorage() {
 try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) JSON.parse(saved).forEach(item => {
   if (!MOCK_LISTINGS.find(l => l.id === item.id)) MOCK_LISTINGS.unshift(item);
  });
 } catch(e) {}
}
loadListingsFromStorage();

// Storage helpers
const STORAGE_KEY = 'ayiti_market_listings';
function saveListingsToStorage() {
 try {
  const userListings = MOCK_LISTINGS.filter(l => !l.images?.[0]?.includes('unsplash'));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userListings));
 } catch(e) { console.warn('Storage error', e); }
}
function loadListingsFromStorage() {
 try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
   const items = JSON.parse(saved);
   items.forEach(item => {
    if (!MOCK_LISTINGS.find(l => l.id === item.id)) MOCK_LISTINGS.unshift(item);
   });
  }
 } catch(e) { console.warn('Load error', e); }
}
loadListingsFromStorage();

// ── DOM HELPERS ──────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function el(tag, cls, html = '') {
 const e = document.createElement(tag);
 if (cls) e.className = cls;
 if (html) e.innerHTML = html;
 return e;
}

// ── TOAST ────────────────────────────────────────────────────
function toast(msg, type = 'info') {
 const icons = { success: '', error: '', info: 'ℹ' };
 const t = el('div', `toast ${type}`, `<span>${icons[type]}</span><span>${msg}</span>`);
 $('#toasts').appendChild(t);
 setTimeout(() => t.remove(), 3200);
}

// ── THEME ────────────────────────────────────────────────────
function applyTheme(theme) {
 APP.theme = theme;
 document.documentElement.setAttribute('data-theme', theme);
 localStorage.setItem('am_theme', theme);
 const btn = $('#themeToggle');
 if (btn) {
  if (theme === 'dark') {
   btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  } else {
   btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }
 }
}

// ── NAVIGATION ──────────────────────────────────────────────
function navigate(page, data = {}) {
 APP.currentPage = page;

 // Hide all pages
 $$('.page').forEach(p => p.classList.remove('active'));

 const pageEl = $(`#page-${page}`);
 if (pageEl) {
 pageEl.classList.add('active');
 }

 // Close mobile nav
 $('#mobileNav')?.classList.remove('open');

 // Scroll to top
 window.scrollTo({ top: 0, behavior: 'smooth' });

 // Page-specific init
 switch (page) {
 case 'home': renderHome(); break;
 case 'listing': renderListingDetail(data.id); break;
 case 'post': initPostForm(); break;
 case 'profile': renderProfile(data.userId); break;
 case 'dashboard': renderDashboard(); break;
 case 'admin': renderAdmin(); break;
 case 'favorites': renderFavorites(); break;
 case 'about': break;
    case 'cgu': break;
    case 'privacy': break;
 case 'search': renderSearchResults(data); break;
 }

 updateNavActive();
}

function updateNavActive() {
 $$('.sidebar-link, .nav-dropdown-item, .mobile-nav-link').forEach(el => {
  el.classList.remove('active');
 });
 // Sync bottom nav
 const page = APP.currentPage;
 $$('.bnav-item').forEach(el => el.classList.remove('active'));
 const bnavMap = { home:'bnav-home', search:'bnav-search', post:'bnav-post', favorites:'bnav-favorites', dashboard:'bnav-account', profile:'bnav-account' };
 if (bnavMap[page]) $('#' + bnavMap[page])?.classList.add('active');
}

// ── FORMAT HELPERS ───────────────────────────────────────────
function formatPrice(price, currency = 'HTG') {
 if (!price || price === 0) return 'Prix à discuter';
 return `${Number(price).toLocaleString('fr-HT')} ${currency}`;
}

function formatDate(dateStr) {
 if (!dateStr) return '';
 const d = new Date(dateStr);
 const now = new Date();
 const diff = Math.floor((now - d) / 1000);
 if (diff < 60) return 'Kounye a';
 if (diff < 3600) return `${Math.floor(diff/60)} min`;
 if (diff < 86400) return `${Math.floor(diff/3600)}h`;
 if (diff < 604800) return `${Math.floor(diff/86400)}j`;
 return d.toLocaleDateString('fr-HT', { day: 'numeric', month: 'short' });
}

function getCategoryLabel(id) {
 return CATEGORIES.find(c => c.id === id)?.label || id;
}
function getCategoryIcon(id) {
 return CATEGORIES.find(c => c.id === id)?.icon || '';
}

// ── LISTING CARD ─────────────────────────────────────────────
function createListingCard(item) {
 const isFav = APP.favorites.has(item.id);
 const img = item.images?.[0];
 const featured = item.is_featured ? `<span class="badge badge-featured card-badge-featured"> Vedette</span>` : '';

 const card = el('div', 'listing-card');
 card.innerHTML = `
 <div class="card-img">
 ${img
 ? `<img src="${img}" alt="${item.title}" loading="lazy">`
 : `<div class="no-img"><span style="font-size:.75rem;margin-top:6px">Pa gen foto</span></div>`}
 ${featured}
 <button class="card-fav ${isFav ? 'active' : ''}" data-id="${item.id}" title="Favori">
 ${isFav ? '' : ''}
 </button>
 </div>
 <div class="card-body">
 <div class="card-price">
 ${item.price ? `<span class="currency">${item.currency || 'HTG'}</span>${Number(item.price).toLocaleString('fr-HT')}` : 'Prix à discuter'}
 </div>
 <div class="card-title">${item.title}</div>
 <div class="card-meta">
 <span>${getCategoryIcon(item.category)}</span>
 <span class="truncate">${item.ville || ''}</span>
 <span class="dot">·</span>
 <span>${formatDate(item.created_at)}</span>
 </div>
 </div>`;

 card.querySelector('.card-fav').addEventListener('click', e => {
 e.stopPropagation();
 toggleFavorite(item.id, e.currentTarget);
 });
 card.addEventListener('click', () => navigate('listing', { id: item.id }));
 return card;
}

function createSkeletonCard() {
 const card = el('div', 'listing-card card-skeleton');
 card.innerHTML = `
  <div class="card-img skeleton-img">
    <div class="skeleton" style="width:100%;height:100%"></div>
  </div>
  <div class="card-body">
    <div class="sk-price skeleton"></div>
    <div class="sk-title skeleton"></div>
    <div class="sk-title-short skeleton"></div>
    <div class="sk-meta">
      <div class="sk-badge skeleton"></div>
      <div class="sk-dot skeleton"></div>
      <div class="sk-date skeleton"></div>
    </div>
  </div>`;
 return card;
}

function toggleFavorite(id, btn) {
 if (!APP.currentUser) { openAuthModal(); return; }
 if (APP.favorites.has(id)) {
 APP.favorites.delete(id);
 btn.innerHTML = '';
 btn.classList.remove('active');
 toast('Retire nan favori yo', 'info');
 } else {
 APP.favorites.add(id);
 btn.innerHTML = '';
 btn.classList.add('active');
 toast('Ajoute nan favori yo', 'success');
 }
}

// ── HOME PAGE ────────────────────────────────────────────────
function renderHome() {
 renderCatsBar();
 renderFeaturedSection();
 renderRecentListings();
}

function renderCatsBar() {
 const bar = $('#catsBar');
 if (!bar) return;
 bar.innerHTML = '';
 CATEGORIES.forEach(cat => {
 const pill = el('button', `cat-pill ${APP.currentCategory === cat.id ? 'active' : ''}`);
 pill.innerHTML = `<span class="cat-icon">${cat.icon}</span>${cat.label}`;
 pill.addEventListener('click', () => {
 APP.currentCategory = cat.id === 'all' ? null : cat.id;
 $$('.cat-pill').forEach(p => p.classList.remove('active'));
 pill.classList.add('active');
 renderRecentListings();
 });
 bar.appendChild(pill);
 });
}

function renderFeaturedSection() {
 const grid = $('#featuredGrid');
 if (!grid) return;
 grid.innerHTML = '';
 for (let i = 0; i < 4; i++) grid.appendChild(createSkeletonCard());
 setTimeout(() => {
  const featured = MOCK_LISTINGS.filter(l => l.is_featured);
  grid.innerHTML = '';
  featured.forEach(l => grid.appendChild(createListingCard(l)));
 }, 500);
}

function renderRecentListings(append = false) {
 const grid = $('#recentGrid');
 if (!grid) return;

 if (!append) {
 grid.innerHTML = '';
 // Show skeletons
 for (let i = 0; i < 8; i++) grid.appendChild(createSkeletonCard());
 }

 setTimeout(() => {
 let items = [...MOCK_LISTINGS];
 if (APP.currentCategory) items = items.filter(l => l.category === APP.currentCategory);
 if (APP.searchQuery) {
 const q = APP.searchQuery.toLowerCase();
 items = items.filter(l => l.title.toLowerCase().includes(q) || l.ville?.toLowerCase().includes(q));
 }

 if (!append) grid.innerHTML = '';
 if (!items.length) {
 grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
 <div class="empty-icon"></div>
 <h3>Pa gen rezilta</h3>
 <p>Eseye yon lòt rechèch oswa kategori</p>
 </div>`;
 return;
 }
 items.forEach(l => grid.appendChild(createListingCard(l)));
 }, 600);
}

// ── LISTING DETAIL ───────────────────────────────────────────
function renderListingDetail(id) {
 const item = MOCK_LISTINGS.find(l => l.id === id) || MOCK_LISTINGS[0];
 APP.currentListing = item;

 const container = $('#page-listing');
 if (!container) return;

 const imgs = item.images?.length ? item.images : [''];
 const seller = item.profiles || {};
 const isFav = APP.favorites.has(item.id);
 const whatsapp = item.whatsapp || seller.whatsapp || '50912345678';
 const waMsg = encodeURIComponent(`Bonjou! Mwen entèrese nan: ${item.title} - ${formatPrice(item.price, item.currency)} - Ayiti Market`);
 const waUrl = `https://wa.me/${whatsapp.replace(/\D/g,'')}?text=${waMsg}`;

 container.innerHTML = `
 <div class="breadcrumb">
 <span class="breadcrumb-link" onclick="navigate('home')"> Ayiti Market</span>
 <span class="breadcrumb-sep">›</span>
 <span class="breadcrumb-link" onclick="APP.currentCategory='${item.category}';navigate('home')">${getCategoryLabel(item.category)}</span>
 <span class="breadcrumb-sep">›</span>
 <span class="truncate" style="max-width:200px">${item.title}</span>
 </div>
 <div class="detail-layout">
 <div>
 <div class="detail-gallery">
 <div class="gallery-main">
 ${imgs[0] ? `<img id="mainImg" src="${imgs[0]}" alt="${item.title}">` : `<div style="height:100%;display:flex;align-items:center;justify-content:center;font-size:4rem"></div>`}
 </div>
 ${imgs.length > 1 ? `<div class="gallery-thumbs">${imgs.map((src,i)=>`<div class="gallery-thumb ${i===0?'active':''}" onclick="switchImg('${src}',this)"><img src="${src}" alt=""></div>`).join('')}</div>` : ''}
 </div>
 <div class="detail-info">
 <div class="detail-price">${formatPrice(item.price, item.currency)}</div>
 <h1 class="detail-title">${item.title}</h1>
 <div class="detail-meta">
 <span class="badge badge-blue">${getCategoryIcon(item.category)} ${getCategoryLabel(item.category)}</span>
 <span class="badge badge-gray"> ${item.ville}</span>
 <span class="badge badge-gray"> ${item.views} vye</span>
 <span class="badge badge-gray"> ${formatDate(item.created_at)}</span>
 ${item.is_featured ? `<span class="badge badge-featured"> Vedette</span>` : ''}
 </div>
 <div class="detail-divider"></div>
 <h3 style="font-size:.9rem;font-weight:700;margin-bottom:10px"> Deskripsyon</h3>
 <div class="detail-desc">${item.description || 'Pa gen deskripsyon disponib. Kontakte vandè a pou plis enfòmasyon.'}</div>
 <div class="detail-divider"></div>
 <div style="display:flex;gap:12px;flex-wrap:wrap">
 <button class="btn btn-whatsapp btn-lg" onclick="window.open('${waUrl}','_blank')">
 Kontakte sou WhatsApp
 </button>
 <button class="btn btn-outline btn-lg ${isFav?'btn-red':''}" id="detailFavBtn" onclick="toggleFavDetail('${item.id}')">
 ${isFav?' Retire Favori':' Ajoute Favori'}
 </button>
 <button class="btn btn-ghost btn-lg" onclick="sharelisting('${item.id}')"> Pataje</button>
 </div>
 </div>
 </div>
 <div>
 <div class="seller-card">
 <div class="seller-header">
 <div class="profile-avatar-placeholder" style="width:52px;height:52px;font-size:1.3rem">${(seller.full_name || seller.username || 'V').charAt(0).toUpperCase()}</div>
 <div>
 <div class="seller-name">${seller.full_name || seller.username || 'Vandè'}</div>
 <div class="seller-join text-muted">@${seller.username || 'user'}</div>
 </div>
 </div>
 <div class="seller-actions">
 <a class="btn btn-whatsapp" href="${waUrl}" target="_blank" rel="noopener">
 WhatsApp
 </a>
 <button class="btn btn-outline" onclick="navigate('profile',{userId:'${item.user_id||'1'}'})" style="width:100%">
 Wè Pwofil Vandè a
 </button>
 <button class="btn btn-ghost" style="width:100%;color:var(--red)" onclick="reportListing('${item.id}')">
 Rapòte Anons sa
 </button>
 </div>
 </div>
 <div class="seller-card" style="margin-top:16px">
 <h4 style="font-size:.85rem;font-weight:700;margin-bottom:12px"> Konsèy Sekirite</h4>
 <ul style="font-size:.8rem;color:var(--text-muted);line-height:2;padding-left:16px">
 <li>Rankontre nan yon lye piblik</li>
 <li>Verifye pwodwi a anvan peye</li>
 <li>Pa voye lajan aleka</li>
 <li>Sinyale tout pwoblèm</li>
 </ul>
 </div>
 </div>
 </div>
 <div class="detail-actions-float">
 <a class="btn btn-whatsapp" href="${waUrl}" target="_blank" style="flex:1"> WhatsApp</a>
 <button class="btn btn-outline" onclick="toggleFavDetail('${item.id}')" id="floatFavBtn">${isFav?'':''}</button>
 </div>`;

 // Related listings
 const related = MOCK_LISTINGS.filter(l => l.id !== item.id && l.category === item.category).slice(0, 4);
 if (related.length) {
 const relSec = el('div', '', '');
 relSec.innerHTML = `<div style="max-width:1100px;margin:0 auto;padding:0 16px 32px">
 <div class="section-header"><span class="section-title">Anons <span>Similè</span></span></div>
 <div class="listings-grid" id="relatedGrid"></div></div>`;
 container.appendChild(relSec);
 setTimeout(() => {
 const rg = relSec.querySelector('#relatedGrid');
 related.forEach(l => rg.appendChild(createListingCard(l)));
 }, 100);
 }
}

function switchImg(src, thumb) {
 const mainImg = $('#mainImg');
 if (mainImg) mainImg.src = src;
 $$('.gallery-thumb').forEach(t => t.classList.remove('active'));
 thumb.classList.add('active');
}

function toggleFavDetail(id) {
 if (!APP.currentUser) { openAuthModal(); return; }
 const inFav = APP.favorites.has(id);
 if (inFav) {
 APP.favorites.delete(id);
 toast('Retire nan favori yo', 'info');
 } else {
 APP.favorites.add(id);
 toast('Ajoute nan favori yo', 'success');
 }
 const btn = $('#detailFavBtn');
 const fBtn = $('#floatFavBtn');
 if (btn) btn.innerHTML = APP.favorites.has(id) ? ' Retire Favori' : ' Ajoute Favori';
 if (fBtn) fBtn.innerHTML = APP.favorites.has(id) ? '' : '';
}

function sharelisting(id) {
 const url = `${window.location.origin}?listing=${id}`;
 if (navigator.share) {
 navigator.share({ title: APP.currentListing?.title, url });
 } else {
 navigator.clipboard.writeText(url).then(() => toast('Lyen kopye!', 'success'));
 }
}

function reportListing(id) {
  APP.reportTargetId = id;
  document.querySelectorAll('input[name="reportReason"]').forEach(r => r.checked = false);
  const comment = document.getElementById('reportComment');
  if (comment) comment.value = '';
  const modal = document.getElementById('reportModal');
  if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function closeReportModal() {
  const modal = document.getElementById('reportModal');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}

function submitReport() {
  const reason = document.querySelector('input[name="reportReason"]:checked');
  if (!reason) { toast('Chwazi yon rezon pou rapw a', 'error'); return; }
  const comment = document.getElementById('reportComment')?.value || '';
  closeReportModal();
  toast('Rapw ou a voye avek siksw. Mesi pou kontribisyon ou!', 'success');
}

function showLegalPage(type) {
  const modal = document.getElementById('legalModal');
  const title = document.getElementById('legalModalTitle');
  const body = document.getElementById('legalModalBody');
  if (!modal) return;
  const CGU = '<h4 style="color:var(--text);margin:12px 0 6px">1. Akseptasyon</h4><p>Nan itilize Ayiti Market, ou aksepte kondisyon sa yo.</p><h4 style="color:var(--text);margin:12px 0 6px">2. Responsablite</h4><ul style="padding-left:16px"><li>Verite enfom ou pibliye yo</li><li>Respekte lwa Ayiti</li><li>Pa pibliye kontni ilegal</li></ul><h4 style="color:var(--text);margin:12px 0 6px">3. Kontni Entdi</h4><p>Entdi: zam ilegal, fwd, pwnografi, materyel ki vole.</p><h4 style="color:var(--text);margin:12px 0 6px">4. Kontakte</h4><p style="color:var(--blue)">legal@ayitimarket.com</p>';
  const PRIV = '<h4 style="color:var(--text);margin:12px 0 6px">1. Done Nou Kolekte</h4><ul style="padding-left:16px"><li>Non ak imel (pou kont)</li><li>WhatsApp (pou anons)</li><li>Foto pwodwi</li></ul><h4 style="color:var(--text);margin:12px 0 6px">2. Itilizasyon</h4><p>Selman pou fonksyone kont ou ak pmet kontakt ant achet ak vand.</p><h4 style="color:var(--text);margin:12px 0 6px">3. Sekirite</h4><p>Supabase ak SSL. Modpas pa janm an teks kl.</p><h4 style="color:var(--text);margin:12px 0 6px">4. Dwa Ou</h4><p>Siprime done ou: <span style="color:var(--blue)">privacy@ayitimarket.com</span></p>';
  if (type === 'cgu') { title.textContent = 'Kondisyon Jeneral Itilizasyon'; body.innerHTML = CGU; }
  else { title.textContent = 'Politik Konfidansyalite'; body.innerHTML = PRIV; }
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLegalModal() {
  const modal = document.getElementById('legalModal');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}


// ── SEARCH ───────────────────────────────────────────────────
function doSearch(query, category = null) {
 APP.searchQuery = query;
 navigate('search', { query, category });
}

function renderSearchResults({ query = '', category = null } = {}) {
 const container = $('#page-search');
 if (!container) return;

 let items = [...MOCK_LISTINGS];
 if (category && category !== 'all') items = items.filter(l => l.category === category);
 if (query) {
 const q = query.toLowerCase();
 items = items.filter(l => l.title.toLowerCase().includes(q) || l.ville?.toLowerCase().includes(q) || l.category?.toLowerCase().includes(q));
 }

 container.innerHTML = `
 <div class="search-page">
 <div class="search-header">
 <h2>${query ? `Rezilta pou "<strong>${query}</strong>"` : 'Tout Anons'}</h2>
 <p>${items.length} anons jwenn</p>
 </div>
 <div class="filter-bar">
 <select class="filter-select" onchange="sortResults(this.value)">
 <option value="recent">Pi Resan</option>
 <option value="price_asc">Pri: Ba → Wo</option>
 <option value="price_desc">Pri: Wo → Ba</option>
 <option value="views">Pi Popilè</option>
 </select>
 <select class="filter-select" onchange="filterByVille(this.value)">
 <option value="">Tout Vil</option>
 ${VILLES.map(v => `<option value="${v}">${v}</option>`).join('')}
 </select>
 ${CATEGORIES.filter(c=>c.id!=='all').map(c=>`
 <button class="chip ${category===c.id?'active':''}" onclick="doSearch('${query}','${c.id}')">
 ${c.icon} ${c.label}
 </button>`).join('')}
 </div>
 <div class="listings-grid" id="searchGrid"></div>
 ${items.length ? `<div class="load-more-wrap"><button class="btn btn-outline" onclick="loadMore()">Chaje Plis Anons</button></div>` : ''}
 </div>`;

 const grid = $('#searchGrid');
 if (!items.length) {
 grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
 <div class="empty-icon"></div>
 <h3>Pa gen rezilta</h3>
 <p>Eseye yon lòt mo rechèch oswa retire filtè yo</p>
 <button class="btn btn-primary" onclick="navigate('home')">Retounen Akèy</button>
 </div>`;
 } else {
 items.forEach(l => grid.appendChild(createListingCard(l)));
 }
}

function sortResults(val) {
 toast(`Triye pa: ${val}`, 'info');
}
function filterByVille(val) {
 if (val) toast(`Filtè: ${val}`, 'info');
}
function loadMore() {
 toast('Ap chaje plis...', 'info');
}

// ── AUTH MODAL ───────────────────────────────────────────────
async function handleGoogleLogin() {
 try {
  const btn = document.querySelector('.social-btn');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }
  const { error } = await Auth.signInWithGoogle();
  if (error) { toast('Google login error: ' + error.message, 'error'); }
 } catch(e) {
  toast('Koneksyon Google echwe', 'error');
 } finally {
  const btn = document.querySelector('.social-btn');
  if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
 }
}

function openAuthModal(tab = 'login') {
 const overlay = $('#authModal');
 if (!overlay) return;
 overlay.classList.add('open');
 switchAuthTab(tab);
}

function closeAuthModal() {
 $('#authModal')?.classList.remove('open');
}

function switchAuthTab(tab) {
 $$('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
 $$('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tab}`));
}

async function handleLogin(e) {
 e.preventDefault();
 const email = $('#loginEmail').value.trim();
 const pass = $('#loginPass').value;
 const btn = $('#loginBtn');

 if (!email || !pass) { toast('Ranpli tout chan yo', 'error'); return; }

 btn.disabled = true;
 btn.textContent = 'Ap konekte...';

 try {
  const { data, error } = await Auth.signIn(email, pass);
  if (error) {
   let msg = 'Email oswa modpas pa bon';
   if (error.message.includes('Email not confirmed')) msg = 'Konfime email ou dabord (verifye bwat ou)';
   toast(msg, 'error');
  } else {
   const profile = await Profiles.getProfile(data.user.id);
   APP.currentUser = data.user;
   APP.currentProfile = profile.data;
   updateAuthUI();
   closeAuthModal();
   toast('Koneksyon reyisi! Byenveni', 'success');
   if (APP._pendingNav) { navigate(APP._pendingNav); APP._pendingNav = null; }
  }
 } catch(err) {
  toast('Ere koneksyon', 'error');
 } finally {
  btn.disabled = false;
  btn.textContent = 'Konekte';
 }
}
async function handleRegister(e) {
 e.preventDefault();
 const name = $('#regName').value.trim();
 const email = $('#regEmail').value.trim();
 const pass = $('#regPass').value;
 const btn = $('#regBtn');

 const cguChecked = document.getElementById('regCGU')?.checked;
 if (!name || !email || !pass) { toast('Ranpli tout chan yo', 'error'); return; }
 if (!cguChecked) {
  const w = document.getElementById('cguWrapper');
  if (w) { w.style.border = '1.5px solid var(--red)'; setTimeout(() => w.style.border = '1.5px solid var(--border)', 2500); }
  toast('Ou dwe aksepte Kondisyon yo pou kontinye', 'error'); return;
 }
 if (pass.length < 6) { toast('Modpas la dwe gen omwen 6 karaktè', 'error'); return; }

 btn.disabled = true;
 btn.textContent = 'Ap kreye kont...';

 try {
  const { data, error } = await Auth.signUp(email, pass, { full_name: name });
  if (error) {
   let msg = error.message;
   if (error.message.includes('already registered')) msg = 'Email sa deja itilize, konekte olye';
   toast(msg, 'error');
  } else {
   closeAuthModal();
   toast('Kont kreye! Verifye email ou pou konfime kont lan', 'success');
  }
 } catch(err) {
  toast('Ere enskripsyon', 'error');
 } finally {
  btn.disabled = false;
  btn.textContent = 'Kreye Kont';
 }
}
async function handleLogout() {
 await Auth.signOut();
 APP.currentUser = null;
 APP.currentProfile = null;
 APP.favorites.clear();
 updateAuthUI();
 navigate('home');
 toast('Ou dekonekte', 'info');
 closeDropdown();
}
function updateAuthUI() {
 const user = APP.currentUser;
 const profile = APP.currentProfile;

 const authBtns = $('#authBtns');
 const userMenu = $('#userMenu');

 if (user && profile) {
 if (authBtns) authBtns.classList.add('hidden');
 if (userMenu) {
 userMenu.classList.remove('hidden');
 const initial = (profile.full_name || profile.username || 'U').charAt(0).toUpperCase();
 const avatarEl = $('#navAvatar');
 if (avatarEl) {
 if (profile.avatar_url) {
 avatarEl.innerHTML = `<img class="nav-avatar" src="${profile.avatar_url}" alt="">`;
 } else {
 avatarEl.innerHTML = `<div style="width:34px;height:34px;border-radius:50%;background:var(--red);color:white;font-weight:700;display:flex;align-items:center;justify-content:center;font-size:.9rem;cursor:pointer" onclick="toggleDropdown()"> ${initial}</div>`;
 }
 }
 const nameEl = $('#dropdownName');
 if (nameEl) nameEl.textContent = profile.full_name || profile.username;
 const emailEl = $('#dropdownEmail');
 if (emailEl) emailEl.textContent = user.email;

 const adminItem = $('#adminMenuItem');
 if (adminItem) adminItem.classList.toggle('hidden', !profile.is_admin);
 }
 } else {
 if (authBtns) authBtns.classList.remove('hidden');
 if (userMenu) userMenu.classList.add('hidden');
 }
}

function toggleDropdown() {
 $('#dropdownMenu')?.classList.toggle('open');
}
function closeDropdown() {
 $('#dropdownMenu')?.classList.remove('open');
}

// ── POST LISTING ─────────────────────────────────────────────
function initPostForm() {
 if (!APP.currentUser) {
 APP._pendingNav = 'post';
 openAuthModal('login');
 return;
 }
 const form = $('#postForm');
 if (!form) return;
 // Populate ville select
 const villeSelect = $('#postVille');
 if (villeSelect) {
 VILLES.forEach(v => {
 const opt = document.createElement('option');
 opt.value = v; opt.textContent = v;
 villeSelect.appendChild(opt);
 });
 }
}

function handleImageUpload(e) {
 const files = [...e.target.files];
 if (files.length > 6) { toast('Maks 6 foto', 'error'); return; }
 const previews = $('#imgPreviews');
 if (!previews) return;
 previews.innerHTML = '';
 files.forEach((file, i) => {
 const reader = new FileReader();
 reader.onload = ev => {
 const wrap = el('div', 'img-preview');
 wrap.innerHTML = `<img src="${ev.target.result}" alt=""><button class="img-preview-remove" onclick="this.parentElement.remove()">×</button>`;
 previews.appendChild(wrap);
 };
 reader.readAsDataURL(file);
 });
}

async function submitListing(e) {
 e.preventDefault();
 if (!APP.currentUser) { openAuthModal(); return; }

 const btn = $('#submitListingBtn');
 btn.disabled = true;
 btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px"></div> Ap voye...';

 const data = {
 title: $('#postTitle').value,
 price: $('#postPrice').value || 0,
 currency: $('#postCurrency').value,
 category: $('#postCategory').value,
 ville: $('#postVille').value,
 description: $('#postDesc').value,
 whatsapp: $('#postWhatsapp').value,
 };

 if (!data.title || !data.category || !data.ville) {
 toast('Ranpli tout chan obligatwa yo', 'error');
 btn.disabled = false;
 btn.textContent = 'Pibliye Anons la';
 return;
 }

 // Collect images from previews
  const imgEls = document.querySelectorAll('#imgPreviews img');
  const images = [...imgEls].map(img => img.src);

  setTimeout(() => {
    const newItem = {
      id: String(Date.now()),
      ...data,
      images,
      status: 'active',
      views: 0,
      created_at: new Date().toISOString(),
      user_id: APP.currentUser.id,
      profiles: { username: APP.currentProfile?.username, full_name: APP.currentProfile?.full_name }
    };
    MOCK_LISTINGS.unshift(newItem);
    saveListingsToStorage();
    toast('Anons pibliye avèk siksè! ✅', 'success');
    navigate('dashboard');
    btn.disabled = false;
    btn.textContent = 'Pibliye Anons la';
  }, 1500);
}

// ── PROFILE PAGE ─────────────────────────────────────────────
function renderProfile(userId = null) {
 const profile = APP.currentProfile || { username: 'demo', full_name: 'Utilisatè Demo' };
 const container = $('#page-profile');
 if (!container) return;

 const userListings = MOCK_LISTINGS.slice(0, 6);
 const initial = (profile.full_name || profile.username || 'U').charAt(0).toUpperCase();

 container.innerHTML = `
 <div class="profile-layout">
 <div class="profile-header-card">
 <div class="profile-cover"></div>
 <div class="profile-header-body">
 <div class="profile-avatar-wrap">
 <div class="profile-avatar-placeholder">${initial}</div>
 ${userId === APP.currentUser?.id || !userId ? `<button class="btn btn-ghost btn-sm" onclick="openEditProfile()"> Modifye Pwofil</button>` : ''}
 </div>
 <div class="profile-name">${profile.full_name || profile.username}</div>
 <div class="text-muted text-sm">@${profile.username} ${profile.ville ? `• ${profile.ville}` : ''}</div>
 ${profile.bio ? `<p style="margin-top:8px;font-size:.875rem">${profile.bio}</p>` : ''}
 <div class="profile-meta" style="margin-top:12px">
 <div class="profile-stat"><strong>${userListings.length}</strong><span>Anons</span></div>
 <div class="profile-stat"><strong>${APP.favorites.size}</strong><span>Favori</span></div>
 <div class="profile-stat"><strong>124</strong><span>Vye</span></div>
 </div>
 </div>
 <div class="profile-tabs" style="padding:0 24px">
 <div class="profile-tab active" onclick="switchProfileTab('listings',this)"> Anons</div>
 <div class="profile-tab" onclick="switchProfileTab('favorites',this)"> Favori</div>
 <div class="profile-tab" onclick="switchProfileTab('settings',this)"> Paramèt</div>
 </div>
 </div>
 <div id="profileTabContent">
 <div class="listings-grid">
 ${userListings.map(l => l.id).join(',')}
 </div>
 </div>
 </div>`;

 const tabContent = $('#profileTabContent');
 const grid = el('div', 'listings-grid');
 userListings.forEach(l => grid.appendChild(createListingCard(l)));
 tabContent.innerHTML = '';
 tabContent.appendChild(grid);
}

function switchProfileTab(tab, el) {
 $$('.profile-tab').forEach(t => t.classList.remove('active'));
 el.classList.add('active');
 const content = $('#profileTabContent');
 if (!content) return;

 if (tab === 'listings') {
 content.innerHTML = '';
 const grid = document.createElement('div');
 grid.className = 'listings-grid';
 MOCK_LISTINGS.slice(0,6).forEach(l => grid.appendChild(createListingCard(l)));
 content.appendChild(grid);
 } else if (tab === 'favorites') {
 navigate('favorites');
 } else if (tab === 'settings') {
 content.innerHTML = `<div class="post-card" style="max-width:560px">
 <div class="post-card-title"> Modifye Pwofil</div>
 <div style="display:flex;flex-direction:column;gap:16px">
 <div class="form-group"><label class="form-label">Non Konplè</label><input class="form-control" value="${APP.currentProfile?.full_name||''}"></div>
 <div class="form-group"><label class="form-label">Username</label><input class="form-control" value="${APP.currentProfile?.username||''}"></div>
 <div class="form-group"><label class="form-label">Vil</label><input class="form-control" placeholder="Port-au-Prince"></div>
 <div class="form-group"><label class="form-label">Bio</label><textarea class="form-control" rows="3" placeholder="Di yon ti kichoy sou ou..."></textarea></div>
 <div class="form-group"><label class="form-label">WhatsApp</label><input class="form-control" placeholder="+509 xxxx-xxxx"></div>
 <button class="btn btn-primary" onclick="toast('Pwofil modifye!','success')"> Sove Chanjman</button>
 </div>
 </div>`;
 }
}

function openEditProfile() {
 switchProfileTab('settings', $$('.profile-tab')[2]);
}

// ── DASHBOARD ────────────────────────────────────────────────
function renderDashboard() {
 if (!APP.currentUser) { openAuthModal(); navigate('home'); return; }

 const container = $('#page-dashboard');
 if (!container) return;

 const myListings = MOCK_LISTINGS.slice(0, 5);
 const totalViews = myListings.reduce((s, l) => s + (l.views||0), 0);

 container.innerHTML = `
 <div class="dash-layout">
 <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
 <h1 style="font-size:1.3rem;font-weight:800"> Dashboard Mwen</h1>
 <button class="btn btn-primary" onclick="navigate('post')">+ Nouvel Anons</button>
 </div>
 <div class="dash-grid">
 <div class="stat-card"><div class="stat-icon blue"></div><div><div class="stat-value">${myListings.length}</div><div class="stat-label">Anons Aktif</div></div></div>
 <div class="stat-card"><div class="stat-icon green"></div><div><div class="stat-value">${totalViews}</div><div class="stat-label">Total Vye</div></div></div>
 <div class="stat-card"><div class="stat-icon red"></div><div><div class="stat-value">${APP.favorites.size}</div><div class="stat-label">Favori</div></div></div>
 <div class="stat-card"><div class="stat-icon orange"></div><div><div class="stat-value">12</div><div class="stat-label">Mesaj</div></div></div>
 </div>
 <div class="dash-card">
 <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
 <div class="dash-card-title" style="margin-bottom:0"> Anons Mwen yo</div>
 <button class="btn btn-ghost btn-sm" onclick="navigate('post')">+ Ajoute</button>
 </div>
 <div class="table-wrap">
 <table>
 <thead><tr><th>Anons</th><th>Kategori</th><th>Pri</th><th>Vye</th><th>Estati</th><th>Aksyon</th></tr></thead>
 <tbody>
 ${myListings.map(l=>`
 <tr>
 <td><div style="display:flex;align-items:center;gap:10px">
 ${l.images?.[0]?`<img src="${l.images[0]}" style="width:40px;height:32px;object-fit:cover;border-radius:6px">`:'<div style="width:40px;height:32px;background:var(--gray-200);border-radius:6px;display:flex;align-items:center;justify-content:center"></div>'}
 <span style="font-size:.83rem;font-weight:600;max-width:200px" class="truncate">${l.title}</span>
 </div></td>
 <td><span class="badge badge-blue">${getCategoryIcon(l.category)} ${getCategoryLabel(l.category)}</span></td>
 <td style="font-weight:700;color:var(--blue)">${formatPrice(l.price, l.currency)}</td>
 <td>${l.views||0}</td>
 <td><span class="badge badge-green"><span class="status-dot active"></span>Aktif</span></td>
 <td><div style="display:flex;gap:6px">
 <button class="btn btn-ghost btn-sm" onclick="navigate('listing',{id:'${l.id}'})"></button>
 <button class="btn btn-outline btn-sm"></button>
 <button class="btn btn-sm" style="color:var(--red);background:var(--red-light);border:none" onclick="deleteMyListing('${l.id}')"></button>
 </div></td>
 </tr>`).join('')}
 </tbody>
 </table>
 </div>
 </div>
 </div>`;
}

function deleteMyListing(id) {
 if (!confirm('Ou sèten ou vle efase anons sa?')) return;
 const idx = MOCK_LISTINGS.findIndex(l => l.id === id);
 if (idx !== -1) MOCK_LISTINGS.splice(idx, 1);
 saveListingsToStorage();
 toast('Anons efase', 'success');
 renderDashboard();
}

// ── ADMIN DASHBOARD ──────────────────────────────────────────
function renderAdmin() {
 if (!APP.currentProfile?.is_admin) { toast('Aksè refize', 'error'); navigate('home'); return; }

 const container = $('#page-admin');
 if (!container) return;

 container.innerHTML = `
 <div class="dash-layout">
 <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
 <div style="font-size:1.5rem"></div>
 <h1 style="font-size:1.3rem;font-weight:800">Admin Dashboard</h1>
 <span class="badge badge-red">Admin</span>
 </div>
 <div class="dash-grid">
 <div class="stat-card"><div class="stat-icon blue"></div><div><div class="stat-value">${MOCK_LISTINGS.length}</div><div class="stat-label">Total Anons</div></div></div>
 <div class="stat-card"><div class="stat-icon green"></div><div><div class="stat-value">247</div><div class="stat-label">Itilizatè</div></div></div>
 <div class="stat-card"><div class="stat-icon red"></div><div><div class="stat-value">3</div><div class="stat-label">Rapò</div></div></div>
 <div class="stat-card"><div class="stat-icon orange"></div><div><div class="stat-value">12.4k</div><div class="stat-label">Vye Jodi a</div></div></div>
 </div>
 <div class="dash-card">
 <div class="dash-card-title"> Jere Anons yo</div>
 <div class="table-wrap">
 <table>
 <thead><tr><th>Tit</th><th>Itilizatè</th><th>Kategori</th><th>Estati</th><th>Vedette</th><th>Aksyon</th></tr></thead>
 <tbody>
 ${MOCK_LISTINGS.slice(0,8).map(l=>`
 <tr>
 <td class="truncate" style="max-width:180px;font-size:.83rem;font-weight:600">${l.title}</td>
 <td style="font-size:.8rem">@${l.profiles?.username||'user'}</td>
 <td><span class="badge badge-blue">${getCategoryIcon(l.category)}</span></td>
 <td><span class="badge badge-green">Aktif</span></td>
 <td>
 <button class="btn btn-sm ${l.is_featured?'btn-primary':'btn-ghost'}" onclick="adminToggleFeatured('${l.id}',this)">
 ${l.is_featured?' Wi':' Non'}
 </button>
 </td>
 <td><div style="display:flex;gap:6px">
 <button class="btn btn-ghost btn-sm" onclick="navigate('listing',{id:'${l.id}'})"></button>
 <button class="btn btn-sm" style="color:var(--red);background:var(--red-light);border:none" onclick="adminDeleteListing('${l.id}')"></button>
 </div></td>
 </tr>`).join('')}
 </tbody>
 </table>
 </div>
 </div>
 </div>`;
}

function adminToggleFeatured(id, btn) {
 const item = MOCK_LISTINGS.find(l => l.id === id);
 if (!item) return;
 item.is_featured = !item.is_featured;
 btn.innerHTML = item.is_featured ? ' Wi' : ' Non';
 btn.className = `btn btn-sm ${item.is_featured ? 'btn-primary' : 'btn-ghost'}`;
 toast(item.is_featured ? 'Anons vedette!' : 'Pa vedette ankò', 'success');
}

function adminDeleteListing(id) {
 if (!confirm('Efase anons sa pou toujou?')) return;
 const idx = MOCK_LISTINGS.findIndex(l => l.id === id);
 if (idx !== -1) MOCK_LISTINGS.splice(idx, 1);
 toast('Anons efase', 'success');
 renderAdmin();
}

// ── FAVORITES PAGE ───────────────────────────────────────────
function renderFavorites() {
 const container = $('#page-favorites');
 if (!container) return;

 const favItems = MOCK_LISTINGS.filter(l => APP.favorites.has(l.id));
 container.innerHTML = `
 <div style="max-width:1280px;margin:0 auto;padding:24px 16px">
 <h2 style="font-size:1.2rem;font-weight:800;margin-bottom:20px"> Favori Mwen (${favItems.length})</h2>
 ${favItems.length ? `<div class="listings-grid" id="favGrid"></div>` : `
 <div class="empty-state">
 <div class="empty-icon"></div>
 <h3>Pa gen favori ankò</h3>
 <p>Ajoute anons ou renmen yo nan favori</p>
 <button class="btn btn-primary" onclick="navigate('home')">Eksplore Anons yo</button>
 </div>`}
 </div>`;

 if (favItems.length) {
 const grid = $('#favGrid');
 favItems.forEach(l => grid.appendChild(createListingCard(l)));
 }
}

// ── RENDER ABOUT ─────────────────────────────────────────────
function renderAbout() {
 // Static, already in HTML
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
 // Restore Supabase session
 try {
  const { data: { user } } = await Auth.getUser();
  if (user) {
   const profile = await Profiles.getProfile(user.id);
   APP.currentUser = user;
   APP.currentProfile = profile.data;
   updateAuthUI();
  }
 } catch(e) { /* no session */ }

 // Listen for auth changes (Google OAuth redirect, etc.)
 Auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
   const profile = await Profiles.getProfile(session.user.id);
   APP.currentUser = session.user;
   APP.currentProfile = profile.data;
   updateAuthUI();
   closeAuthModal();
  } else {
   APP.currentUser = null;
   APP.currentProfile = null;
   updateAuthUI();
  }
 });

 // Apply saved theme
 applyTheme(APP.theme);

 // Theme toggle
 $('#themeToggle')?.addEventListener('click', () => {
 applyTheme(APP.theme === 'dark' ? 'light' : 'dark');
 });

 // Mobile menu
 $('#mobileMenuBtn')?.addEventListener('click', () => {
 $('#mobileNav')?.classList.toggle('open');
 });

 // Close dropdown on outside click
 document.addEventListener('click', e => {
 if (!e.target.closest('#userMenu')) closeDropdown();
 if (!e.target.closest('#authModal') && !e.target.closest('.nav-btn')) {
 // Keep modal open
 }
 });

 // Auth modal close
 $('#authModal')?.addEventListener('click', e => {
 if (e.target === $('#authModal')) closeAuthModal();
 });

 // Navbar search
 const navSearchInput = $('#navSearchInput');
 const navSearchBtn = $('#navSearchBtn');
 navSearchBtn?.addEventListener('click', () => {
 doSearch(navSearchInput?.value || '');
 });
 navSearchInput?.addEventListener('keydown', e => {
 if (e.key === 'Enter') doSearch(navSearchInput.value);
 });

 // Hero search
 const heroSearchBtn = $('#heroSearchBtn');
 const heroInput = $('#heroSearchInput');
 const heroCategory = $('#heroCategory');
 heroSearchBtn?.addEventListener('click', () => {
 doSearch(heroInput?.value || '', heroCategory?.value || null);
 });
 heroInput?.addEventListener('keydown', e => {
 if (e.key === 'Enter') doSearch(heroInput.value, heroCategory?.value);
 });

 // Auth form handlers
 $('#loginForm')?.addEventListener('submit', handleLogin);
 $('#registerForm')?.addEventListener('submit', handleRegister);

 // Post form handlers
 $('#postForm')?.addEventListener('submit', submitListing);
 $('#imgUploadInput')?.addEventListener('change', handleImageUpload);
 $('#imgUploadZone')?.addEventListener('click', () => $('#imgUploadInput')?.click());
 $('#imgUploadZone')?.addEventListener('dragover', e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--blue)'; });
 $('#imgUploadZone')?.addEventListener('dragleave', e => { e.currentTarget.style.borderColor = ''; });
 $('#imgUploadZone')?.addEventListener('drop', e => {
 e.preventDefault();
 e.currentTarget.style.borderColor = '';
 const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
 handleImageUpload({ target: { files } });
 });

 // Keyboard shortcuts
 document.addEventListener('keydown', e => {
 if (e.key === 'Escape') {
 closeAuthModal();
 closeDropdown();
 }
 if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
 e.preventDefault();
 navSearchInput?.focus();
 }
 });

 // Scroll-aware bottom nav post label
 let lastScrollY = 0;
 const bottomNav = $('#bottomNav');
 window.addEventListener('scroll', () => {
  const currentY = window.scrollY;
  if (currentY > lastScrollY && currentY > 80) {
   bottomNav?.classList.add('scrolled-down');
  } else {
   bottomNav?.classList.remove('scrolled-down');
  }
  lastScrollY = currentY;
 }, { passive: true });

 // Init home page
 navigate('home');
 updateAuthUI();
});

// Expose functions globally for inline onclick handlers
window.navigate = navigate;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.handleGoogleLogin = handleGoogleLogin;
window.toggleDropdown = toggleDropdown;
window.closeDropdown = closeDropdown;
window.toggleFavorite = toggleFavorite;
window.toggleFavDetail = toggleFavDetail;
window.deleteMyListing = deleteMyListing;
window.switchImg = switchImg;
window.doSearch = doSearch;
window.openEditProfile = openEditProfile;
window.submitListing = submitListing;
window.handleImageUpload = handleImageUpload;
window.APP = APP;
window.renderRecentListings = renderRecentListings;
window.renderHome = renderHome;
window.renderFavorites = renderFavorites;
window.renderDashboard = renderDashboard;
window.renderProfile = renderProfile;
window.renderAdmin = renderAdmin;
window.openLegalModal = typeof openLegalModal !== 'undefined' ? openLegalModal : ()=>{};
