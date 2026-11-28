import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import useStore from '../src/store/useStore';
import { MarkdownMessage } from '../src/components/MarkdownMessage';
import AssistantPage from '../src/pages/AssistantPage';
import AnalyticsPage from '../src/pages/AnalyticsPage';
import {
  aiChatRequestSchema,
  buildAstraSystemPrompt,
  buildRitSystemPrompt,
  checkRateLimit,
  DEFAULT_NVIDIA_MODEL,
  proxyNvidiaChat,
  resetRateLimitsForTest,
  resolveNvidiaApiKey,
  resolveNvidiaModel,
} from '../shared/nvidiaProxy';
import { todayLocal } from '../src/lib/dates';

describe('RIT AI Agent, Liquid Glass UI, NVIDIA Proxy & Analytics', () => {
  beforeEach(() => {
    resetRateLimitsForTest();
    sessionStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
    delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    useStore.setState({
      goals: [],
      tasks: [],
      habits: [],
      habitEntries: [],
      financeTransactions: [],
      financeBudgets: [],
      academicSubjects: [],
      academicAssignments: [],
      academicExams: [],
      timetableSlots: [],
      workoutSessions: [],
      fitnessGoals: [],
      careerProjects: [],
      careerApplications: [],
      careerSkills: [],
      eveningReviews: [],
      toasts: [],
      assistantMessages: [
        {
          id: 'init',
          role: 'assistant',
          content: '### Meet RIT\nBring your life into rhythm.',
          timestamp: new Date().toISOString(),
          source: 'local',
        },
      ],
      settings: {
        ...useStore.getState().settings,
        userName: 'Atharva',
        currencySymbol: '₹',
        nvidiaModel: DEFAULT_NVIDIA_MODEL,
      },
    });
    vi.restoreAllMocks();
  });

  it('validates NVIDIA proxy schemas, allowlisted models, RIT system prompt, key precedence, and rate limits', async () => {
    expect(resolveNvidiaModel('unknown/evil-model')).toBe(DEFAULT_NVIDIA_MODEL);
    expect(resolveNvidiaModel('nvidia/nemotron-3.5-super-vl-120b-a12b')).toBe(
      'nvidia/nemotron-3.5-super-vl-120b-a12b'
    );

    expect(resolveNvidiaApiKey('nvapi-server-env-secret-1234', 'nvapi-session-key-5678')).toBe(
      'nvapi-server-env-secret-1234'
    );
    expect(resolveNvidiaApiKey('', 'short')).toBeNull();
    expect(resolveNvidiaApiKey('', 'nvapi-valid-session-key-123456')).toBe(
      'nvapi-valid-session-key-123456'
    );

    expect(aiChatRequestSchema.safeParse({ messages: [] }).success).toBe(false);
    expect(
      aiChatRequestSchema.safeParse({
        messages: [{ role: 'user', content: 'Plan my day' }],
        workspaceContext: { currency: '₹', pendingTasksCount: 3, productivityScore: 74 },
      }).success
    ).toBe(true);

    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit('ip-test', 20, 60_000, 1000).allowed).toBe(true);
    }
    const blocked = checkRateLimit('ip-test', 20, 60_000, 1000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

    const ritPrompt = buildRitSystemPrompt({
      userName: 'Atharva',
      todayStr: '2026-11-28',
      currency: '₹',
      monthlySpendFormatted: '₹4,200',
      productivityScore: 81,
    });
    expect(ritPrompt).toContain('RIT');
    expect(ritPrompt).toContain('Bring your life into rhythm.');
    expect(ritPrompt).toContain('₹4,200');
    expect(ritPrompt).toContain('81%');
    expect(buildAstraSystemPrompt({ userName: 'Atharva' })).toContain('RIT');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '### Plan Ready\n- Focus for 90 minutes' } }],
      }),
    });
    const res = await proxyNvidiaChat({
      apiKey: 'nvapi-test-key-1234567890',
      request: {
        messages: [{ role: 'user', content: 'Plan today' }],
        model: DEFAULT_NVIDIA_MODEL,
      },
      fetchImpl: mockFetch as unknown as typeof fetch,
    });
    expect(res.ok).toBe(true);
    expect(res.reply).toContain('### Plan Ready');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('renders clean Markdown blocks without leaking raw ### markers', () => {
    render(
      <MarkdownMessage
        content={'### Morning Focus\n> [!WARNING] 1 overdue task\n- [ ] Finish **Systems** `lab`'}
      />
    );

    expect(screen.getByText('Morning Focus')).toBeInTheDocument();
    expect(screen.queryByText(/###/)).not.toBeInTheDocument();
    expect(screen.getByText(/1 overdue task/)).toBeInTheDocument();
    expect(screen.getByText('Systems')).toBeInTheDocument();
    expect(screen.getByText('lab')).toBeInTheDocument();
  });

  it('renders RIT identity, graceful CSS glass fallback, and executes live NVIDIA NIM chat', async () => {
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const target = String(url);
      if (target.includes('/api/ai/health')) {
        return new Response(
          JSON.stringify({ ok: true, serverKeyConfigured: true, defaultModel: DEFAULT_NVIDIA_MODEL }),
          { status: 200 }
        );
      }
      if (target.includes('/api/ai/chat')) {
        return new Response(
          JSON.stringify({
            reply: '### Daily Rhythm\n- Execute top overdue priority cleanly.',
            provider: 'nvidia-nim',
            model: DEFAULT_NVIDIA_MODEL,
          }),
          { status: 200 }
        );
      }
      return new Response('{}', { status: 404 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const { container } = render(<AssistantPage />);

    expect(screen.getByRole('heading', { name: 'RIT' })).toBeInTheDocument();
    expect(screen.getByText('Harmony, Structure and Order')).toBeInTheDocument();
    expect(container.querySelector('[data-gl-mode="css"]')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Voice search/i })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/NVIDIA NIM/)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Ask RIT anything/i), {
      target: { value: 'Plan my day.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send message to RIT/i }));

    await waitFor(() => {
      expect(screen.getByText('Daily Rhythm')).toBeInTheDocument();
      expect(screen.getByText(/Execute top overdue priority cleanly/)).toBeInTheDocument();
    });
  });

  it('asks for confirmation before executing natural-language task creation and persists on Confirm', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true, serverKeyConfigured: false }), { status: 200 })
      )
    );

    render(<AssistantPage />);

    fireEvent.change(screen.getByPlaceholderText(/Ask RIT anything/i), {
      target: { value: 'Add a task to study DSA at 6 PM.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send message to RIT/i }));

    await waitFor(() => {
      expect(screen.getByText('New Life OS Task')).toBeInTheDocument();
      expect(screen.getAllByText('Study DSA').length).toBeGreaterThanOrEqual(1);
    });

    // Must not execute before user confirms
    expect(useStore.getState().tasks).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: /^Confirm$/i }));

    await waitFor(() => {
      expect(screen.getByText('Saved in Life OS')).toBeInTheDocument();
      const created = useStore.getState().tasks.find((t) => t.title === 'Study DSA');
      expect(created).toBeDefined();
      expect(created?.dueTime).toBe('18:00');
      expect(created?.category).toBe('Academics');
    });
  });

  it('renders voice input control when SpeechRecognition is supported and answers overdue audit accurately', async () => {
    const todayStr = todayLocal();
    class MockSpeechRecognition {
      lang = 'en-US';
      interimResults = true;
      maxAlternatives = 1;
      onresult: ((e: unknown) => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      start = vi.fn();
      stop = vi.fn();
      abort = vi.fn();
    }
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition = MockSpeechRecognition;

    useStore.setState({
      tasks: [
        {
          id: 't-over',
          title: 'Submit DBMS Lab File',
          priority: 'critical',
          category: 'Academics',
          status: 'todo',
          isCompleted: false,
          isOverdue: true,
          dueDate: '2026-11-20',
          subtasks: [],
          createdAt: todayStr,
          updatedAt: todayStr,
        },
      ],
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true, serverKeyConfigured: false }), { status: 200 })
      )
    );

    render(<AssistantPage />);

    expect(screen.getByRole('button', { name: /Voice search/i })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Ask RIT anything/i), {
      target: { value: 'What tasks are overdue?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send message to RIT/i }));

    await waitFor(() => {
      expect(screen.getByText('Overdue Task Audit (1)')).toBeInTheDocument();
      expect(screen.getByText(/Submit DBMS Lab File/)).toBeInTheDocument();
    });
  });

  it('reports 0% analytics on empty workspace instead of fake scores and renders export actions', () => {
    render(<AnalyticsPage />);

    expect(screen.getByText('0% composite')).toBeInTheDocument();
    expect(screen.getByText('Fresh Analytics Canvas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export JSON Report/i })).toBeInTheDocument();
  });
});
