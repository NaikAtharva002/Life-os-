import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import {
  aiChatRequestSchema,
  checkRateLimit,
  DEFAULT_NVIDIA_MODEL,
  NVIDIA_MODELS,
  proxyNvidiaChat,
  resolveNvidiaApiKey,
} from './shared/nvidiaProxy';

function readJsonBody(req: IncomingMessage, maxBytes = 128 * 1024): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        resolve(text ? JSON.parse(text) : {});
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown, extraHeaders?: Record<string, string>) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  if (extraHeaders) {
    Object.entries(extraHeaders).forEach(([k, v]) => res.setHeader(k, v));
  }
  res.end(JSON.stringify(body));
}

function collectFilesRecursive(dirPath: string, rootDir: string, out: string[]) {
  if (!fs.existsSync(dirPath)) return;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectFilesRecursive(full, rootDir, out);
    } else if (/\.(js|css|html|woff2?|svg|png|webmanifest)$/i.test(entry.name)) {
      const rel = `/${path.relative(rootDir, full).replace(/\\/g, '/')}`;
      if (rel !== '/sw.js') out.push(rel);
    }
  }
}

function lifeOsPlatformPlugin(): Plugin {
  let outDirAbs = path.resolve(process.cwd(), 'dist');

  return {
    name: 'life-os-platform',
    configResolved(resolved) {
      outDirAbs = path.resolve(resolved.root, resolved.build.outDir);
    },
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');

      server.middlewares.use('/api/ai/health', (req, res, next) => {
        if (req.method !== 'GET') return next();
        const serverKeyConfigured = Boolean((env.NVIDIA_API_KEY || process.env.NVIDIA_API_KEY || '').trim());
        sendJson(res, 200, {
          ok: true,
          provider: 'nvidia-nim',
          serverKeyConfigured,
          defaultModel: DEFAULT_NVIDIA_MODEL,
          models: NVIDIA_MODELS,
        });
      });

      server.middlewares.use('/api/ai/chat', async (req, res, next) => {
        if (req.method !== 'POST') return next();

        const clientIp = req.socket?.remoteAddress || '127.0.0.1';
        const rate = checkRateLimit(`dev-ai:${clientIp}`, 20, 60_000);
        if (!rate.allowed) {
          sendJson(
            res,
            429,
            { error: 'Rate limit exceeded. Please wait before sending more AI requests.' },
            { 'Retry-After': String(rate.retryAfterSeconds) }
          );
          return;
        }

        let rawBody: unknown;
        try {
          rawBody = await readJsonBody(req);
        } catch (err) {
          const message =
            err instanceof Error && err.message === 'PAYLOAD_TOO_LARGE'
              ? 'Request payload too large.'
              : 'Invalid JSON request body.';
          sendJson(res, 400, { error: message });
          return;
        }

        const parsed = aiChatRequestSchema.safeParse(rawBody);
        if (!parsed.success) {
          sendJson(res, 400, { error: 'Invalid AI request payload.' });
          return;
        }

        const sessionHeader = req.headers['x-nvidia-session-key'];
        const apiKey = resolveNvidiaApiKey(
          env.NVIDIA_API_KEY || process.env.NVIDIA_API_KEY,
          Array.isArray(sessionHeader) ? sessionHeader[0] : sessionHeader
        );

        if (!apiKey) {
          sendJson(res, 503, {
            error: 'NVIDIA API key is not configured on the server.',
            code: 'NO_API_KEY',
          });
          return;
        }

        try {
          const result = await proxyNvidiaChat({ apiKey, request: parsed.data });
          if (!result.ok) {
            sendJson(res, result.status, { error: result.error });
            return;
          }
          sendJson(res, 200, {
            reply: result.reply,
            provider: 'nvidia-nim',
            model: result.model,
          });
        } catch {
          sendJson(res, 502, { error: 'Failed to reach NVIDIA NIM inference service.' });
        }
      });
    },
    closeBundle() {
      const swPath = path.join(outDirAbs, 'sw.js');
      if (!fs.existsSync(swPath)) return;

      const assets: string[] = ['/'];
      collectFilesRecursive(outDirAbs, outDirAbs, assets);
      const uniqueAssets = Array.from(new Set(assets)).filter(
        (item) => item.startsWith('/assets/') || !item.includes('/images/') || item.endsWith('.jpg')
      );
      const hash = crypto
        .createHash('sha256')
        .update(uniqueAssets.join('|'))
        .digest('hex')
        .slice(0, 10);

      let swCode = fs.readFileSync(swPath, 'utf8');
      swCode = swCode.replace('__BUILD_HASH__', hash);
      swCode = swCode.replace(
        /\/\* __PRECACHE_MANIFEST__ \*\/ \[[\s\S]*?\];/,
        `${JSON.stringify(uniqueAssets, null, 2)};`
      );
      fs.writeFileSync(swPath, swCode, 'utf8');
    },
  };
}

export default defineConfig({
  plugins: [react(), lifeOsPlatformPlugin()],
  server: {
    port: 5173,
    strictPort: true,
  },
});
