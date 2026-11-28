declare module 'liquid-gl' {
  export interface LiquidGLOptions {
    target?: string | HTMLElement | NodeListOf<HTMLElement>;
    snapshot?: string;
    engine?: 'auto' | 'webgl' | 'webgl2' | 'webgpu' | 'canvas';
    resolution?: number;
    refraction?: number;
    aberration?: number;
    bevelDepth?: number;
    bevelWidth?: number;
    frost?: number;
    shadow?: boolean;
    specular?: boolean;
    interaction?: 'fluid' | 'static' | 'none' | string;
    tint?: string;
    reveal?: string;
    magnify?: number;
  }

  export interface LiquidGLInstance {
    destroy?: () => void;
    update?: () => void;
    resize?: () => void;
    registerDynamic?: (el: HTMLElement | NodeListOf<HTMLElement> | string) => void;
  }

  export default function liquidGL(options: LiquidGLOptions): LiquidGLInstance | null;
}
