# Ayiti Market — Server SEO (Node.js / Express)

Sa a se vèsyon Ayiti Market ki gen yon **vrè server Node.js** dèyè l, pou
rezoud 3 pwoblèm SEO yo te idantifye:

1. ✅ **sitemap.xml** — jenere otomatikman ak tout anons aktif yo (`/sitemap.xml`)
2. ✅ **OG image dinamik** — chak anons gen pwòp foto/tit/pri li lè ou pataje l sou WhatsApp, Facebook, etc.
3. ✅ **Schema.org** — chak anons gen `Product` + `BreadcrumbList` JSON-LD pou Google rich results

## Kijan li mache

- `/annonce/ID-tit-anons` → server a li done anons lan, enjekte meta/OG/Schema.org
  **anvan** li voye HTML bay navigatè a. Sa fè WhatsApp/Facebook/Google wè bon
  enfòmasyon yo san yo pa bezwen egzekite JavaScript.
- `/sitemap.xml` → jenere lis tout anons aktif yo + URL prensipal yo, an tan reyèl.
- Rès sit la (paj akèy, rechèch, post, dashboard, admin...) mache **menm jan
  jan l te mache anvan** — pa gen redesign, pa gen chanjman nan style.css.

## Mòd "Demo" vs Mòd "Supabase"

Server a **detekte otomatikman** si ou konfigire Supabase:

- **Si ou PA mete `SUPABASE_URL`/`SUPABASE_ANON_KEY`** → li itilize done demo
  (12 anons egzanp) — sa pèmèt ou teste/demontre sit la san erè.
- **Si ou mete yo** → li li VRÈ anons yo nan baz done Supabase ou a,
  otomatikman, san ou pa bezwen touche okenn lòt kòd.

## Kijan pou deplwaye sou Render (etap pa etap, mobil)

### 1. Mete kòd la sou GitHub
Telechaje tout dosye sa a sou yon repo GitHub (menm jan ou konn fè deja —
upload fichye yo dirèkteman sou dashboard GitHub).

⚠️ **Pa mete dosye `node_modules` si li la** — Render ap enstale l li menm.

### 2. Kreye yon "Web Service" sou Render
1. Ale sou [render.com](https://render.com) → **New** → **Web Service**
2. Konekte repo GitHub ou a
3. Ranpli konfigirasyon:
   - **Name**: `ayiti-market` (oswa non ou vle)
   - **Region**: chwazi pi pre Ayiti (egz. Ohio oswa Virginia)
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` pou kòmanse (ka gen delè 30-60s si sit pa itilize pandan yon ti tan)

### 3. Ajoute Environment Variables
Anba "Environment", ajoute (si ou gen Supabase pare):

| Key | Value |
|---|---|
| `SUPABASE_URL` | URL pwojè Supabase ou |
| `SUPABASE_ANON_KEY` | Kle anonim Supabase ou |
| `SITE_URL` | `https://[non-app-ou].onrender.com` (oswa domèn pèsonalize ou) |

Si ou pa gen Supabase pare ankò, kite yo vid — sit la ap mache an mòd demo.

### 4. Deploy
Klike **Create Web Service**. Render ap bati epi lanse sit la otomatikman.
Apre 2-5 minit, ou ap gen yon URL tankou `https://ayiti-market.onrender.com`.

### 5. (Pita) Konekte domèn pèsonalize
Si ou gen `ayitimarket.com`, ale nan "Settings" → "Custom Domain" sou Render,
ajoute domèn ou, epi swiv enstriksyon DNS yo (ou ka fè sa sou dashboard
domèn ou a, menm jan ou te fè pou Vercel).

### 6. Tcheke si tout bagay mache
- `https://ou-domèn.com/sitemap.xml` → dwe montre lis URL anons yo
- `https://ou-domèn.com/annonce/ID-tit` → dwe montre paj anons ak bon tit
- Teste pataj sou WhatsApp: voye yon lyen anons bay tèt ou, verifye imaj/tit parèt kòrèkteman

## Estrikti fichye

```
ayiti-market-server/
├── server.js              # Server Express prensipal — tout wout yo
├── package.json
├── .env.example            # Modèl varyab anviwònman
├── lib/
│   ├── db.js               # Koneksyon Supabase + fallback demo
│   ├── render.js           # Enjeksyon SEO/OG/Schema.org nan HTML
│   └── mockData.js         # Done demo (12 anons egzanp)
└── public/
    ├── index.html           # SPA prensipal (orijinal, ak mak SEO_BLOCK)
    ├── script.js             # Lojik SPA (chanje pou itilize /api/listings)
    ├── style.css             # San chanjman
    └── supabase.js           # Helpers Supabase orijinal (poko itilize pa server)
```

## Pwochèn etap (lè w pare)

Lè w gen kle Supabase ou yo:
1. Mete yo nan Environment Variables sou Render (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)
2. Asire w tab `listings` la egziste (script SQL la deja nan `public/supabase.js`)
3. Restart sèvis la sou Render — tout bagay ap chanje pou itilize vrè done san
   ou pa bezwen modifye okenn kòd ankò.

## OG image — limit pou konnen

OG image dinamik la itilize **premye foto anons lan dirèkteman** (pa yon
imaj jenere espesyalman ak tit/pri anlè l, tankou kèk sit fè ak Canvas/Satori).
Si yon jou ou vle yon imaj OG "design" (ak badge pri, logo, etc.), n ka ajoute
sa pita ak yon librairi tankou `@vercel/og` oswa Canvas — se yon etap anplis,
pa nesesè pou rezoud pwoblèm SEO debaz la.
