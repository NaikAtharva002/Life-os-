import React from 'react';
import {
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  MoreVertical,
} from 'lucide-react';
import type { Task, Priority, TaskStatus } from '../types';
import useStore from '../store/useStore';

interface TaskKanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onAddTaskToStatus: (status: TaskStatus) => void;
}

const KANBAN_COLUMNS: { id: TaskStatus; label: string; color: string; desc: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'var(--text-muted)', desc: 'Future or unorganized ideas' },
  { id: 'todo', label: 'To Do', color: 'var(--text-secondary)', desc: 'Ready for action' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--palette-brick, #B80C09)', desc: 'Active execution' },
  { id: 'completed', label: 'Completed', color: 'var(--status-success, #22C55E)', desc: 'Accomplished milestones' },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  critical: 'var(--priority-critical, #B80C09)',
  high: 'var(--priority-high, #D97706)',
  medium: 'var(--priority-medium, #2563EB)',
  low: 'var(--priority-low, #6B7280)',
};

export default function TaskKanbanBoard({
  tasks,
  onEditTask,
  onAddTaskToStatus,
}: TaskKanbanBoardProps) {
  const setTaskStatus = useStore((s) => s.setTaskStatus);
  const completeTask = useStore((s) => s.completeTask);
  const reopenTask = useStore((s) => s.reopenTask);
  const startTaskFocusSession = useStore((s) => s.startTaskFocusSession);

  const todayStr = new Date().toISOString().split('T')[0];

  const getTasksForColumn = (colId: TaskStatus) => {
    return tasks.filter((t) => {
      if (t.isArchived) return false;
      if (colId === 'completed') {
        return t.isCompleted || t.status === 'completed' || t.status === 'done';
      }
      if (colId === 'in_progress') {
        return !t.isCompleted && (t.status === 'in_progress' || t.status === 'in-progress');
      }
      if (colId === 'backlog') {
        return !t.isCompleted && t.status === 'backlog';
      }
      // 'todo' default
      return !t.isCompleted && (t.status === 'todo' || !t.status);
    });
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
        alignItems: 'start',
      }}
    >
      {KANBAN_COLUMNS.map((col) => {
        const colTasks = getTasksForColumn(col.id);

        return (
          <div
            key={col.id}
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              padding: '12px',
              minHeight: '440px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--panel-shadow)',
            }}
          >
            {/* Column Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-default)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: col.color,
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {col.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    background: 'var(--border-default)',
                    color: 'var(--text-secondary)',
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {colTasks.length}
                </span>
                <button
                  type="button"
                  onClick={() => onAddTaskToStatus(col.id)}
                  className="btn btn-ghost"
                  style={{ padding: '2px', color: 'var(--text-muted)' }}
                  title={`Add task to ${col.label}`}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Task Cards Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {colTasks.map((t) => {
                const completedSubs = t.subtasks?.filter((s) => s.isCompleted).length || 0;
                const totalSubs = t.subtasks?.length || 0;
                const subtaskPct = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;
                const isOverdue = t.isOverdue && !t.isCompleted;

                return (
                  <div
                    key={t.id}
                    onClick={() => onEditTask(t)}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                      borderLeft: `3px solid ${PRIORITY_COLORS[t.priority] || 'var(--priority-medium)'}`,
                      padding: '10px 12px',
                      cursor: 'pointer',
                      transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: t.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: t.isCompleted ? 'line-through' : 'none',
                          lineHeight: 1.35,
                          marginBottom: '4px',
                        }}
                      >
                        {t.title}
                      </div>

                      {/* Focus button */}
                      {!t.isCompleted && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startTaskFocusSession(t.id);
                          }}
                          className="btn btn-ghost"
                          style={{
                            padding: '2px 4px',
                            color: 'var(--palette-brick, #B80C09)',
                            fontSize: '10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                          title="Start focus timer"
                        >
                          <Play size={10} fill="currentColor" />
                        </button>
                      )}
                    </div>

                    {/* Subtasks Progress */}
                    {totalSubs > 0 && (
                      <div style={{ margin: '6px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                          <span>Subtasks</span>
                          <span>
                            {completedSubs}/{totalSubs}
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '3px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${subtaskPct}%`,
                              height: '100%',
                              background: 'var(--palette-brick)',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Meta Row: Due date + Duration */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '8px',
                        fontSize: '10.5px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {t.dueDate && (
                          <span
                            style={{
                              color: isOverdue ? 'var(--danger, #EF4444)' : 'var(--text-muted)',
                              fontWeight: isOverdue ? 600 : 400,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <Calendar size={10} />
                            {t.dueDate === todayStr ? 'Today' : t.dueDate}
                          </span>
                        )}

                        {t.estimatedDuration && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <Clock size={10} />
                            {t.estimatedDuration}m
                          </span>
                        )}
                      </div>

                      {/* Quick Column Shift Selector */}
                      <select
                        value={col.id}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          setTaskStatus(t.id, e.target.value as TaskStatus);
                        }}
                        style={{
                          fontSize: '10px',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-default)',
                          borderRadius: '4px',
                          padding: '1px 3px',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="backlog">Move to Backlog</option>
                        <option value="todo">Move to To Do</option>
                        <option value="in_progress">Move to In Progress</option>
                        <option value="completed">Move to Done</option>
                      </select>
                    </div>
                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div
                  style={{
                    padding: '24px 12px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '11.5px',
                    border: '1px dashed var(--border-default)',
                    borderRadius: '8px',
                    margin: 'auto 0',
                  }}
                >
                  No tasks in {col.label.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
