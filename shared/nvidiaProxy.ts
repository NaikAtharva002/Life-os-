import { z } from 'zod';
import {
  DEFAULT_NVIDIA_MODEL,
  NVIDIA_MODELS,
  type NvidiaModelOption,
} from '../src/lib/nvidiaModels';

export { DEFAULT_NVIDIA_MODEL, NVIDIA_MODELS, type NvidiaModelOption };
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(4000),
});

export const workspaceContextSchema = z
  .object({
    userName: z.string().max(80).optional(),
    todayStr: z.string().max(24).optional(),
    currency: z.string().max(8).optional(),
    pendingTasksCount: z.number().int().min(0).max(5000).optional(),
    overdueTasksCount: z.number().int().min(0).max(5000).optional(),
    todayTasks: z
      .array(
        z.object({
          title: z.string().max(200),
          priority: z.string().max(30),
          dueTime: z.string().max(20).optional(),
        })
      )
      .max(15)
      .optional(),
    activeGoals: z
      .array(
        z.object({
          title: z.string().max(200),
          progress: z.number().min(0).max(100),
          priority: z.string().max(30),
          nextMilestone: z.string().max(200).optional(),
        })
      )
      .max(10)
      .optional(),
    habitsTodayCount: z.number().int().min(0).max(500).optional(),
    habitsDoneTodayCount: z.number().int().min(0).max(500).optional(),
    attendanceWarnings: z
      .array(
        z.object({
          subject: z.string().max(120),
          pct: z.number().min(0).max(100),
        })
      )
      .max(12)
      .optional(),
    monthlySpendFormatted: z.string().max(64).optional(),
    monthlyIncomeFormatted: z.string().max(64).optional(),
    workoutsLogged: z.number().int().min(0).max(5000).optional(),
  })
  .optional();

export const aiChatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(16),
  model: z.string().max(100).optional(),
  workspaceContext: workspaceContextSchema,
});

export type AiChatRequest = z.infer<typeof aiChatRequestSchema>;

const allowedModelSet = new Set(NVIDIA_MODELS.map((m) => m.id));

export function resolveNvidiaModel(requested?: string): string {
  if (requested && allowedModelSet.has(requested)) {
    return requested;
  }
  return DEFAULT_NVIDIA_MODEL;
}

export function resolveNvidiaApiKey(envKey?: string | null, sessionHeaderKey?: string | null): string | null {
  const fromEnv = (envKey || '').trim();
  if (fromEnv.length >= 16) return fromEnv;

  const fromHeader = (sessionHeaderKey || '').trim();
  if (fromHeader.length >= 16 && fromHeader.length <= 256) return fromHeader;

  return null;
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  clientKey: string,
  limit = 20,
  windowMs = 60_000,
  now = Date.now()
): { allowed: boolean; retryAfterSeconds: number; remaining: number } {
  const bucket = rateBuckets.get(clientKey);
  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(clientKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000), remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    remaining: Math.max(0, limit - bucket.count),
  };
}

export function resetRateLimitsForTest(): void {
  rateBuckets.clear();
}

export function buildAstraSystemPrompt(ctx?: AiChatRequest['workspaceContext']): string {
  const userName = ctx?.userName || 'User';
  const currency = ctx?.currency || '₹';
  const todayStr = ctx?.todayStr || 'today';

  const summaryLines = [
    `User: ${userName}`,
    `Local Date: ${todayStr}`,
    `Preferred Currency: ${currency}`,
    `Pending Tasks: ${ctx?.pendingTasksCount ?? 0} (Overdue: ${ctx?.overdueTasksCount ?? 0})`,
    `Today's Habits: ${ctx?.habitsDoneTodayCount ?? 0}/${ctx?.habitsTodayCount ?? 0} completed`,
    `Workouts Logged: ${ctx?.workoutsLogged ?? 0}`,
  ];

  if (ctx?.monthlySpendFormatted || ctx?.monthlyIncomeFormatted) {
    summaryLines.push(
      `Finance Snapshot: Income ${ctx?.monthlyIncomeFormatted || `${currency}0`}, Spend ${ctx?.monthlySpendFormatted || `${currency}0`}`
    );
  }

  if (ctx?.todayTasks?.length) {
    summaryLines.push(
      `Scheduled Today: ${ctx.todayTasks
        .map((t) => `${t.title} [${t.priority}${t.dueTime ? ` @ ${t.dueTime}` : ''}]`)
        .join('; ')}`
    );
  }

  if (ctx?.activeGoals?.length) {
    summaryLines.push(
      `Active Goals: ${ctx.activeGoals
        .map((g) => `${g.title} (${g.progress}%, ${g.priority}${g.nextMilestone ? `, next: ${g.nextMilestone}` : ''})`)
        .join('; ')}`
    );
  }

  if (ctx?.attendanceWarnings?.length) {
    summaryLines.push(
      `Attendance Warnings (<75%): ${ctx.attendanceWarnings.map((a) => `${a.subject}: ${a.pct}%`).join('; ')}`
    );
  }

  return [
    'You are Astra, the built-in personal operating system copilot inside LIFE OS 3.0.',
    'Give concise, structured, actionable Markdown advice grounded strictly in the workspace summary below.',
    `Always format monetary numbers using "${currency}" unless quoting external currencies. Never invent fake tasks, goals, balances, or courses.`,
    'Keep responses under 320 words unless asked for a detailed plan.',
    '',
    '--- LIVE WORKSPACE SUMMARY ---',
    ...summaryLines,
  ].join('\n');
}

export interface NvidiaChatResult {
  ok: boolean;
  status: number;
  reply?: string;
  model?: string;
  error?: string;
}

export async function proxyNvidiaChat(params: {
  apiKey: string;
  request: AiChatRequest;
  fetchImpl?: typeof fetch;
}): Promise<NvidiaChatResult> {
  const { apiKey, request, fetchImpl = fetch } = params;
  const model = resolveNvidiaModel(request.model);
  const systemPrompt = buildAstraSystemPrompt(request.workspaceContext);

  const response = await fetchImpl(NVIDIA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...request.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.35,
      max_tokens: 2400,
    }),
    signal: AbortSignal.timeout(25_000),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    const safeError =
      response.status === 401 || response.status === 403
        ? 'Invalid or expired NVIDIA API key.'
        : response.status === 429
        ? 'NVIDIA API rate limit reached. Try again shortly.'
        : `NVIDIA NIM returned HTTP ${response.status}${errBody ? `: ${errBody.slice(0, 140)}` : ''}`;
    return {
      ok: false,
      status: response.status === 401 || response.status === 403 ? 401 : response.status === 429 ? 429 : 502,
      error: safeError,
    };
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    return { ok: false, status: 502, error: 'Empty completion received from NVIDIA NIM.' };
  }

  return { ok: true, status: 200, reply, model };
}
