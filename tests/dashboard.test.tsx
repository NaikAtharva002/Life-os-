import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../src/pages/Dashboard';
import useStore from '../src/store/useStore';
import { getEffectiveTodayContext } from '../src/lib/dashboardSelectors';
import { toLocalDateString } from '../src/lib/dates';

function resetDashboardStore(overrides: Partial<ReturnType<typeof useStore.getState>> = {}) {
  const baseSettings = useStore.getState().settings;
  useStore.setState({
    isLoaded: true,
    activeView: 'dashboard',
    goals: [],
    tasks: [],
    habits: [],
    habitEntries: [],
    financeTransactions: [],
    financeBudgets: [],
    savingsGoals: [],
    academicSubjects: [],
    academicAssignments: [],
    academicExams: [],
    timetableSlots: [],
    careerApplications: [],
    workoutSessions: [],
    eveningReviews: [],
    toasts: [],
    settings: {
      ...baseSettings,
      userName: '',
      userGreeting: '',
      currencySymbol: '₹',
      dayStartHour: 4,
      defaultFocusDuration: 25,
      isDemoMode: false,
      onboardingCompleted: true,
      selectedLifeAreas: ['goals', 'tasks', 'habits', 'finance', 'fitness', 'academics', 'career'],
      dashboardWidgets: undefined,
    },
    ...overrides,
  });
}

