declare module 'liquid-gl' {
  export interface LiquidGLLensOptions {
    target: string;
    snapshot?: string;
    resolution?: number;
    engine?: 'auto' | 'webgpu' | 'webgl2' | 'webgl';
    zIndex?: number;
    content?: string | boolean;
    refraction?: number;
    aberration?: number;
    bevelDepth?: number;
    bevelWidth?: number;
    frost?: number;
    shadow?: boolean;
    specular?: boolean;
    reveal?: 'none' | 'fade';
    tilt?: boolean;
    tiltFactor?: number;
    tiltEase?: number;
    draggable?: boolean;
    interaction?: 'none' | 'fluid';
    interactionStrength?: number;
    interactionRadius?: number;
    interactionViscosity?: number;
    magnify?: number;
    tint?: string | null;
    helper?: boolean;
    on?: {
      init?: (instance: LiquidGLLensInstance) => void;
      dragstart?: (instance: LiquidGLLensInstance, info: { x: number; y: number }) => void;
      drag?: (instance: LiquidGLLensInstance, info: { x: number; y: number }) => void;
      dragend?: (instance: LiquidGLLensInstance, info: { x: number; y: number }) => void;
    };
  }

  export interface LiquidGLLensInstance {
    el: HTMLElement;
    options: LiquidGLLensOptions;
    destroy: () => void;
    setTint: (value: string | null) => void;
    setDraggable: (enabled: boolean) => void;
    setShadow: (enabled: boolean) => void;
    setTilt: (enabled: boolean) => void;
    updateMetrics: () => void;
  }

  export interface LiquidGLFunction {
    (options: LiquidGLLensOptions): LiquidGLLensInstance | LiquidGLLensInstance[] | undefined;
    registerDynamic: (elements: string | HTMLElement | HTMLElement[] | NodeList) => void;
    syncWith: (config?: Record<string, unknown>) => unknown;
  }

  const liquidGL: LiquidGLFunction;
  export default liquidGL;
}
