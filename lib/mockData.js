// ============================================================
// lib/mockData.js — Done demo pataje (server + kliyan)
// ------------------------------------------------------------
// Sèvi sèlman kòm fallback lè Supabase pa configire.
// Lè ou branche Supabase, fichye sa a pa itilize ankò.
// ============================================================

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
  'Port-au-Prince', 'Pétionville', 'Delmas', 'Carrefour', 'Tabarre',
  'Croix-des-Bouquets', 'Cap-Haïtien', 'Gonaïves', 'Les Cayes',
  'Jacmel', 'Saint-Marc', 'Jérémie', 'Hinche', 'Miragoâne', 'Léogâne',
];

const MOCK_LISTINGS = [
  { id: '1', title: 'iPhone 15 Pro Max 256GB Nwa', description: 'iPhone 15 Pro Max nèf nan bwat, 256GB, koulè nwa. Garanti 6 mwa.', price: 85000, currency: 'HTG', category: 'phones', ville: 'Pétionville', images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80'], created_at: '2026-06-20', views: 342, profiles: { username: 'maxtech', avatar_url: null, whatsapp: '50912345678' }, is_featured: true },
  { id: '2', title: 'Toyota Corolla 2019 Bon Kondisyon', description: 'Toyota Corolla 2019, kilomèt ba, papye anlè, motè ak transmisyon an bon eta.', price: 1850000, currency: 'HTG', category: 'cars', ville: 'Port-au-Prince', images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80'], created_at: '2026-06-19', views: 218, profiles: { username: 'carhaiti', avatar_url: null, whatsapp: '50912345678' } },
  { id: '3', title: 'Appatman 3 chanm Pétionville', description: 'Apatman 3 chanm, 2 twalèt, gàraj, jaden, nan yon zòn trankil Pétionville.', price: 45000, currency: 'HTG', category: 'realestate', ville: 'Pétionville', images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'], created_at: '2026-06-18', views: 189, profiles: { username: 'immoHaiti', avatar_url: null, whatsapp: '50912345678' }, is_featured: true },
  { id: '4', title: 'Samsung Galaxy S24 Ultra Blan', description: 'Samsung Galaxy S24 Ultra, 256GB, koulè blan, akseswa konplè.', price: 72000, currency: 'HTG', category: 'phones', ville: 'Delmas', images: ['https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=800&q=80'], created_at: '2026-06-18', views: 156, profiles: { username: 'techshop509', avatar_url: null, whatsapp: '50912345678' } },
  { id: '5', title: 'Moto Honda CB500 2022', description: 'Moto Honda CB500, 2022, byen antretyen, papye anlè.', price: 620000, currency: 'HTG', category: 'cars', ville: 'Cap-Haïtien', images: ['https://images.unsplash.com/photo-1558981285-6f0c68243e14?w=800&q=80'], created_at: '2026-06-17', views: 201, profiles: { username: 'motoking', avatar_url: null, whatsapp: '50912345678' } },
  { id: '6', title: 'Chèz salon modèn 6 plas', description: 'Chèz salon 6 plas, style modèn, tisi premye kalite.', price: 38000, currency: 'HTG', category: 'furniture', ville: 'Port-au-Prince', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'], created_at: '2026-06-17', views: 94, profiles: { username: 'meblhaiti', avatar_url: null, whatsapp: '50912345678' } },
  { id: '7', title: 'Sèvis Plombri ak Elektrisite', description: 'Sèvis pwofesyonèl plombri ak enstalasyon elektrik. Disponib 7/7.', price: 5000, currency: 'HTG', category: 'services', ville: 'Carrefour', images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80'], created_at: '2026-06-16', views: 67, profiles: { username: 'handy_man509', avatar_url: null, whatsapp: '50912345678' } },
  { id: '8', title: 'Rad Fèt Designer Brand Nouvo', description: 'Rad fèt mak orijinal, tay disponib, nèf nan etikèt.', price: 12000, currency: 'HTG', category: 'fashion', ville: 'Pétionville', images: ['https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80'], created_at: '2026-06-16', views: 143, profiles: { username: 'fashionHT', avatar_url: null, whatsapp: '50912345678' } },
  { id: '9', title: 'MacBook Pro M3 16 pous', description: 'MacBook Pro M3, 16 pous, 512GB SSD, 16GB RAM, tankou nèf.', price: 145000, currency: 'HTG', category: 'phones', ville: 'Tabarre', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'], created_at: '2026-06-15', views: 278, profiles: { username: 'macstore', avatar_url: null, whatsapp: '50912345678' }, is_featured: true },
  { id: '10', title: 'Tèren 500m² Delmas 33', description: 'Tèren 500 mèt kare, lokalize Delmas 33, papye anrejistre.', price: 2500000, currency: 'HTG', category: 'realestate', ville: 'Delmas', images: ['https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80'], created_at: '2026-06-15', views: 315, profiles: { username: 'terrain509', avatar_url: null, whatsapp: '50912345678' } },
  { id: '11', title: 'Réfrigérateur LG Double Pòt Nouvo', description: 'Refrijeratè LG double pòt, nèf nan bwat, garanti 1 an.', price: 55000, currency: 'HTG', category: 'furniture', ville: 'Port-au-Prince', images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80'], created_at: '2026-06-14', views: 88, profiles: { username: 'electroHT', avatar_url: null, whatsapp: '50912345678' } },
  { id: '12', title: 'Chyen Berger Alman 3 mwa', description: 'Chyen Berger Alman, 3 mwa, vaksinen, papye disponib.', price: 25000, currency: 'HTG', category: 'animals', ville: 'Pétionville', images: ['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&q=80'], created_at: '2026-06-14', views: 201, profiles: { username: 'petshop509', avatar_url: null, whatsapp: '50912345678' } },
];

module.exports = { CATEGORIES, VILLES, MOCK_LISTINGS };
