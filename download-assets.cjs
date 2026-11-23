const fs = require('fs');
const path = require('path');

const IMAGES = [
  // Dashboard
  {
    category: 'dashboard',
    name: 'dashboard-hero.jpg',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    alt: 'Misty alpine mountains and evergreen pine valley at sunrise',
    credit: 'Bailey Zindel / Unsplash'
  },
  {
    category: 'dashboard',
    name: 'dashboard-nature.jpg',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    alt: 'Sunbeams filtering through tranquil deep forest canopy',
    credit: 'Sebastian Unrau / Unsplash'
  },
  {
    category: 'dashboard',
    name: 'dashboard-workspace.jpg',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    alt: 'Minimalist editorial workspace with coffee, notebook and clean desk',
    credit: 'Andrew Neel / Unsplash'
  },
  {
    category: 'dashboard',
    name: 'dashboard-focus-timer.jpg',
    url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80',
    alt: 'Peaceful dawn over misty mountain lake with glassy reflection',
    credit: 'Luca Bravo / Unsplash'
  },

  // Goals
  {
    category: 'goals',
    name: 'goal-tech.jpg',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    alt: 'High-focus software engineering workspace with mechanical keyboard',
    credit: 'Fotis Fotopoulos / Unsplash'
  },
  {
    category: 'goals',
    name: 'goal-finance.jpg',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    alt: 'Strategic financial ledger, calculator and investment roadmap',
    credit: 'Kelly Sikkema / Unsplash'
  },
  {
    category: 'goals',
    name: 'goal-fitness.jpg',
    url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
    alt: 'Morning trail runner on sunrise mountain ridge',
    credit: 'Jordan Sanchez / Unsplash'
  },
  {
    category: 'goals',
    name: 'goal-academics.jpg',
    url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
    alt: 'Atmospheric library bookshelves and warm quiet study table',
    credit: 'Giammarco Boscaro / Unsplash'
  },

  // Gym / Fitness
  {
    category: 'gym',
    name: 'gym-hero.jpg',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    alt: 'Authentic strength training gym with barbell and iron plates',
    credit: 'Victor Freitas / Unsplash'
  },
  {
    category: 'gym',
    name: 'gym-weights.jpg',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    alt: 'Dumbbell rack in atmospheric gym with dramatic lighting',
    credit: 'Alora Griffiths / Unsplash'
  },
  {
    category: 'gym',
    name: 'gym-recovery.jpg',
    url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    alt: 'Morning mobility, stretching and athletic recovery space',
    credit: 'Dane Wetton / Unsplash'
  },

  // Academics
  {
    category: 'academics',
    name: 'academics-hero.jpg',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    alt: 'University study desk with hardcover books, notes and coffee',
    credit: 'Scott Graham / Unsplash'
  },
  {
    category: 'academics',
    name: 'academics-research.jpg',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    alt: 'Focused academic research, open journal and graphite drafting',
    credit: 'Unsplash Research'
  },
  {
    category: 'academics',
    name: 'academics-library.jpg',
    url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80',
    alt: 'Classical architectural university library hall with warm lamps',
    credit: 'Susan Q Yin / Unsplash'
  },

  // Finance
  {
    category: 'finance',
    name: 'finance-hero.jpg',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    alt: 'Modern architectural glass building and wealth building foundation',
    credit: 'Sean Pollock / Unsplash'
  },
  {
    category: 'finance',
    name: 'finance-growth.jpg',
    url: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=800&q=80',
    alt: 'Botanical growth and thriving natural wealth symbol',
    credit: 'David Vig / Unsplash'
  },
  {
    category: 'finance',
    name: 'finance-planning.jpg',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    alt: 'Clear financial analysis, notebook and executive workspace',
    credit: 'Austin Distel / Unsplash'
  },

  // Habits
  {
    category: 'habits',
    name: 'habit-reading.jpg',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    alt: 'Reading a book in gentle morning sunlight',
    credit: 'Priscilla Du Preez / Unsplash'
  },
  {
    category: 'habits',
    name: 'habit-sleep.jpg',
    url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    alt: 'Cozy and restful bedroom environment for restorative sleep',
    credit: 'Unsplash'
  },
  {
    category: 'habits',
    name: 'habit-hydration.jpg',
    url: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&w=800&q=80',
    alt: 'Pure morning hydration glass with fresh mint',
    credit: 'Unsplash'
  },
  {
    category: 'habits',
    name: 'habit-deepwork.jpg',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    alt: 'Deep work coding session with espresso and laptop',
    credit: 'Christopher Gower / Unsplash'
  },

  // Focus Mode
  {
    category: 'focus',
    name: 'focus-alpine.jpg',
    url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1600&q=80',
    alt: 'Immersive misty pine forest in alpine autumn',
    credit: 'Luca Bravo / Unsplash'
  },
  {
    category: 'focus',
    name: 'focus-forest.jpg',
    url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1600&q=80',
    alt: 'Evergreen forest sunbeams and peaceful nature canopy',
    credit: 'Unsplash'
  },
  {
    category: 'focus',
    name: 'focus-stream.jpg',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80',
    alt: 'Pure mountain forest stream running over stones',
    credit: 'Dave Hoefler / Unsplash'
  }
];

