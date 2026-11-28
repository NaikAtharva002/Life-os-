import React, { useEffect, useId, useMemo, useState } from 'react';
import useStore from '../store/useStore';

interface LiquidGlassSurfaceProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  frost?: number;
  refraction?: number;
  interactive?: boolean;
}

function canUseWebGL(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (/jsdom/i.test(navigator.userAgent)) return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true });
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * Progressive Liquid Glass wrapper powered by liquid-gl.
 * Uses a high-contrast inner reading layer and automatically degrades
 * to pure CSS backdrop-filter when reduced-motion is enabled or WebGL is unavailable.
 */
export const LiquidGlassSurface: React.FC<LiquidGlassSurfaceProps> = ({
  children,
  className = '',
  style,
  frost = 6,
  refraction = 0.015,
  interactive = true,
}) => {
  const reactId = useId();
  const liquidTargetId = useMemo(
    () => `lgl-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
    [reactId]
  );
  const theme = useStore((s) => s.settings.theme);
  const [glActive, setGlActive] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !canUseWebGL()) {
      setGlActive(false);
      return;
    }

    const hostEl = document.querySelector(`[data-liquid-id="${liquidTargetId}"]`) as HTMLElement | null;
    if (!hostEl || hostEl.offsetWidth === 0 || hostEl.offsetHeight === 0) {
      setGlActive(false);
      return;
    }

    let cancelled = false;
    let instance: { destroy?: () => void } | null = null;

    import('liquid-gl')
      .then((mod) => {
        if (cancelled) return;
        const liquidGL = mod.default;
        if (typeof liquidGL !== 'function') return;
        instance = liquidGL({
          engine: 'auto',
          snapshot: 'body',
          target: `[data-liquid-id="${liquidTargetId}"]`,
          resolution: 1.35,
          refraction,
          aberration: 0.018,
          bevelDepth: 0.055,
          bevelWidth: 0.12,
          frost,
          shadow: true,
          specular: true,
          interaction: interactive ? 'fluid' : 'none',
          tint:
            theme === 'light'
              ? 'rgba(255, 255, 255, 0.72)'
              : 'rgba(17, 17, 22, 0.72)',
        });
        if (instance) {
          setGlActive(true);
        }
      })
      .catch(() => {
        if (!cancelled) setGlActive(false);
      });

    return () => {
      cancelled = true;
      try {
        instance?.destroy?.();
      } catch {
        // Ignore teardown errors if the underlying canvas context already unmounted.
      }
      setGlActive(false);
    };
  }, [frost, interactive, liquidTargetId, refraction, theme]);

  const glassShellStyle: React.CSSProperties = {
    position: 'relative',
    background:
      theme === 'light'
        ? 'linear-gradient(155deg, rgba(255, 255, 255, 0.94), rgba(244, 244, 246, 0.9))'
        : 'linear-gradient(155deg, rgba(20, 20, 26, 0.92), rgba(14, 14, 18, 0.9))',
    backdropFilter: 'blur(20px) saturate(155%)',
    WebkitBackdropFilter: 'blur(20px) saturate(155%)',
    border:
      theme === 'light'
        ? '1px solid rgba(24, 24, 27, 0.14)'
        : '1px solid rgba(255, 255, 255, 0.14)',
    boxShadow:
      theme === 'light'
        ? '0 24px 64px -16px rgba(9, 9, 11, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
        : '0 24px 64px -16px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
    ...style,
  };

  return (
    <div
      data-liquid-engine={glActive ? 'liquid-gl' : 'css-glass'}
      className={`liquid-glass-surface ${className}`.trim()}
      style={glassShellStyle}
    >
      {/* Dedicated optical lens target layer so liquidGL's pointerEvents='none' never blocks interactive controls */}
      <div
        aria-hidden="true"
        data-liquid-id={liquidTargetId}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          pointerEvents: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
};
