import React, { useEffect, useId, useRef, useState } from 'react';
import liquidGL, { type LiquidGLLensInstance } from 'liquid-gl';

export type LiquidGlassVariant = 'pill' | 'orb' | 'panel' | 'menu' | 'chip';

interface LiquidGlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: LiquidGlassVariant;
  snapshotSelector?: string;
  interactiveFluid?: boolean;
  refraction?: number;
  aberration?: number;
  frost?: number;
  bevelDepth?: number;
  bevelWidth?: number;
  theme?: 'dark' | 'light';
  enableShader?: boolean;
  children: React.ReactNode;
}

let cachedEnginePromise: Promise<'webgl2' | 'webgl' | 'webgpu' | null> | null = null;

async function detectBestLiquidEngine(): Promise<'webgl2' | 'webgl' | 'webgpu' | null> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '')) return null;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return null;

  try {
    // Prefer battle-tested WebGL2 first to avoid adapterless/stalled WebGPU contexts in headless/webview browsers
    const testCanvas = document.createElement('canvas');
    if (testCanvas.getContext('webgl2')) return 'webgl2';
    if (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')) {
      return 'webgl';
    }
    const navGpu = (navigator as unknown as { gpu?: { requestAdapter?: () => Promise<unknown | null> } }).gpu;
    if (navGpu && typeof navGpu.requestAdapter === 'function') {
      const adapter = await navGpu.requestAdapter();
      if (adapter) return 'webgpu';
    }
    return null;
  } catch {
    return null;
  }
}

function getBestLiquidEngine(): Promise<'webgl2' | 'webgl' | 'webgpu' | null> {
  if (!cachedEnginePromise) {
    cachedEnginePromise = detectBestLiquidEngine();
  }
  return cachedEnginePromise;
}

const VARIANT_PRESETS: Record<
  LiquidGlassVariant,
  {
    refraction: number;
    aberration: number;
    bevelDepth: number;
    bevelWidth: number;
    frost: number;
    magnify: number;
  }
> = {
  pill: {
    refraction: 0.015,
    aberration: 0.024,
    bevelDepth: 0.072,
    bevelWidth: 0.14,
    frost: 3.4,
    magnify: 1.05,
  },
  orb: {
    refraction: 0.02,
    aberration: 0.03,
    bevelDepth: 0.095,
    bevelWidth: 0.22,
    frost: 2.6,
    magnify: 1.12,
  },
  panel: {
    refraction: 0.008,
    aberration: 0.01,
    bevelDepth: 0.042,
    bevelWidth: 0.085,
    frost: 4.2,
    magnify: 1.02,
  },
  menu: {
    refraction: 0.008,
    aberration: 0.012,
    bevelDepth: 0.048,
    bevelWidth: 0.1,
    frost: 6.0,
    magnify: 1.02,
  },
  chip: {
    refraction: 0.009,
    aberration: 0.012,
    bevelDepth: 0.045,
    bevelWidth: 0.14,
    frost: 3.0,
    magnify: 1.02,
  },
};

/**
 * Separates the liquidGL optical shader lens from interactive React children (`data-liquid-ignore`)
 * so text stays crisp, inputs remain clickable, StrictMode mounts/unmounts clean up GPU resources,
 * and CSS backdrop-filter activates automatically whenever GPU/WebGL is unavailable.
 */
export const LiquidGlassSurface: React.FC<LiquidGlassSurfaceProps> = ({
  variant = 'panel',
  snapshotSelector = '.rit-snapshot-stage',
  interactiveFluid = false,
  refraction,
  aberration,
  frost,
  bevelDepth,
  bevelWidth,
  theme = 'dark',
  enableShader = true,
  className = '',
  style,
  children,
  ...rest
}) => {
  const uid = useId().replace(/:/g, '');
  const targetClass = `rit-gl-lens-${uid}`;
  const lensRef = useRef<HTMLDivElement | null>(null);
  const [shaderActive, setShaderActive] = useState(false);

  useEffect(() => {
    if (!enableShader || !lensRef.current) {
      return;
    }

    let cancelled = false;
    let mountedLens: LiquidGLLensInstance | null = null;
    let rafId = 0;

    getBestLiquidEngine().then((engine) => {
      if (cancelled || !engine || !lensRef.current) return;

      const preset = VARIANT_PRESETS[variant];
      const tint =
        theme === 'light'
          ? variant === 'menu'
            ? 'rgba(255, 255, 255, 0.72)'
            : variant === 'pill' || variant === 'orb'
            ? 'rgba(255, 255, 255, 0.44)'
            : 'rgba(255, 255, 255, 0.28)'
          : variant === 'menu'
          ? 'rgba(13, 16, 28, 0.78)'
          : variant === 'pill' || variant === 'orb'
          ? 'rgba(12, 16, 28, 0.62)'
          : 'rgba(12, 16, 28, 0.40)';

      const isCoarsePointer =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(pointer: coarse)').matches;

      rafId = requestAnimationFrame(() => {
        if (cancelled || !lensRef.current) return;
        try {
          const result = liquidGL({
            target: `.${targetClass}`,
            snapshot: document.querySelector(snapshotSelector) ? snapshotSelector : 'body',
            engine,
            resolution: 1.5,
            zIndex: 8,
            content: false,
            refraction: refraction ?? preset.refraction,
            aberration: aberration ?? preset.aberration,
            bevelDepth: bevelDepth ?? preset.bevelDepth,
            bevelWidth: bevelWidth ?? preset.bevelWidth,
            frost: frost ?? preset.frost,
            shadow: true,
            specular: true,
            reveal: 'none',
            interaction: interactiveFluid && !isCoarsePointer ? 'fluid' : 'none',
            interactionStrength: 0.25,
            interactionRadius: 0.28,
            interactionViscosity: 0.72,
            magnify: preset.magnify,
            tint,
            helper: false,
            on: {
              init: () => {
                if (!cancelled) setShaderActive(true);
              },
            },
          });
          mountedLens = Array.isArray(result) ? result[0] || null : result || null;
        } catch {
          if (!cancelled) setShaderActive(false);
        }
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      setShaderActive(false);
      if (mountedLens) {
        try {
          mountedLens.destroy();
        } catch {
          // Ignore teardown errors if DOM node already detached
        }
      }
    };
  }, [
    enableShader,
    targetClass,
    snapshotSelector,
    variant,
    interactiveFluid,
    refraction,
    aberration,
    frost,
    bevelDepth,
    bevelWidth,
    theme,
  ]);

  return (
    <div
      className={`rit-glass-shell rit-glass-${variant} ${shaderActive ? 'is-webgl' : 'is-css-fallback'} ${className}`}
      style={style}
      data-gl-mode={shaderActive ? 'shader' : 'css'}
      {...rest}
    >
      <div
        ref={lensRef}
        className={`rit-gl-pane ${targetClass}`}
        aria-hidden="true"
      />
      <div className="rit-gl-rim" aria-hidden="true" />
      <div className="rit-gl-foreground" data-liquid-ignore="">
        {children}
      </div>
    </div>
  );
};
