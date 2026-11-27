export interface NvidiaModelOption {
  id: string;
  label: string;
  description: string;
}

export const NVIDIA_MODELS: NvidiaModelOption[] = [
  {
    id: 'meta/llama-3.3-70b-instruct',
    label: 'Llama 3.3 70B Instruct',
    description: 'Balanced speed & structured reasoning',
  },
  {
    id: 'nvidia/llama-3.1-nemotron-70b-instruct',
    label: 'NVIDIA Nemotron 70B',
    description: 'High helpfulness for planning & coaching',
  },
  {
    id: 'qwen/qwen2.5-coder-32b-instruct',
    label: 'Qwen 2.5 Coder 32B',
    description: 'Technical coursework, CS & engineering sprints',
  },
  {
    id: 'deepseek-ai/deepseek-r1',
    label: 'DeepSeek R1',
    description: 'Deep analytical & multi-step reasoning',
  },
];

export const DEFAULT_NVIDIA_MODEL = 'meta/llama-3.3-70b-instruct';

export interface WorkspaceContextSummary {
  userName?: string;
  todayStr?: string;
  currency?: string;
  pendingTasksCount?: number;
  overdueTasksCount?: number;
  todayTasks?: Array<{
    title: string;
    priority: string;
    dueTime?: string;
  }>;
  activeGoals?: Array<{
    title: string;
    progress: number;
    priority: string;
    nextMilestone?: string;
  }>;
  habitsTodayCount?: number;
  habitsDoneTodayCount?: number;
  attendanceWarnings?: Array<{
    subject: string;
    pct: number;
  }>;
  monthlySpendFormatted?: string;
  monthlyIncomeFormatted?: string;
  workoutsLogged?: number;
}
