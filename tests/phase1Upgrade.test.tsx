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
  checkRateLimit,
  DEFAULT_NVIDIA_MODEL,
  proxyNvidiaChat,
  resetRateLimitsForTest,
  resolveNvidiaApiKey,
  resolveNvidiaModel,
} from '../shared/nvidiaProxy';

describe('Phase 1 Upgrades: NVIDIA Proxy, Markdown Copilot, & Honest Analytics', () => {
  beforeEach(() => {
    resetRateLimitsForTest();
    sessionStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
    useStore.setState({
      goals: [],
      tasks: [],
      habits: [],
      habitEntries: [],
      financeTransactions: [],
      academicSubjects: [],
      academicAssignments: [],
      academicExams: [],
      workoutSessions: [],
      careerApplications: [],
      assistantMessages: [
        {
          id: 'init',
          role: 'assistant',
          content: '### Welcome\nReady to plan.',
          timestamp: new Date().toISOString(),
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

  it('validates NVIDIA proxy schemas, allowlisted models, key precedence, and rate limits', async () => {
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
        workspaceContext: { currency: '₹', pendingTasksCount: 3 },
      }).success
    ).toBe(true);

    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit('ip-test', 20, 60_000, 1000).allowed).toBe(true);
    }
    const blocked = checkRateLimit('ip-test', 20, 60_000, 1000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

    const prompt = buildAstraSystemPrompt({
      userName: 'Atharva',
      todayStr: '2026-11-27',
      currency: '₹',
      monthlySpendFormatted: '₹4,200',
    });
    expect(prompt).toContain('₹4,200');
    expect(prompt).toContain('Preferred Currency: ₹');

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

  it('runs AssistantPage offline cleanly and uses /api/ai/chat when NVIDIA NIM server key is active', async () => {
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
            reply: '### NVIDIA Plan\n- Prioritized task executed cleanly.',
            provider: 'nvidia-nim',
            model: DEFAULT_NVIDIA_MODEL,
          }),
          { status: 200 }
        );
      }
      return new Response('{}', { status: 404 });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AssistantPage />);

    await waitFor(() => {
      expect(screen.getByText(/NVIDIA NIM/)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Ask Astra/i), {
      target: { value: 'Summarize priorities' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send/i }));

    await waitFor(() => {
      expect(screen.getByText('NVIDIA Plan')).toBeInTheDocument();
      expect(screen.getByText(/Prioritized task executed cleanly/)).toBeInTheDocument();
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
