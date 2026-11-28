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
    completedTodayCount: z.number().int().min(0).max(5000).optional(),
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
    overdueTasks: z
      .array(
        z.object({
          title: z.string().max(200),
          priority: z.string().max(30),
          dueDate: z.string().max(24).optional(),
        })
      )
      .max(10)
      .optional(),
    activeGoals: z
      .array(
        z.object({
          title: z.string().max(200),
          progress: z.number().min(0).max(100),
          priority: z.string().max(30),
          targetDate: z.string().max(24).optional(),
          nextMilestone: z.string().max(200).optional(),
        })
      )
      .max(10)
      .optional(),
    habitsTodayCount: z.number().int().min(0).max(500).optional(),
    habitsDoneTodayCount: z.number().int().min(0).max(500).optional(),
    monthlyHabitConsistencyPct: z.number().min(0).max(100).optional(),
    habitHighlights: z
      .array(
        z.object({
          name: z.string().max(120),
          streak: z.number().int().min(0).max(5000),
          doneToday: z.boolean(),
        })
      )
      .max(10)
      .optional(),
    attendanceWarnings: z
      .array(
        z.object({
          subject: z.string().max(120),
          pct: z.number().min(0).max(100),
        })
      )
      .max(12)
      .optional(),
    overallAttendancePct: z.number().min(0).max(100).optional(),
    pendingAssignmentsCount: z.number().int().min(0).max(500).optional(),
    upcomingExams: z
      .array(
        z.object({
          title: z.string().max(160),
          examDate: z.string().max(24),
          coveragePct: z.number().min(0).max(100),
        })
      )
      .max(8)
      .optional(),
    monthlySpendFormatted: z.string().max(64).optional(),
    monthlyIncomeFormatted: z.string().max(64).optional(),
    savingsRatePct: z.number().min(-1000).max(100).optional(),
    workoutsLogged: z.number().int().min(0).max(5000).optional(),
    workoutsThisWeek: z.number().int().min(0).max(100).optional(),
    latestWorkoutTitle: z.string().max(120).optional(),
    careerProjectsCount: z.number().int().min(0).max(500).optional(),
    activeApplicationsCount: z.number().int().min(0).max(500).optional(),
    interviewApplicationsCount: z.number().int().min(0).max(500).optional(),
    topSkills: z.array(z.string().max(64)).max(8).optional(),
    productivityScore: z.number().min(0).max(100).optional(),
    taskCompletionRate: z.number().min(0).max(100).optional(),
    habitAdherenceRate: z.number().min(0).max(100).optional(),
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

