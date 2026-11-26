import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { db } from '../src/db';
import { LifeOSRepository } from '../src/db/repository';
import useStore, { DEFAULT_GRAPH_PREFERENCES } from '../src/store/useStore';
import {
  buildKnowledgeUniverseGraph,
  filterAndProjectUniverse,
  type UniverseSourceData,
} from '../src/lib/knowledgeGraph';
import KnowledgeUniversePage from '../src/pages/KnowledgeUniversePage';
import { UniverseCanvas } from '../src/components/universe/UniverseCanvas';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import App from '../src/App';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Minimal Canvas 2D mock for jsdom rendering tests
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  setLineDash: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 40 })),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  globalAlpha: 1,
  font: '',
  textAlign: 'center',
  textBaseline: 'middle',
})) as any;

function emptySourceData(): UniverseSourceData {
  return {
    goals: [],
    tasks: [],
    habits: [],
    habitRoutines: [],
    financeTransactions: [],
    financeBudgets: [],
    savingsGoals: [],
    workoutSessions: [],
    exercises: [],
    fitnessGoals: [],
    academicSemesters: [],
    academicSubjects: [],
    academicAssignments: [],
    academicExams: [],
    timetableSlots: [],
    careerGoals: [],
    careerSkills: [],
    careerProjects: [],
    careerApplications: [],
    careerDocuments: [],
    eveningReviews: [],
    obsidianNotes: [],
    graphNodes: [],
    graphEdges: [],
    settings: {
      theme: 'dark',
      userName: 'Atharva',
      currencySymbol: '₹',
      reminder: { enabled: false, time: '21:30', timezone: 'Asia/Kolkata' },
      graphPreferences: { ...DEFAULT_GRAPH_PREFERENCES, animationsEnabled: false, reducedMotion: true },
    },
  };
}