describe('Dashboard & Home Experience', () => {
  beforeEach(() => {
    resetDashboardStore();
  });

  it('renders useful new-user empty states with direct creation modals and hides unrequested demo data', () => {
    const { todayStr, currentDayOfWeek } = getEffectiveTodayContext(4);

    // Inject leftover demo rows while isDemoMode is false; Dashboard must not show them
    resetDashboardStore({
      tasks: [
        {
          id: 'demo-t-1',
          title: 'Demo Task Should Stay Hidden',
          priority: 'high',
          category: 'Career & Work',
          status: 'todo',
          dueDate: todayStr,
          isCompleted: false,
          isOverdue: false,
          subtasks: [],
          createdAt: todayStr,
          updatedAt: todayStr,
          isDemo: true,
        },
      ],
      goals: [
        {
          id: 'demo-g-1',
          title: 'Demo Goal Should Stay Hidden',
          description: 'Demo only',
          priority: 'critical',
          type: 'short-term',
          category: 'Career',
          progress: 50,
          milestones: [],
          createdAt: todayStr,
          updatedAt: todayStr,
          isArchived: false,
          isDemo: true,
        },
      ],
      timetableSlots: [
        {
          id: 'demo-slot-1',
          subjectId: 'sub-demo',
          subjectName: 'Demo Lecture Hidden',
          dayOfWeek: currentDayOfWeek,
          startTime: '09:00',
          endTime: '10:00',
          room: '101',
          isDemo: true,
        },
      ],
    });

    render(<Dashboard />);

    expect(screen.queryByText('Demo Task Should Stay Hidden')).not.toBeInTheDocument();
    expect(screen.queryByText('Demo Goal Should Stay Hidden')).not.toBeInTheDocument();
    expect(screen.queryByText('Demo Lecture Hidden')).not.toBeInTheDocument();

    expect(screen.getByText('Start with one task, goal, habit, or class')).toBeInTheDocument();
    expect(screen.getByText('No tasks scheduled for today.')).toBeInTheDocument();
    expect(screen.getByText('No habits added yet.')).toBeInTheDocument();
    expect(screen.getByText('Set your next milestone.')).toBeInTheDocument();

    // Direct modal triggers work from Dashboard and close with Escape
    fireEvent.click(screen.getByRole('button', { name: 'Add First Task' }));
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create First Goal' }));
    expect(screen.getByText('Establish New Goal')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText('Establish New Goal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Start First Habit' }));
    expect(screen.getByText('Architect New Habit')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText('Architect New Habit')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add Class or Event' }));
    expect(screen.getByText('Add Class / Lecture')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText('Add Class / Lecture')).not.toBeInTheDocument();
  });

  it('displays personalized user data across tasks, overdue rescue, habits, academics, upcoming events, finance, and goals', async () => {
    const { todayStr, currentMonthStr, currentDayOfWeek } = getEffectiveTodayContext(4);
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayStr = toLocalDateString(yesterday);
    const twoDaysOut = toLocalDateString(new Date(Date.now() + 2 * 86400000));
    const threeDaysOut = toLocalDateString(new Date(Date.now() + 3 * 86400000));

    const completeTaskSpy = vi.fn();
    const rescheduleTaskSpy = vi.fn();
    const toggleHabitSpy = vi.fn();
    const startFocusSpy = vi.fn();

    resetDashboardStore({
      completeTask: completeTaskSpy,
      rescheduleTask: rescheduleTaskSpy,
      toggleHabitEntry: toggleHabitSpy,
      startTaskFocusSession: startFocusSpy,
      settings: {
        ...useStore.getState().settings,
        userName: 'Rishita',
        userGreeting: 'Ship deep work first.',
        currencySymbol: '₹',
        defaultFocusDuration: 45,
        isDemoMode: false,
      },
      tasks: [
        {
          id: 't-today-1',
          title: 'Finish Dashboard PR',
          priority: 'critical',
          category: 'Career & Work',
          status: 'todo',
          dueDate: todayStr,
          dueTime: '18:00',
          estimatedDuration: 45,
          isCompleted: false,
          isOverdue: false,
          subtasks: [
            { id: 'st-1', title: 'Write unit tests', isCompleted: true },
            { id: 'st-2', title: 'Verify mobile layout', isCompleted: false },
          ],
          createdAt: todayStr,
          updatedAt: todayStr,
        },
        {
          id: 't-over-1',
          title: 'Submit OS Assignment',
          priority: 'high',
          category: 'Academics',
          status: 'todo',
          dueDate: yesterdayStr,
          isCompleted: false,
          isOverdue: true,
          subtasks: [],
          createdAt: yesterdayStr,
          updatedAt: yesterdayStr,
        },
        {
          id: 't-over-2',
          title: 'Renew Lab Access',
          priority: 'medium',
          category: 'Academics',
          status: 'todo',
          dueDate: yesterdayStr,
          isCompleted: false,
          isOverdue: true,
          subtasks: [],
          createdAt: yesterdayStr,
          updatedAt: yesterdayStr,
        },
        {
          id: 't-upcoming-1',
          title: 'Mock System Design Review',
          priority: 'medium',
          category: 'Career',
          status: 'todo',
          dueDate: twoDaysOut,
          isCompleted: false,
          isOverdue: false,
          subtasks: [],
          createdAt: todayStr,
          updatedAt: todayStr,
        },
      ],
      habits: [
        {
          id: 'h-active',
          name: 'Deep Reading',
          category: 'Learning',
          frequency: 'daily',
          targetDays: [0, 1, 2, 3, 4, 5, 6],
          color: '#6366F1',
          icon: 'Book',
          type: 'numeric',
          targetValue: 20,
          unit: 'pages',
          streak: 5,
          longestStreak: 12,
          isArchived: false,
          createdAt: todayStr,
        },
        {
          id: 'h-archived',
          name: 'Archived Habit Hidden',
          category: 'Health',
          frequency: 'daily',
          targetDays: [0, 1, 2, 3, 4, 5, 6],
          color: '#6366F1',
          icon: 'Zap',
          streak: 0,
          longestStreak: 0,
          isArchived: true,
          createdAt: todayStr,
        },
      ],
      habitEntries: [
        {
          id: 'he-1',
          habitId: 'h-active',
          date: todayStr,
          completed: false,
          status: 'partial',
          value: 10,
        },
      ],
      goals: [
        {
          id: 'g-num',
          title: 'Solve 150 DSA Problems',
          description: 'Master graphs and DP',
          priority: 'high',
          type: 'short-term',
          category: 'Career',
          measurementType: 'numeric',
          targetValue: 150,
          currentValue: 60,
          unit: 'problems',
          progress: 40,
          milestones: [],
          createdAt: todayStr,
          updatedAt: todayStr,
          isArchived: false,
        },
      ],
      academicSubjects: [
        {
          id: 'sub-1',
          semesterId: 'sem-1',
          name: 'Operating Systems',
          code: 'CS301',
          credits: 4,
          color: '#6366F1',
          targetAttendancePercentage: 75,
          totalClasses: 20,
          attendedClasses: 14, // 70% < 75% target
        },
      ],
      academicAssignments: [
        {
          id: 'asg-1',
          subjectId: 'sub-1',
          title: 'Kernel Lab Report',
          dueDate: threeDaysOut,
          isSubmitted: false,
        },
      ],
      academicExams: [
        {
          id: 'exam-1',
          subjectId: 'sub-1',
          title: 'OS Midsem',
          examDate: twoDaysOut,
          syllabusCoveragePercentage: 65,
          weightagePercentage: 30,
        },
      ],
      timetableSlots: [
        {
          id: 'slot-1',
          subjectId: 'sub-1',
          subjectName: 'Operating Systems',
          courseCode: 'CS301',
          dayOfWeek: currentDayOfWeek,
          startTime: '10:00',
          endTime: '11:30',
          room: 'LH-204',
        },
      ],
      financeTransactions: [
        {
          id: 'tx-1',
          type: 'expense',
          amount: 2500,
          category: 'Groceries',
          date: todayStr,
          description: 'Weekly groceries',
          paymentMethod: 'UPI',
          createdAt: todayStr,
        },
      ],
      financeBudgets: [
        {
          id: 'b-1',
          category: 'Groceries',
          monthlyLimit: 10000,
          month: currentMonthStr,
        },
      ],
      careerApplications: [
        {
          id: 'app-1',
          company: 'Acme Labs',
          role: 'SWE Intern',
          stage: 'interview',
          nextFollowUpDate: threeDaysOut,
          location: 'Remote',
        },
      ],
      workoutSessions: [
        {
          id: 'ws-old',
          date: yesterdayStr,
          splitType: 'Pull',
          title: 'Older Pull Session',
          durationMinutes: 50,
          exercises: [],
          totalVolumeKg: 2400,
          createdAt: yesterdayStr,
        },
        {
          id: 'ws-new',
          date: todayStr,
          splitType: 'Push',
          title: 'Latest Push Session',
          durationMinutes: 60,
          exercises: [],
          totalVolumeKg: 3000,
          createdAt: todayStr,
        },
      ],
    });

    render(<Dashboard />);

    // Personalized greeting and preferred focus duration
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Rishita/);
    expect(screen.getByText('Ship deep work first.')).toBeInTheDocument();
    expect(screen.getByText('45:00')).toBeInTheDocument();

    // New-user banner must NOT render when user has data
    expect(screen.queryByText('Start with one task, goal, habit, or class')).not.toBeInTheDocument();

    // Priority Queue + Overdue rescue
    expect(screen.getByText('2 overdue tasks')).toBeInTheDocument();
    expect(screen.getAllByText('Submit OS Assignment').length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByRole('button', { name: /Show all \(2\)/i }));
    expect(screen.getAllByText('Renew Lab Access').length).toBeGreaterThanOrEqual(1);

    fireEvent.click(screen.getAllByRole('button', { name: 'Move to Today' })[0]);
    expect(rescheduleTaskSpy).toHaveBeenCalledWith('t-over-1', todayStr);

    // Today task + subtasks + Focus + Edit
    expect(screen.getAllByText('Finish Dashboard PR').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/1\/2 steps/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Focus' }));
    expect(startFocusSpy).toHaveBeenCalledWith('t-today-1');

    // Habits Today excludes archived habit and displays quantified progress
    expect(screen.getByText('Deep Reading')).toBeInTheDocument();
    expect(screen.queryByText('Archived Habit Hidden')).not.toBeInTheDocument();
    expect(screen.getByText(/10\/20 pages/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mark Deep Reading as complete' }));
    expect(toggleHabitSpy).toHaveBeenCalledWith('h-active', todayStr);

    // Academics & Timetable + Upcoming 7 Days + Finance + Fitness + Numeric Goal
    expect(screen.getByText('Operating Systems')).toBeInTheDocument();
    expect(screen.getByText('Low attendance: CS301')).toBeInTheDocument();
    expect(screen.getByText('Mock System Design Review')).toBeInTheDocument();
    expect(screen.getByText('OS Midsem')).toBeInTheDocument();
    expect(screen.getByText('Kernel Lab Report')).toBeInTheDocument();
    expect(screen.getByText('Acme Labs: SWE Intern')).toBeInTheDocument();
    expect(screen.getByText('25% of budget')).toBeInTheDocument();
    expect(screen.getByText(/Latest Push Session/)).toBeInTheDocument();
    expect(screen.getByText('Solve 150 DSA Problems')).toBeInTheDocument();
    expect(screen.getByText('60 / 150 problems')).toBeInTheDocument();

    // Clicking upcoming event navigates to its module
    fireEvent.click(screen.getByText('Acme Labs: SWE Intern'));
    expect(useStore.getState().activeView).toBe('career');

    // Customizer modal closes on Escape
    fireEvent.click(screen.getByRole('button', { name: 'Customize dashboard widgets' }));
    expect(screen.getByRole('dialog', { name: 'Customize Dashboard Widgets' })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Customize Dashboard Widgets' })).not.toBeInTheDocument();
    });
  });

  it('respects onboarding selectedLifeAreas when explicit widget overrides are absent', () => {
    resetDashboardStore({
      settings: {
        ...useStore.getState().settings,
        selectedLifeAreas: ['tasks', 'habits'],
        dashboardWidgets: undefined,
      },
    });

    render(<Dashboard />);

    expect(screen.getByRole('heading', { name: 'Today’s Execution' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Habits Today' })).toBeInTheDocument();
    expect(screen.queryByText('Today’s Timetable')).not.toBeInTheDocument();
    expect(screen.queryByText('Month Spend')).not.toBeInTheDocument();
    expect(screen.queryByText('Active Goals')).not.toBeInTheDocument();
    expect(screen.queryByText('Fitness Log')).not.toBeInTheDocument();
  });
});
