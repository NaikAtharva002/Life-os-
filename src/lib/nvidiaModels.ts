export interface NvidiaModelOption {
  id: string;
  label: string;
  description: string;
}

export const NVIDIA_MODELS: NvidiaModelOption[] = [
  {
    id: 'nvidia/nemotron-3.5-bolt-e4b',
    label: 'Nemotron 3.5 Bolt (Fast)',
    description: 'Default — instant sub-second answers & daily plans',
  },
  {
    id: 'nvidia/nemotron-3.5-lightning-30b-a3b',
    label: 'Nemotron 3.5 Lightning (30B)',
    description: 'Balanced planning & structured reasoning',
  },
  {
    id: 'nvidia/nemotron-3.5-super-vl-120b-a12b',
    label: 'Nemotron 3.5 Super (120B)',
    description: 'Deep multi-domain analysis & weekly strategy',
  },
];

export const DEFAULT_NVIDIA_MODEL = 'nvidia/nemotron-3.5-bolt-e4b';

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
