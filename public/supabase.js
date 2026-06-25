// ============================================================
// supabase.js — Ayiti Market
// Configuration Supabase + helpers base de données
// ------------------------------------------------------------
// Konfig (URL/anon key) soti nan /config.js (jenere pa server.js
// soti nan .env). Pa gen okenn kle hardcode isit la. Si .env pa
// configire, klan an ap "demo mode" san l pa kraze sit la.
// ============================================================

const _cfg = window.__SUPABASE_CONFIG__ || {};
const SUPABASE_URL = _cfg.url || '';
const SUPABASE_ANON_KEY = _cfg.anonKey || '';
const SUPABASE_CONFIGURED = Boolean(_cfg.configured);

if (!SUPABASE_CONFIGURED) {
  console.warn('[supabase] SUPABASE_URL/SUPABASE_ANON_KEY pa configire nan .env — mode demo aktive (done mock sèlman, login/post pa ap travay).');
}

// Init client Supabase (via CDN) — null si pa configire, pou evite erè kraze paj
const supabase = SUPABASE_CONFIGURED
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ============================================================
// SQL SCHEMA — Coller dans Supabase SQL Editor
// ============================================================
/*
-- USERS PROFILE (extends auth.users)
CREATE TABLE public.profiles (
 id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
 username TEXT UNIQUE NOT NULL,
 full_name TEXT,
 avatar_url TEXT,
 phone TEXT,
 whatsapp TEXT,
 ville TEXT,
 bio TEXT,
 is_admin BOOLEAN DEFAULT FALSE,
 created_at TIMESTAMPTZ DEFAULT NOW(),
 updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LISTINGS
CREATE TABLE public.listings (
 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
 title TEXT NOT NULL,
 description TEXT,
 price NUMERIC,
 currency TEXT DEFAULT 'HTG',
 category TEXT NOT NULL,
 subcategory TEXT,
 ville TEXT NOT NULL,
 whatsapp TEXT,
 images TEXT[] DEFAULT '{}',
 status TEXT DEFAULT 'active' CHECK (status IN ('active','sold','paused','deleted')),
 views INTEGER DEFAULT 0,
 is_featured BOOLEAN DEFAULT FALSE,
 created_at TIMESTAMPTZ DEFAULT NOW(),
 updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAVORITES
CREATE TABLE public.favorites (
 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
 listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
 created_at TIMESTAMPTZ DEFAULT NOW(),
 UNIQUE(user_id, listing_id)
);

-- MESSAGES
CREATE TABLE public.messages (
 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
 receiver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
 listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
 content TEXT NOT NULL,
 is_read BOOLEAN DEFAULT FALSE,
 created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REPORTS (signalements)
CREATE TABLE public.reports (
 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
 listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
 reason TEXT NOT NULL,
 created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, own write
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Listings: public read active, own write
CREATE POLICY "Public listings" ON public.listings FOR SELECT USING (status = 'active');
CREATE POLICY "Own listings" ON public.listings FOR ALL USING (auth.uid() = user_id);

-- Favorites: own only
CREATE POLICY "Own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- Messages: participants only
CREATE POLICY "Own messages" ON public.messages FOR ALL
 USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
 INSERT INTO public.profiles (id, username, full_name, avatar_url)
 VALUES (
 NEW.id,
 SPLIT_PART(NEW.email, '@', 1),
 NEW.raw_user_meta_data->>'full_name',
 NEW.raw_user_meta_data->>'avatar_url'
 );
 RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
 AFTER INSERT ON auth.users
 FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Increment views function
CREATE OR REPLACE FUNCTION increment_views(listing_id UUID)
RETURNS VOID AS $$
 UPDATE public.listings SET views = views + 1 WHERE id = listing_id;
$$ LANGUAGE sql SECURITY DEFINER;
*/

// ============================================================
// AUTH HELPERS
// ============================================================
const Auth = {
 async signUp(email, password, fullName) {
 const { data, error } = await supabase.auth.signUp({
 email,
 password,
 options: { data: { full_name: fullName } }
 });
 return { data, error };
 },

 async signIn(email, password) {
 const { data, error } = await supabase.auth.signInWithPassword({ email, password });
 return { data, error };
 },

 async signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
   provider: 'google',
   options: { redirectTo: window.location.origin }
  });
  return { data, error };
 },

 async signOut() {
 const { error } = await supabase.auth.signOut();
 return { error };
 },

 async resetPassword(email) {
 const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
 redirectTo: `${window.location.origin}?reset=true`
 });
 return { data, error };
 },

 async getUser() {
 const { data: { user } } = await supabase.auth.getUser();
 return user;
 },

 onAuthChange(callback) {
 return supabase.auth.onAuthStateChange(callback);
 }
};