export function buildRitSystemPrompt(ctx?: AiChatRequest['workspaceContext']): string {
  const userName = ctx?.userName || 'Student';
  const currency = ctx?.currency || '₹';
  const todayStr = ctx?.todayStr || 'today';

  const summaryLines = [
    `User: ${userName}`,
    `Local Date: ${todayStr}`,
    `Preferred Currency: ${currency}`,
    `Productivity Index: ${ctx?.productivityScore ?? 0}% (Tasks ${ctx?.taskCompletionRate ?? 0}%, 14d Habits ${ctx?.habitAdherenceRate ?? 0}%, 30d Habits ${ctx?.monthlyHabitConsistencyPct ?? 0}%)`,
    `Tasks: ${ctx?.pendingTasksCount ?? 0} pending (${ctx?.overdueTasksCount ?? 0} overdue, ${ctx?.completedTodayCount ?? 0} done today)`,
    `Habits Today: ${ctx?.habitsDoneTodayCount ?? 0}/${ctx?.habitsTodayCount ?? 0} completed`,
    `Fitness / Gym: ${ctx?.workoutsLogged ?? 0} total sessions (${ctx?.workoutsThisWeek ?? 0} this week${ctx?.latestWorkoutTitle ? `, latest: ${ctx.latestWorkoutTitle}` : ''})`,
  ];

  if (ctx?.monthlySpendFormatted || ctx?.monthlyIncomeFormatted) {
    summaryLines.push(
      `Finance Snapshot: Income ${ctx?.monthlyIncomeFormatted || `${currency}0`}, Spend ${ctx?.monthlySpendFormatted || `${currency}0`}${typeof ctx?.savingsRatePct === 'number' ? ` (${ctx.savingsRatePct}% savings rate)` : ''}`
    );
  }

  if (ctx?.todayTasks?.length) {
    summaryLines.push(
      `Scheduled Today: ${ctx.todayTasks
        .map((t) => `${t.title} [${t.priority}${t.dueTime ? ` @ ${t.dueTime}` : ''}]`)
        .join('; ')}`
    );
  }

  if (ctx?.overdueTasks?.length) {
    summaryLines.push(
      `Overdue Tasks: ${ctx.overdueTasks
        .map((t) => `${t.title} [${t.priority}${t.dueDate ? `, due ${t.dueDate}` : ''}]`)
        .join('; ')}`
    );
  }

  if (ctx?.activeGoals?.length) {
    summaryLines.push(
      `Active Goals: ${ctx.activeGoals
        .map(
          (g) =>
            `${g.title} (${g.progress}%, ${g.priority}${g.targetDate ? `, due ${g.targetDate}` : ''}${g.nextMilestone ? `, next: ${g.nextMilestone}` : ''})`
        )
        .join('; ')}`
    );
  }

  if (ctx?.habitHighlights?.length) {
    summaryLines.push(
      `Habit Streaks: ${ctx.habitHighlights
        .map((h) => `${h.name} (${h.streak}d streak${h.doneToday ? ', done today' : ''})`)
        .join('; ')}`
    );
  }

  if (
    typeof ctx?.overallAttendancePct === 'number' ||
    ctx?.pendingAssignmentsCount ||
    ctx?.upcomingExams?.length
  ) {
    summaryLines.push(
      `Academics: Attendance ${ctx?.overallAttendancePct ?? 0}%, ${ctx?.pendingAssignmentsCount ?? 0} pending assignments`
    );
  }

  if (ctx?.attendanceWarnings?.length) {
    summaryLines.push(
      `Attendance Warnings (<target): ${ctx.attendanceWarnings.map((a) => `${a.subject}: ${a.pct}%`).join('; ')}`
    );
  }

  if (ctx?.upcomingExams?.length) {
    summaryLines.push(
      `Upcoming Exams: ${ctx.upcomingExams
        .map((e) => `${e.title} on ${e.examDate} (${e.coveragePct}% syllabus covered)`)
        .join('; ')}`
    );
  }

  if (
    ctx?.careerProjectsCount ||
    ctx?.activeApplicationsCount ||
    ctx?.topSkills?.length
  ) {
    summaryLines.push(
      `Career: ${ctx?.careerProjectsCount ?? 0} projects, ${ctx?.activeApplicationsCount ?? 0} active applications (${ctx?.interviewApplicationsCount ?? 0} in interview)${ctx?.topSkills?.length ? `, top skills: ${ctx.topSkills.join(', ')}` : ''}`
    );
  }

  return [
    'You are RIT ("Harmony, Structure and Order" — "Bring your life into rhythm."), the calm, organized, supportive personal AI productivity companion for students inside LIFE OS.',
    'Respond with clean, scannable Markdown using concise headings (###), focused checklists, and 2-3 clear next actions grounded strictly in the live workspace summary below.',
    `Always format monetary amounts using "${currency}" unless quoting another currency. Never fabricate tasks, goals, balances, workouts, or courses.`,
    'Keep responses under 320 words unless the user asks for a deep study or weekly plan.',
    '',
    '--- LIVE WORKSPACE SUMMARY ---',
    ...summaryLines,
  ].join('\n');
}

// Backward-compatible alias for existing imports
export const buildAstraSystemPrompt = buildRitSystemPrompt;

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
  const systemPrompt = buildRitSystemPrompt(request.workspaceContext);

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
    signal: AbortSignal.timeout(45_000),
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
