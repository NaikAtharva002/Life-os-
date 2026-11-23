// LIFE OS 3.0 — Contextual Photography Asset Catalog
// High-resolution photography assets with descriptive metadata, alt text, and licensing credits.

export interface PhotoAsset {
  path: string;
  alt: string;
  category: string;
  credit: string;
  url?: string;
  fallbackUrl?: string;
}

export const PHOTO_ASSETS = {
  "dashboard-hero": {
    "path": "/images/dashboard/dashboard-hero.jpg",
    "alt": "Misty alpine mountains and evergreen pine valley at sunrise",
    "category": "dashboard",
    "credit": "Bailey Zindel / Unsplash",
    "url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"
  },
  "dashboard-nature": {
    "path": "/images/dashboard/dashboard-nature.jpg",
    "alt": "Sunbeams filtering through tranquil deep forest canopy",
    "category": "dashboard",
    "credit": "Sebastian Unrau / Unsplash",
    "url": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80"
  },
  "dashboard-workspace": {
    "path": "/images/dashboard/dashboard-workspace.jpg",
    "alt": "Minimalist editorial workspace with coffee, notebook and clean desk",
    "category": "dashboard",
    "credit": "Andrew Neel / Unsplash",
    "url": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80"
  },
  "dashboard-focus-timer": {
    "path": "/images/dashboard/dashboard-focus-timer.jpg",
    "alt": "Peaceful dawn over misty mountain lake with glassy reflection",
    "category": "dashboard",
    "credit": "Luca Bravo / Unsplash",
    "url": "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80"
  },
  "goal-tech": {
    "path": "/images/goals/goal-tech.jpg",
    "alt": "High-focus software engineering workspace with mechanical keyboard",
    "category": "goals",
    "credit": "Fotis Fotopoulos / Unsplash",
    "url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
  },
  "goal-finance": {
    "path": "/images/goals/goal-finance.jpg",
    "alt": "Strategic financial ledger, calculator and investment roadmap",
    "category": "goals",
    "credit": "Kelly Sikkema / Unsplash",
    "url": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80"
  },
  "goal-fitness": {
    "path": "/images/goals/goal-fitness.jpg",
    "alt": "Morning trail runner on sunrise mountain ridge",
    "category": "goals",
    "credit": "Jordan Sanchez / Unsplash",
    "url": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80"
  },
  "goal-academics": {
    "path": "/images/goals/goal-academics.jpg",
    "alt": "Atmospheric library bookshelves and warm quiet study table",
    "category": "goals",
    "credit": "Giammarco Boscaro / Unsplash",
    "url": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80"
  },
  "gym-hero": {
    "path": "/images/gym/gym-hero.jpg",
    "alt": "Authentic strength training gym with barbell and iron plates",
    "category": "gym",
    "credit": "Victor Freitas / Unsplash",
    "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80"
  },
  "gym-weights": {
    "path": "/images/gym/gym-weights.jpg",
    "alt": "Dumbbell rack in atmospheric gym with dramatic lighting",
    "category": "gym",
    "credit": "Alora Griffiths / Unsplash",
    "url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80"
  },
  "gym-recovery": {
    "path": "/images/gym/gym-recovery.jpg",
    "alt": "Morning mobility, stretching and athletic recovery space",
    "category": "gym",
    "credit": "Dane Wetton / Unsplash",
    "url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
  },
  "academics-hero": {
    "path": "/images/academics/academics-hero.jpg",
    "alt": "University study desk with hardcover books, notes and coffee",
    "category": "academics",
    "credit": "Scott Graham / Unsplash",
    "url": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80"
  },
  "academics-research": {
    "path": "/images/academics/academics-research.jpg",
    "alt": "Focused academic research, open journal and graphite drafting",
    "category": "academics",
    "credit": "Unsplash Research",
    "url": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80"
  },
  "academics-library": {
    "path": "/images/academics/academics-library.jpg",
    "alt": "Classical architectural university library hall with warm lamps",
    "category": "academics",
    "credit": "Susan Q Yin / Unsplash",
    "url": "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80"
  },
  "finance-hero": {
    "path": "/images/finance/finance-hero.jpg",
    "alt": "Modern architectural glass building and wealth building foundation",
    "category": "finance",
    "credit": "Sean Pollock / Unsplash",
    "url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
  },
  "finance-growth": {
    "path": "/images/finance/finance-growth.jpg",
    "alt": "Botanical growth and thriving natural wealth symbol",
    "category": "finance",
    "credit": "David Vig / Unsplash",
    "url": "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=800&q=80"
  },
  "finance-planning": {
    "path": "/images/finance/finance-planning.jpg",
    "alt": "Clear financial analysis, notebook and executive workspace",
    "category": "finance",
    "credit": "Austin Distel / Unsplash",
    "url": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80"
  },
  "habit-reading": {
    "path": "/images/habits/habit-reading.jpg",
    "alt": "Reading a book in gentle morning sunlight",
    "category": "habits",
    "credit": "Priscilla Du Preez / Unsplash",
    "url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
  },
  "habit-sleep": {
    "path": "/images/habits/habit-sleep.jpg",
    "alt": "Cozy and restful bedroom environment for restorative sleep",
    "category": "habits",
    "credit": "Unsplash",
    "url": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80"
  },
  "habit-hydration": {
    "path": "/images/habits/habit-hydration.jpg",
    "alt": "Pure morning hydration glass with fresh mint",
    "category": "habits",
    "credit": "Unsplash",
    "url": "https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&w=800&q=80"
  },
  "habit-deepwork": {
    "path": "/images/habits/habit-deepwork.jpg",
    "alt": "Deep work coding session with espresso and laptop",
    "category": "habits",
    "credit": "Christopher Gower / Unsplash",
    "url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
  },
  "focus-alpine": {
    "path": "/images/focus/focus-alpine.jpg",
    "alt": "Immersive misty pine forest in alpine autumn",
    "category": "focus",
    "credit": "Luca Bravo / Unsplash",
    "url": "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1600&q=80"
  },
  "focus-forest": {
    "path": "/images/focus/focus-forest.jpg",
    "alt": "Evergreen forest sunbeams and peaceful nature canopy",
    "category": "focus",
    "credit": "Unsplash",
    "url": "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1600&q=80"
  },
  "focus-stream": {
    "path": "/images/focus/focus-stream.jpg",
    "alt": "Pure mountain forest stream running over stones",
    "category": "focus",
    "credit": "Dave Hoefler / Unsplash",
    "url": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80"
  }
} as const;

export type PhotoAssetKey = keyof typeof PHOTO_ASSETS;

export function getPhoto(key: PhotoAssetKey): PhotoAsset {
  return PHOTO_ASSETS[key] || PHOTO_ASSETS['dashboard-hero'];
}
