/**
 * Curated housing photos (Unsplash CDN) used as attractive fallbacks when a
 * listing has no uploaded images yet. `getPropertyImage` picks one
 * deterministically from the listing id so each property always shows the
 * same photo.
 */

const PHOTOS = [
  "photo-1568605114967-8130f3a36994", // suburban house
  "photo-1522708323590-d24dbb6b0267", // apartment interior
  "photo-1502672260266-1c1ef2d93688", // loft apartment
  "photo-1493809842364-78817add7ffb", // living room
  "photo-1560448204-e02f11c3d0e2", // modern apartment
  "photo-1512917774080-9991f1c4c750", // luxury home
  "photo-1600596542815-ffad4c1539a9", // modern house
  "photo-1600585154340-be6161a56a0c", // house exterior
  "photo-1554995207-c18c203602cb", // interior
  "photo-1600607687939-ce8a6c25118c", // interior
];

export function unsplash(id: string, width = 800): string {
  return `https://images.unsplash.com/${id}?q=80&w=${width}&auto=format&fit=crop`;
}

/** Deterministic fallback photo for a listing id. */
export function getPropertyImage(seed: string, width = 800): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return unsplash(PHOTOS[hash % PHOTOS.length], width);
}

/** Photos for the landing-page collage. */
export const HERO_PHOTOS = [
  unsplash(PHOTOS[1], 600),
  unsplash(PHOTOS[0], 600),
  unsplash(PHOTOS[3], 600),
];