describe('Knowledge Universe 2.0 & INR Currency Suite', () => {
  beforeEach(async () => {
    await db.goals.clear();
    await db.tasks.clear();
    await db.habits.clear();
    await db.obsidianNotes.clear();
    await db.graphNodes.clear();
    await db.graphEdges.clear();
    await db.appMeta.clear();

    useStore.setState({
      goals: [],
      tasks: [],
      habits: [],
      habitRoutines: [],
      financeTransactions: [],
      financeBudgets: [],
      savingsGoals: [],
      workoutSessions: [],
      exercises: [],
      fitnessGoals: [],
      academicSemesters: [],
      academicSubjects: [],
      academicAssignments: [],
      academicExams: [],
      timetableSlots: [],
      careerGoals: [],
      careerSkills: [],
      careerProjects: [],
      careerApplications: [],
      careerDocuments: [],
      eveningReviews: [],
      obsidianNotes: [],
      graphNodes: [],
      graphEdges: [],
      toasts: [],
      settings: emptySourceData().settings,
    });
  });

  it('produces only the central Me node with zero fictional nodes on an empty workspace', () => {
    const raw = buildKnowledgeUniverseGraph(emptySourceData());
    expect(raw.hasAnyUserData).toBe(false);
    expect(raw.nodes).toHaveLength(1);
    expect(raw.nodes[0].id).toBe('me');
    expect(raw.edges).toHaveLength(0);
  });

  it('builds real cross-module relationships (goals, tasks, dependencies, academics, career skills, notes wikilinks, INR finance)', () => {
    const data = emptySourceData();
    data.goals = [
      {
        id: 'g1',
        title: 'Learn React Architecture',
        description: 'Master React internals',
        priority: 'high',
        type: 'short-term',
        category: 'Career',
        lifeArea: 'career',
        progress: 40,
        milestones: [{ id: 'm1', title: 'Build Graph UI', isCompleted: false }],
        createdAt: '2026-11-20',
        updatedAt: '2026-11-25',
        isArchived: false,
      },
    ];
    data.careerSkills = [
      {
        id: 's1',
        name: 'TypeScript',
        category: 'Frontend',
        proficiency: 4,
        targetProficiency: 5,
      },
    ];
    data.careerProjects = [
      {
        id: 'p1',
        title: 'Portfolio OS',
        description: 'Personal OS',
        techStack: ['TypeScript'],
        status: 'in-progress',
        featured: true,
      },
    ];
    data.tasks = [
      {
        id: 't1',
        title: 'Design Schema',
        priority: 'high',
        category: 'Career',
        status: 'completed',
        isCompleted: true,
        isOverdue: false,
        subtasks: [],
        goalId: 'g1',
        careerProjectId: 'p1',
        createdAt: '2026-11-20',
        updatedAt: '2026-11-21',
      },
      {
        id: 't2',
        title: 'Build Force Canvas',
        priority: 'critical',
        category: 'Career',
        status: 'todo',
        isCompleted: false,
        isOverdue: false,
        subtasks: [],
        goalId: 'g1',
        dependsOnTaskIds: ['t1'],
        createdAt: '2026-11-21',
        updatedAt: '2026-11-25',
      },
    ];
    data.academicSubjects = [
      {
        id: 'sub1',
        semesterId: 'sem1',
        name: 'Computer Science',
        code: 'CS301',
        credits: 4,
        color: '#38BDF8',
        targetAttendancePercentage: 75,
        totalClasses: 20,
        attendedClasses: 18,
      },
    ];
    data.academicAssignments = [
      {
        id: 'asg1',
        subjectId: 'sub1',
        title: 'Java Lab 1',
        dueDate: '2026-12-01',
        isSubmitted: false,
      },
    ];
    data.obsidianNotes = [
      {
        id: 'n1',
        title: 'Graph Architecture Notes',
        folder: 'Tech',
        content: 'Links [[Learn React Architecture]] and [[Portfolio OS]].',
        tags: ['architecture'],
        linkedGoalId: 'g1',
        linkedSubjectId: 'sub1',
        createdAt: '2026-11-22',
        updatedAt: '2026-11-25',
      },
    ];
    data.savingsGoals = [
      {
        id: 'sg1',
        title: 'Laptop Upgrade Fund',
        targetAmount: 100000,
        currentAmount: 45000,
        targetDate: '2027-01-01',
        category: 'Tech',
        isReached: false,
        createdAt: '2026-11-01',
      },
    ];

    const raw = buildKnowledgeUniverseGraph(data);
    expect(raw.hasAnyUserData).toBe(true);

    // Goal -> Milestone & Task -> Goal support edge
    expect(raw.edges.some((e) => e.source === 'milestone:g1:m1' && e.target === 'goal:g1' && e.relationType === 'part_of')).toBe(true);
    expect(raw.edges.some((e) => e.source === 'task:t2' && e.target === 'goal:g1' && e.relationType === 'supports_goal')).toBe(true);

    // Directional task dependency
    expect(raw.edges.some((e) => e.source === 'task:t2' && e.target === 'task:t1' && e.relationType === 'depends_on' && e.directional)).toBe(true);

    // Career project uses TypeScript skill
    expect(raw.edges.some((e) => e.source === 'project:p1' && e.target === 'skill:s1' && e.relationType === 'uses_skill')).toBe(true);

    // Wikilink reference + subject reference
    expect(raw.edges.some((e) => e.source === 'note:n1' && e.target === 'goal:g1' && e.relationType === 'references')).toBe(true);
    expect(raw.edges.some((e) => e.source === 'note:n1' && e.target === 'subject:sub1' && e.relationType === 'references')).toBe(true);

    // Finance uses INR symbol cleanly
    const savingsNode = raw.nodes.find((n) => n.id === 'savings:sg1');
    expect(savingsNode?.subtitle).toContain('₹');

    // Mode filtering: academic mode isolates academic subgraph without finance node
    const academicProjection = filterAndProjectUniverse(raw, { mode: 'academic' });
    expect(academicProjection.nodes.some((n) => n.id === 'subject:sub1')).toBe(true);
    expect(academicProjection.nodes.some((n) => n.id === 'assignment:asg1')).toBe(true);
    expect(academicProjection.nodes.some((n) => n.id === 'savings:sg1')).toBe(false);

    // Hide completed filter hides completed task t1
    const activeOnly = filterAndProjectUniverse(raw, { mode: 'full', hideCompleted: true });
    expect(activeOnly.nodes.some((n) => n.id === 'task:t1')).toBe(false);
    expect(activeOnly.nodes.some((n) => n.id === 'task:t2')).toBe(true);
  });

  it('safely skips edges pointing to deleted records', () => {
    const data = emptySourceData();
    data.graphEdges = [
      {
        id: 'edge-orphan',
        sourceId: 'goal:deleted-goal',
        targetId: 'task:deleted-task',
        relationType: 'related_to',
        createdAt: '2026-11-25',
        updatedAt: '2026-11-25',
      },
    ];
    const raw = buildKnowledgeUniverseGraph(data);
    expect(raw.edges.find((e) => e.id === 'edge-orphan')).toBeUndefined();
  });

  it('persists custom nodes and relationships in Dexie v3 and exports/imports cleanly', async () => {
    const custom = await useStore.getState().saveGraphNode({
      title: 'Distributed Systems Lab',
      description: 'Personal research topic',
      category: 'technology',
      kind: 'research',
      tags: ['raft', 'consensus'],
    });

    const edge = await useStore.getState().addGraphEdge({
      sourceId: custom.id,
      targetId: 'me',
      relationType: 'created_from',
    });

    expect(useStore.getState().graphNodes).toHaveLength(1);
    expect(useStore.getState().graphEdges).toHaveLength(1);

    const exported = await LifeOSRepository.exportEntireDatabaseJSON();
    expect(exported).toContain('Distributed Systems Lab');

    await useStore.getState().deleteGraphEdge(edge.id);
    expect(useStore.getState().graphEdges).toHaveLength(0);

    await useStore.getState().deleteGraphNode(custom.id);
    expect(useStore.getState().graphNodes).toHaveLength(0);
  });

  it('upgrades legacy USD ($) saved settings cleanly to INR (₹) on repository initialize', async () => {
    await db.appMeta.put({ key: 'initialized', value: true });
    await db.appMeta.put({
      key: 'settings',
      value: {
        theme: 'dark',
        userName: 'Atharva',
        currencySymbol: '$',
      },
    });

    const loaded = await LifeOSRepository.initialize();
    expect(loaded.settings.currencySymbol).toBe('₹');
  });

  it('renders KnowledgeUniversePage empty state, custom node creation modal, and filters', async () => {
    render(<KnowledgeUniversePage />);

    expect(screen.getByText('Your universe starts here.')).toBeInTheDocument();
    expect(
      screen.getByText('Add your first goal, note, project, or idea to start connecting your world.')
    ).toBeInTheDocument();

    // Open Add Node modal and create a custom node
    fireEvent.click(screen.getByRole('button', { name: /Add Node/i }));
    fireEvent.change(screen.getByLabelText(/Title \*/i), {
      target: { value: 'AI Research Journal' },
    });
    const submitBtn = screen.getByRole('button', { name: /Create Node/i });
    const form = submitBtn.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(useStore.getState().graphNodes.some((n) => n.title === 'AI Research Journal')).toBe(true);
      expect(screen.queryByText('Your universe starts here.')).not.toBeInTheDocument();
      expect(screen.getByRole('complementary', { name: 'Node Information Panel' })).toBeInTheDocument();
    });
  });

  it('ignores dangling edges in UniverseCanvas without crashing and survives metadata updates', () => {
    const baseNodes = [
      {
        id: 'me',
        title: 'Me',
        category: 'personal' as const,
        kind: 'core',
        tier: 'core' as const,
        baseRadius: 20,
      },
      {
        id: 'node-1',
        title: 'Initial Title',
        category: 'knowledge' as const,
        kind: 'note',
        tier: 'record' as const,
        baseRadius: 8,
      },
    ];
    const edgesWithDangling = [
      {
        id: 'valid-edge',
        source: 'me',
        target: 'node-1',
        relationType: 'related_to' as const,
        label: 'Related to',
      },
      {
        id: 'dangling-edge',
        source: 'me',
        target: 'missing-node-id',
        relationType: 'depends_on' as const,
        label: 'Depends on',
      },
    ];

    const { rerender } = render(
      <UniverseCanvas
        nodes={baseNodes}
        edges={edgesWithDangling}
        theme="dark"
        preferences={{ ...DEFAULT_GRAPH_PREFERENCES, reducedMotion: true }}
        selectedNodeId={null}
        searchQuery=""
        onSelectNode={() => {}}
        onOpenRecord={() => {}}
      />
    );

    expect(screen.getByLabelText('Knowledge Universe Interactive Graph Canvas')).toBeInTheDocument();

    // Update node metadata without changing topology
    rerender(
      <UniverseCanvas
        nodes={[{ ...baseNodes[0] }, { ...baseNodes[1], title: 'Updated Title' }]}
        edges={edgesWithDangling}
        theme="dark"
        preferences={{ ...DEFAULT_GRAPH_PREFERENCES, reducedMotion: true }}
        selectedNodeId="node-1"
        searchQuery=""
        onSelectNode={() => {}}
        onOpenRecord={() => {}}
      />
    );

    expect(screen.getByLabelText('Knowledge Universe Interactive Graph Canvas')).toBeInTheDocument();
  });

  it('recovers cleanly through ErrorBoundary on transient render failures', () => {
    let shouldThrow = true;
    const FaultyChild = () => {
      if (shouldThrow) throw new Error('Synthetic canvas fault');
      return <div>Recovered Canvas Content</div>;
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary title="Knowledge Universe Canvas Recovery">
        <FaultyChild />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Knowledge Universe Canvas Recovery');
    expect(screen.getByRole('alert')).toHaveTextContent('Synthetic canvas fault');

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: /Retry View/i }));
    expect(screen.getByText('Recovered Canvas Content')).toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });

  it('preserves direct /universe deep link under React StrictMode on initial mount', async () => {
    useStore.setState({ activeView: 'dashboard', isLoaded: false, initError: null });
    render(
      <React.StrictMode>
        <MemoryRouter initialEntries={['/universe']}>
          <App />
        </MemoryRouter>
      </React.StrictMode>
    );

    await waitFor(() => {
      expect(useStore.getState().activeView).toBe('universe');
      expect(screen.getByLabelText('Knowledge Universe Interactive Graph Canvas')).toBeInTheDocument();
    });
  });
});