// ============================================================
// LISTINGS HELPERS
// ============================================================
const Listings = {
 async getAll({ category, ville, search, limit = 20, offset = 0, orderBy = 'created_at' } = {}) {
 let query = supabase
 .from('listings')
 .select(`*, profiles(username, full_name, avatar_url, whatsapp, phone)`)
 .eq('status', 'active')
 .order(orderBy, { ascending: false })
 .range(offset, offset + limit - 1);

 if (category) query = query.eq('category', category);
 if (ville) query = query.ilike('ville', `%${ville}%`);
 if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

 const { data, error } = await query;
 return { data, error };
 },

 async getById(id) {
 const { data, error } = await supabase
 .from('listings')
 .select(`*, profiles(username, full_name, avatar_url, whatsapp, phone, ville)`)
 .eq('id', id)
 .single();

 if (data) {
 await supabase.rpc('increment_views', { listing_id: id });
 }
 return { data, error };
 },

 async create(listing) {
 const user = await Auth.getUser();
 if (!user) return { error: { message: 'Non connecté' } };

 const { data, error } = await supabase
 .from('listings')
 .insert({ ...listing, user_id: user.id })
 .select()
 .single();
 return { data, error };
 },

 async update(id, updates) {
 const { data, error } = await supabase
 .from('listings')
 .update({ ...updates, updated_at: new Date().toISOString() })
 .eq('id', id)
 .select()
 .single();
 return { data, error };
 },

 async delete(id) {
 const { error } = await supabase
 .from('listings')
 .update({ status: 'deleted' })
 .eq('id', id);
 return { error };
 },

 async getByUser(userId) {
 const { data, error } = await supabase
 .from('listings')
 .select('*')
 .eq('user_id', userId)
 .neq('status', 'deleted')
 .order('created_at', { ascending: false });
 return { data, error };
 },

 async getFeatured() {
 const { data, error } = await supabase
 .from('listings')
 .select(`*, profiles(username, avatar_url)`)
 .eq('status', 'active')
 .eq('is_featured', true)
 .order('created_at', { ascending: false })
 .limit(8);
 return { data, error };
 }
};

// ============================================================
// FAVORITES HELPERS
// ============================================================
const Favorites = {
 async toggle(listingId) {
 const user = await Auth.getUser();
 if (!user) return { error: { message: 'Konekte anvan' } };

 const { data: existing } = await supabase
 .from('favorites')
 .select('id')
 .eq('user_id', user.id)
 .eq('listing_id', listingId)
 .single();

 if (existing) {
 const { error } = await supabase.from('favorites').delete().eq('id', existing.id);
 return { data: { action: 'removed' }, error };
 } else {
 const { data, error } = await supabase
 .from('favorites')
 .insert({ user_id: user.id, listing_id: listingId })
 .select()
 .single();
 return { data: { action: 'added', ...data }, error };
 }
 },

 async getByUser() {
 const user = await Auth.getUser();
 if (!user) return { data: [] };

 const { data, error } = await supabase
 .from('favorites')
 .select(`listing_id, listings(*, profiles(username, avatar_url))`)
 .eq('user_id', user.id)
 .order('created_at', { ascending: false });
 return { data, error };
 },

 async isFavorite(listingId) {
 const user = await Auth.getUser();
 if (!user) return false;

 const { data } = await supabase
 .from('favorites')
 .select('id')
 .eq('user_id', user.id)
 .eq('listing_id', listingId)
 .single();
 return !!data;
 }
};

// ============================================================
// PROFILES HELPERS
// ============================================================
const Profiles = {
 async get(userId) {
 const { data, error } = await supabase
 .from('profiles')
 .select('*')
 .eq('id', userId)
 .single();
 return { data, error };
 },

 async update(userId, updates) {
 const { data, error } = await supabase
 .from('profiles')
 .update({ ...updates, updated_at: new Date().toISOString() })
 .eq('id', userId)
 .select()
 .single();
 return { data, error };
 },

 async uploadAvatar(userId, file) {
 const ext = file.name.split('.').pop();
 const path = `avatars/${userId}.${ext}`;

 const { error: uploadError } = await supabase.storage
 .from('media')
 .upload(path, file, { upsert: true });

 if (uploadError) return { error: uploadError };

 const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
 return { url: publicUrl };
 }
};

// ============================================================
// IMAGE UPLOAD HELPER
// ============================================================
const Storage = {
 async uploadListingImage(userId, file, index = 0) {
 const ext = file.name.split('.').pop();
 const path = `listings/${userId}/${Date.now()}_${index}.${ext}`;

 const { error } = await supabase.storage
 .from('media')
 .upload(path, file, { upsert: false });

 if (error) return { error };

 const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
 return { url: publicUrl };
 }
};

// ============================================================
// ADMIN HELPERS
// ============================================================
const Admin = {
 async getStats() {
 const [listings, users, favorites] = await Promise.all([
 supabase.from('listings').select('id, status, created_at', { count: 'exact' }),
 supabase.from('profiles').select('id', { count: 'exact' }),
 supabase.from('favorites').select('id', { count: 'exact' })
 ]);
 return {
 totalListings: listings.count || 0,
 totalUsers: users.count || 0,
 totalFavorites: favorites.count || 0
 };
 },

 async getAllListings() {
 const { data, error } = await supabase
 .from('listings')
 .select(`*, profiles(username, full_name)`)
 .neq('status', 'deleted')
 .order('created_at', { ascending: false });
 return { data, error };
 },

 async featureListing(id, featured) {
 return supabase.from('listings').update({ is_featured: featured }).eq('id', id);
 },

 async deleteListing(id) {
 return supabase.from('listings').update({ status: 'deleted' }).eq('id', id);
 }
};
