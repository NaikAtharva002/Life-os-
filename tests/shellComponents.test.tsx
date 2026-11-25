import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuickTaskBar from '../src/components/QuickTaskBar';
import GlobalCommandPalette from '../src/components/GlobalCommandPalette';
import ThemeToggle from '../src/components/ThemeToggle';
import Sidebar from '../src/components/Sidebar';
import Dashboard from '../src/pages/Dashboard';
import { ToastContainer } from '../src/components/ui/Toast';
import useStore from '../src/store/useStore';

// ResizeObserver mock required by cmdk in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// scrollIntoView mock for cmdk item selection in jsdom
Element.prototype.scrollIntoView = vi.fn();

describe('Redesigned Shell Interactive Components', () => {
  beforeEach(() => {
    useStore.setState({
      tasks: [
        {
          id: 't-sample',
          title: 'Finish DBMS Lab Report',
          priority: 'high',
          category: 'Academics',
          status: 'todo',
          isCompleted: false,
          isOverdue: false,
          dueDate: '2026-11-26',
        },
      ],
      goals: [],
      habits: [],
      obsidianNotes: [],
      academicSubjects: [],
      toasts: [],
    });
  });

  it('renders QuickTaskBar with live chrono-node natural language preview chips', () => {
    render(<QuickTaskBar />);
    const input = screen.getByLabelText('Quick capture task');

    fireEvent.change(input, {
      target: { value: 'Study algorithms tomorrow 5pm !critical #academics' },
    });

    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('Academics')).toBeInTheDocument();
    expect(screen.getByText(/Parsed:/i)).toBeInTheDocument();
  });

  it('renders cmdk GlobalCommandPalette and displays live records and actions', () => {
    const onClose = vi.fn();
    const onOpenQuickTask = vi.fn();
    const onOpenQuickGoal = vi.fn();

    render(
      <GlobalCommandPalette
        isOpen={true}
        onClose={onClose}
        onOpenQuickTask={onOpenQuickTask}
        onOpenQuickGoal={onOpenQuickGoal}
      />
    );

    expect(screen.getByRole('dialog', { name: 'Global Command Palette' })).toBeInTheDocument();
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByText('Finish DBMS Lab Report')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Create New Task'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOpenQuickTask).toHaveBeenCalledTimes(1);
  });

  it('toggles theme cleanly from ThemeToggle and Sidebar theme buttons', () => {
    useStore.setState((s) => ({
      settings: { ...s.settings, theme: 'dark' },
    }));

    render(
      <>
        <ThemeToggle />
        <Sidebar collapsed={false} setCollapsed={vi.fn()} mobileOpen={false} setMobileOpen={vi.fn()} />
      </>
    );

    fireEvent.click(screen.getByLabelText('Toggle theme'));
    expect(useStore.getState().settings.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    fireEvent.click(screen.getByRole('button', { name: 'Obsidian' }));
    expect(useStore.getState().settings.theme).toBe('dark');

    fireEvent.click(screen.getByRole('button', { name: 'Paper' }));
    expect(useStore.getState().settings.theme).toBe('light');

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(useStore.getState().activeView).toBe('settings');
  });

  it('submits a task when clicking the QuickTaskBar Add button', async () => {
    render(<QuickTaskBar />);
    const input = screen.getByLabelText('Quick capture task');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Finish Compiler Lab !high' } });

    const addBtn = screen.getByRole('button', { name: /^Add$/i });
    expect(addBtn).not.toBeDisabled();
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(useStore.getState().tasks.some((t) => t.title.includes('Finish Compiler Lab'))).toBe(true);
      expect(useStore.getState().toasts.some((t) => t.title === 'Task Added')).toBe(true);
    });
  });

  it('collapses Dashboard execution grid when left widgets are hidden and restores defaults via Customize modal', async () => {
    useStore.setState((s) => ({
      settings: {
        ...s.settings,
        dashboardWidgets: {
          focusTimer: true,
          todayTasks: false,
          habits: false,
          goals: false,
          academics: false,
          finance: false,
          fitness: true,
        },
      },
    }));

    const { container } = render(<Dashboard />);
    const execGrid = container.querySelector('.today-execution-grid');
    expect(execGrid?.className).toContain('single-col');

    fireEvent.click(screen.getByRole('button', { name: 'Customize dashboard widgets' }));
    expect(screen.getByText('Customize Today View')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset to defaults/i }));
    await waitFor(() => {
      expect(useStore.getState().settings.dashboardWidgets?.todayTasks).toBe(true);
      expect(useStore.getState().settings.dashboardWidgets?.habits).toBe(true);
    });

    expect(container.querySelector('.today-execution-grid')?.className).not.toContain('single-col');

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByText('Customize Today View')).not.toBeInTheDocument();
  });

  it('dismisses Toast items via effect timer without state-update-during-render errors', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    useStore.setState({
      toasts: [
        { id: 'toast-1', type: 'success', title: 'Task Added', duration: 60 },
      ],
    });

    render(<ToastContainer />);
    expect(screen.getByText('Task Added')).toBeInTheDocument();

    await waitFor(() => {
      expect(useStore.getState().toasts.some((t) => t.id === 'toast-1')).toBe(false);
    }, { timeout: 1000 });

    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
