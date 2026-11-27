import {
  aiChatRequestSchema,
  checkRateLimit,
  proxyNvidiaChat,
  resolveNvidiaApiKey,
} from '../../shared/nvidiaProxy';

export async function POST(request: Request): Promise<Response> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const rate = checkRateLimit(`ai:${ip}`, 20, 60_000);
  if (!rate.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please wait before sending more AI requests.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rate.retryAfterSeconds),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON request body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parsed = aiChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Invalid AI request payload.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const apiKey = resolveNvidiaApiKey(
    process.env.NVIDIA_API_KEY,
    request.headers.get('x-nvidia-session-key')
  );
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'NVIDIA API key is not configured on the server.',
        code: 'NO_API_KEY',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const result = await proxyNvidiaChat({ apiKey, request: parsed.data });
    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        reply: result.reply,
        provider: 'nvidia-nim',
        model: result.model,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Failed to reach NVIDIA NIM inference service.' }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
