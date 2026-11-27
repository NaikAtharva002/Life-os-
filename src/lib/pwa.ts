export interface PwaStateCallbacks {
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
}

let waitingWorker: ServiceWorker | null = null;

/**
 * Registers /sw.js only in production browser environments so Vite dev HMR
 * is never shadowed by service-worker caching.
 */
export async function registerLifeOSServiceWorker(
  callbacks: PwaStateCallbacks = {}
): Promise<() => Promise<void>> {
  const noopApply = async () => {};

  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !import.meta.env.PROD
  ) {
    return noopApply;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

    if (registration.waiting) {
      waitingWorker = registration.waiting;
      callbacks.onNeedRefresh?.();
    }

    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      if (!installing) return;
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            waitingWorker = installing;
            callbacks.onNeedRefresh?.();
          } else {
            callbacks.onOfflineReady?.();
          }
        }
      });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    return async () => {
      if (waitingWorker) {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      }
    };
  } catch (err) {
    console.warn('[LIFE OS PWA] Service Worker registration failed:', err);
    return noopApply;
  }
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const SESSION_NVIDIA_KEY_STORAGE = 'lifeos_session_nvidia_key';

export function getSessionNvidiaKey(): string {
  try {
    return sessionStorage.getItem(SESSION_NVIDIA_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setSessionNvidiaKey(value: string): void {
  try {
    const cleaned = value.trim();
    if (!cleaned) {
      sessionStorage.removeItem(SESSION_NVIDIA_KEY_STORAGE);
    } else {
      sessionStorage.setItem(SESSION_NVIDIA_KEY_STORAGE, cleaned);
    }
  } catch {
    // ignore private browsing restrictions
  }
}
