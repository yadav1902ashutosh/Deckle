/**
 * REFERENCE IMAGE HELPER MODULE
 * Provides curated, reliable image URLs and dynamic fallbacks (Unsplash, Picsum, DiceBear, UI-Avatars)
 * for books, personas, and users until Cloudinary file uploads are configured.
 */

// Curated high-res book covers categorized by popular webnovel genres (Unsplash 2:3 aspect ratio)
export const GENRE_COVERS = {
  cultivation: [
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80", // Mystical mist & peaks
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80", // Alpine river & fog
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80"  // Starry mountains
  ],
  cyberpunk: [
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80", // Neon alleyway
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80", // Cyberpunk terminal
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80"  // Tech circuit macro
  ],
  "dark-fantasy": [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80", // Obsidian gothic
    "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&auto=format&fit=crop&q=80", // Gloomy castle
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80"  // Eclipse / dark moon
  ],
  romance: [
    "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80", // Gilded tea & antique
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format&fit=crop&q=80", // Romantic candlelight
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&auto=format&fit=crop&q=80"  // Vintage letters & roses
  ],
  litrpg: [
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80", // Arcade neon hardware
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80", // Matrix code screen
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"  // Hologram cube
  ],
  default: [
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80", // Classic minimal book cover
    "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80", // Open manuscript
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80"  // Aesthetic bookshelf
  ]
};

// Curated banner images for profiles and author pages (16:9 or 3:1 aspect ratio)
export const BANNER_PRESETS = [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80", // Minimal gradient
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80", // Dark mesh gradient
  "https://images.unsplash.com/photo-1507842229451-7f01be7a50d7?w=1200&auto=format&fit=crop&q=80", // Library hallway
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80", // Deep space nebula
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80"  // Dark tech texture
];

/**
 * Returns a fallback cover image for a novel based on tags or slug.
 * Uses Picsum deterministic seeding or genre matching.
 */
export function getFallbackBookCover(slug = "novel", tags = []) {
  if (Array.isArray(tags) && tags.length > 0) {
    for (const tag of tags) {
      const normalizedTag = tag.toLowerCase().trim();
      if (GENRE_COVERS[normalizedTag]) {
        const pool = GENRE_COVERS[normalizedTag];
        return pool[Math.floor(Math.random() * pool.length)];
      }
    }
  }
  // Deterministic fallback based on slug so the image remains stable for the book
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/600/900`;
}

/**
 * Returns a deterministic modern avatar URL based on username or persona handle.
 * Uses DiceBear Notionists style (SVG, zero external dependencies).
 */
export function getFallbackAvatar(seed = "user") {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e5e7eb,f3f4f6,d1d5db`;
}

/**
 * Returns a deterministic modern banner URL based on username or persona handle.
 */
export function getFallbackBanner(seed = "banner") {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}-banner/1200/400`;
}
