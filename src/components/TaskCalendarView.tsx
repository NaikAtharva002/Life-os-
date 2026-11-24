import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import type { Task, Priority } from '../types';
import useStore from '../store/useStore';

interface TaskCalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onAddTaskForDate: (dateStr: string) => void;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  critical: 'var(--priority-critical, #B80C09)',
  high: 'var(--priority-high, #D97706)',
  medium: 'var(--priority-medium, #2563EB)',
  low: 'var(--priority-low, #6B7280)',
};

export default function TaskCalendarView({
  tasks,
  onEditTask,
  onAddTaskForDate,
}: TaskCalendarViewProps) {
  const completeTask = useStore((s) => s.completeTask);
  const reopenTask = useStore((s) => s.reopenTask);
  const rescheduleTask = useStore((s) => s.rescheduleTask);

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const todayStr = new Date().toISOString().split('T')[0];

  // First day of month & total days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0=Sun..6=Sat
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleTodayJump = () => {
    setCurrentDate(new Date());
  };

  // Group tasks by dueDate
  const tasksByDate = React.useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((t) => {
      if (t.dueDate && !t.isArchived) {
        const arr = map.get(t.dueDate) || [];
        arr.push(t);
        map.set(t.dueDate, arr);
      }
    });
    return map;
  }, [tasks]);

  // Overdue tasks
  const overdueTasks = tasks.filter((t) => !t.isCompleted && t.isOverdue && !t.isArchived);

  // Generate calendar cells (42 cells: 6 rows of 7 days)
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({ day, dateStr });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Overdue Alert Bar if any overdue tasks */}
      {overdueTasks.length > 0 && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="var(--danger, #EF4444)" />
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--danger, #EF4444)' }}>
              {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''} Require Attention
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                overdueTasks.forEach((t) => rescheduleTask(t.id, todayStr));
              }}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '11px', padding: '3px 10px' }}
            >
              Move All to Today
            </button>
          </div>
        </div>
      )}

      {/* Calendar Controls Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'var(--bg-card)',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--panel-shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={handleTodayJump}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            Today
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handlePrevMonth}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 8px' }}
            title="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNextMonth}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 8px' }}
            title="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 7-Day Weekday Names Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          textAlign: 'center',
          fontSize: '11.5px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} style={{ padding: '6px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
        }}
      >
        {calendarCells.map((cell, idx) => {
          if (!cell) {
            return (
              <div
                key={`empty-${idx}`}
                style={{
                  minHeight: '110px',
                  background: 'var(--bg-secondary)',
                  opacity: 0.3,
                  borderRadius: '8px',
                  border: '1px dashed var(--border-default)',
                }}
              />
            );
          }

          const { day, dateStr } = cell;
          const dayTasks = tasksByDate.get(dateStr) || [];
          const isToday = dateStr === todayStr;

          return (
            <div
              key={dateStr}
              style={{
                minHeight: '110px',
                background: isToday ? 'var(--bg-elevated)' : 'var(--bg-card)',
                borderRadius: '8px',
                border: isToday ? '2px solid var(--palette-brick)' : '1px solid var(--border-default)',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.1s ease',
              }}
            >
              {/* Day Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: isToday ? 800 : 600,
                    color: isToday ? 'var(--palette-brick)' : 'var(--text-primary)',
                    background: isToday ? 'var(--palette-brick-subtle)' : 'transparent',
                    padding: isToday ? '1px 5px' : '0',
                    borderRadius: '4px',
                  }}
                >
                  {day}
                </span>

                <button
                  type="button"
                  onClick={() => onAddTaskForDate(dateStr)}
                  className="btn btn-ghost"
                  style={{ padding: '1px', color: 'var(--text-muted)' }}
                  title={`Add task for ${dateStr}`}
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Tasks List in Cell */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onEditTask(t)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      background: 'var(--bg-secondary)',
                      borderLeft: `2.5px solid ${PRIORITY_COLORS[t.priority] || 'var(--priority-medium)'}`,
                      fontSize: '11px',
                      cursor: 'pointer',
                      opacity: t.isCompleted ? 0.6 : 1,
                    }}
                    title={t.title}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (t.isCompleted) reopenTask(t.id);
                        else completeTask(t.id);
                      }}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {t.isCompleted ? (
                        <CheckCircle2 size={11} color="var(--status-success)" />
                      ) : (
                        <Circle size={11} />
                      )}
                    </button>
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: t.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: t.isCompleted ? 'line-through' : 'none',
                        flex: 1,
                      }}
                    >
                      {t.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
