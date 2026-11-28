import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../src/pages/Dashboard';
import useStore from '../src/store/useStore';
import { todayLocal } from '../src/lib/dates';

describe('Dashboard Home Experience', () => {
  const initialState = useStore.getState();

  beforeEach(() => {
    useStore.setState(initialState, true);
  });

  it('renders honest empty state and quickstart actions for a brand-new user without leaking demo records', () => {
    const todayStr = todayLocal(4);
    useStore.setState({
      settings: {
        ...initialState.settings,
        userName: 'Rishita',
        isDemoMode: false,
        onboardingCompleted: true,
      },
      tasks: [
        {
          id: 'demo-t',
          title: 'Secret Demo Task',
          priority: 'critical',
          dueDate: todayStr,
          status: 'todo',
          isCompleted: false,
          isOverdue: false,
          tags: [],
          subtasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDemo: true,
        },
      ],
      goals: [],
      habits: [],
      habitEntries: [],
      financeTransactions: [],
      academicSubjects: [],
      academicAssignments: [],
      academicExams: [],
      timetableSlots: [],
      workoutSessions: [],
      eveningReviews: [],
      lifestyleItems: [],
    });

    render(<Dashboard />);

    expect(screen.getByText(/Rishita/)).toBeInTheDocument();
    expect(screen.getByText(/Set up your real Life OS in under a minute/i)).toBeInTheDocument();
    expect(screen.queryByText('Secret Demo Task')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add First Task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Plan Lifestyle & Trips/i })).toBeInTheDocument();
  });

  it('renders populated user tasks, upcoming 7-day cross-domain events, and RIT command bar', () => {
    const todayStr = todayLocal(4);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    let navigatedView = '';
    useStore.setState({
      settings: {
        ...initialState.settings,
        userName: 'Atharva',
        isDemoMode: false,
      },
      tasks: [
        {
          id: 't-real-1',
          title: 'Ship RIT Command Center',
          priority: 'high',
          dueDate: todayStr,
          category: 'Career',
          status: 'todo',
          isCompleted: false,
          isOverdue: false,
          tags: [],
          subtasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDemo: false,
        },
      ],
      academicExams: [
        {
          id: 'ex-1',
          subjectId: 'sub-1',
          title: 'Machine Learning Midsem',
          examDate: tomorrowStr,
          syllabusCoveragePercentage: 65,
          weightagePercentage: 30,
          isDemo: false,
        },
      ],
      lifestyleItems: [
        {
          id: 'life-1',
          title: 'Evening Guitar Practice',
          category: 'hobby',
          date: tomorrowStr,
          status: 'planned',
          createdAt: new Date().toISOString(),
          isDemo: false,
        },
      ],
      setActiveView: (v: string) => {
        navigatedView = v;
      },
    });

    render(<Dashboard />);

    expect(screen.getByText('Ship RIT Command Center')).toBeInTheDocument();
    expect(screen.getByText('Machine Learning Midsem')).toBeInTheDocument();
    expect(screen.getByText('Evening Guitar Practice')).toBeInTheDocument();

    const ritInput = screen.getByLabelText('Ask RIT from dashboard');
    fireEvent.change(ritInput, { target: { value: 'Plan my study sprint' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ask RIT' }));
    expect(navigatedView).toBe('assistant');
  });
});
