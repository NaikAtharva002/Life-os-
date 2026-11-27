import { DEFAULT_NVIDIA_MODEL, NVIDIA_MODELS } from '../../shared/nvidiaProxy';

export function GET(): Response {
  const serverKeyConfigured = Boolean((process.env.NVIDIA_API_KEY || '').trim());
  return new Response(
    JSON.stringify({
      ok: true,
      provider: 'nvidia-nim',
      serverKeyConfigured,
      defaultModel: DEFAULT_NVIDIA_MODEL,
      models: NVIDIA_MODELS,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
}
