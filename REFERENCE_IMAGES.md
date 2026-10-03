# 🎨 Reference Image Sources & Fallbacks for Deckle

Until Cloudinary file upload is integrated, you can use these fast, free, CDN-hosted reference image URLs in your API request bodies (`req.body`) and frontend components.

The backend also contains automatic fallbacks in [`Backend/utils/imageReference.js`](file:///c:/Users/yadav/OneDrive/Desktop/Deckle/Backend/utils/imageReference.js):
- If a book is created with no `cover_image`, a genre-matched Unsplash cover or deterministic Picsum cover is automatically assigned.
- If a user/persona is created with no `avatar_url`, a deterministic SVG avatar from DiceBear is automatically assigned.
- If no `banner_url` is provided, a deterministic aesthetic banner is assigned.

---

## 1. 📖 Novel & Book Cover URLs (2:3 Aspect Ratio)

### 🥋 Cultivation / Xianxia / Wuxia
- `https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80` (Mystic mist & floating peaks)
- `https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80` (Alpine river & fog)
- `https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80` (Celestial mountain night)

### 🦾 Cyberpunk / Sci-Fi / Dystopian
- `https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80` (Neon alleyway & rain)
- `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80` (Cyber terminal & interface)
- `https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80` (Dark motherboard / circuits)

### 🗡️ Dark Fantasy / Grimdark / Eldritch
- `https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&auto=format&fit=crop&q=80` (Gloomy gothic castle)
- `https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80` (Eclipse & dark celestial halo)
- `https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80` (Obsidian textures)

### 🌹 Historical Romance / Drama
- `https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80` (Antique tea set & letter)
- `https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format&fit=crop&q=80` (Candlelit warmth)
- `https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&auto=format&fit=crop&q=80` (Vintage roses & journal)

### 🎮 LitRPG / System / VRMMO
- `https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80` (Retro synth gaming station)
- `https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80` (Matrix digital code waterfall)
- `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80` (Abstract geometric neon cube)

### 📚 Minimalist / Literary / Default
- `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80` (Minimalist open book)
- `https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80` (Vintage paper & quill)
- `https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80` (Bookshelf spine aesthetic)

---

## 2. 👤 Avatar Reference URLs

### Deterministic DiceBear Avatars (Dynamic by username)
Generates lightweight SVG avatars that stay the same for a given username:
```http
https://api.dicebear.com/7.x/notionists/svg?seed={username}
https://api.dicebear.com/7.x/bottts/svg?seed={username}
https://api.dicebear.com/7.x/adventurer/svg?seed={username}
```

### Clean UI Initials Avatars
```http
https://ui-avatars.com/api/?name={Full+Name}&background=18181b&color=f4f4f5&bold=true&size=256
```

### High-Resolution Author Portraits (Unsplash)
- `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`
- `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80`
- `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80`
- `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80`
- `https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80`

---

## 3. 🖼️ Profile & Header Banners (Wide 16:9 / 3:1)

- `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80` (Vibrant modern gradient)
- `https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80` (Dark aesthetic mesh)
- `https://images.unsplash.com/photo-1507842229451-7f01be7a50d7?w=1200&auto=format&fit=crop&q=80` (Moody mahogany library)
- `https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80` (Deep space cosmic nebula)
- `https://picsum.photos/seed/{unique_slug}-banner/1200/400` (Dynamic Picsum banner generator)

---

## 4. 🛠️ Backend Integration Details

When testing API endpoints (`POST /api/v1/books/create`, `POST /api/v1/users/register`, `POST /api/v1/personas/create`):
1. **You can omit image fields:** The backend automatically provides high-resolution default covers and avatars matching the novel's genre or username.
2. **You can pass any URL from the catalog above:** It will be saved into the PostgreSQL `cover_image`, `avatar_url`, or `banner_url` fields.