// Fallback SVG generator for offline reliability
function generateSvgFallback(title, color1, color2) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="100%" stop-color="${color2}"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#g)"/>
    <circle cx="600" cy="400" r="280" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
    <text x="600" y="420" font-family="system-ui, sans-serif" font-size="28" font-weight="600" fill="rgba(255,255,255,0.7)" text-anchor="middle" letter-spacing="2">${title}</text>
  </svg>`;
}

async function main() {
  const publicDir = path.resolve(__dirname, 'public');
  const imagesBaseDir = path.join(publicDir, 'images');

  if (!fs.existsSync(imagesBaseDir)) {
    fs.mkdirSync(imagesBaseDir, { recursive: true });
  }

  console.log(`Downloading ${IMAGES.length} contextual photography assets...`);

  const manifest = {};

  for (const img of IMAGES) {
    const catDir = path.join(imagesBaseDir, img.category);
    if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
    }

    const filePath = path.join(catDir, img.name);
    const relPath = `/images/${img.category}/${img.name}`;

    manifest[img.name.replace('.jpg', '')] = {
      path: relPath,
      alt: img.alt,
      category: img.category,
      credit: img.credit,
      url: img.url
    };

    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
      console.log(`[Already exists] ${relPath}`);
      continue;
    }

    try {
      console.log(`[Fetching] ${img.name}...`);
      const res = await fetch(img.url, { headers: { 'User-Agent': 'LifeOS/3.0 AssetDownloader' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(filePath, buf);
      console.log(`[Saved] ${relPath} (${Math.round(buf.length / 1024)} KB)`);
    } catch (err) {
      console.warn(`[Warning] Failed to fetch ${img.url}: ${err.message}. Generating local vector fallback.`);
      const svgFallback = generateSvgFallback(img.alt, '#0f241d', '#081410');
      fs.writeFileSync(filePath.replace('.jpg', '.svg'), svgFallback);
      manifest[img.name.replace('.jpg', '')].path = relPath.replace('.jpg', '.svg');
    }
  }

  // Generate TypeScript asset catalog
  const tsContent = `// LIFE OS 3.0 — Contextual Photography Asset Catalog
// High-resolution photography assets with descriptive metadata, alt text, and licensing credits.

export interface PhotoAsset {
  path: string;
  alt: string;
  category: string;
  credit: string;
  url?: string;
  fallbackUrl?: string;
}

export const PHOTO_ASSETS = ${JSON.stringify(manifest, null, 2)} as const;

export type PhotoAssetKey = keyof typeof PHOTO_ASSETS;

export function getPhoto(key: PhotoAssetKey): PhotoAsset {
  return PHOTO_ASSETS[key] || PHOTO_ASSETS['dashboard-hero'];
}
`;

  const tsPath = path.resolve(__dirname, 'src', 'utils', 'photoAssets.ts');
  fs.writeFileSync(tsPath, tsContent);
  console.log(`Generated photo assets registry at ${tsPath}`);
  console.log('All image assets curated successfully!');
}

main().catch(console.error);
