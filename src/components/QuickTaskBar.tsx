import React, { useMemo, useState } from 'react';
import {
  Plus,
  Calendar,
  Flag,
  Tag,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import useStore from '../store/useStore';
import type { Priority } from '../types';
import { parseQuickTaskInput } from '../lib/quickAddParser';
import { todayLocal, tomorrowLocal } from '../lib/dates';

interface QuickTaskBarProps {
  onExpandDetails?: (initialValues?: {
    title: string;
    priority: Priority;
    dueDate?: string;
    category?: string;
    estimatedDuration?: number;
  }) => void;
  defaultCategory?: string;
  defaultGoalId?: string;
  compact?: boolean;
  placeholder?: string;
}

export default function QuickTaskBar({
  onExpandDetails,
  defaultCategory,
  defaultGoalId,
  compact = false,
  placeholder = 'Quick add task (e.g. "OS assignment tomorrow 5pm !high #academics")',
}: QuickTaskBarProps) {
  const addTask = useStore((s) => s.addTask);
  const addToast = useStore((s) => s.addToast);

  const [rawInput, setRawInput] = useState('');
  const [manualPriority, setManualPriority] = useState<Priority | null>(null);
  const [manualDueDate, setManualDueDate] = useState<string>('');
  const [estimatedDuration, setEstimatedDuration] = useState<number | undefined>(undefined);
  const [showOptions, setShowOptions] = useState(false);

  const todayStr = todayLocal();
  const tomorrowStr = tomorrowLocal();

  // Live NLP preview via chrono-node + tag extraction
  const parsed = useMemo(() => parseQuickTaskInput(rawInput), [rawInput]);

  const effectivePriority: Priority =
    manualPriority || (rawInput.includes('!') ? parsed.priority : 'medium');
  const effectiveDueDate = manualDueDate || parsed.dueDate;
  const effectiveCategory =
    parsed.category !== 'General' ? parsed.category : defaultCategory || 'General';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) return;

    const cleanTitle = parsed.title || rawInput.trim();

    if (defaultGoalId) {
      await addTask({
        title: cleanTitle,
        priority: effectivePriority,
        category: effectiveCategory,
        dueDate: effectiveDueDate || undefined,
        dueTime: parsed.dueTime,
        estimatedDuration,
        tags: [],
        goalId: defaultGoalId,
        status: 'todo',
        subtasks: [],
        isCompleted: false,
        isOverdue: false,
      });
    } else {
      await addTask({
        title: cleanTitle,
        priority: effectivePriority,
        category: effectiveCategory,
        dueDate: effectiveDueDate || undefined,
        dueTime: parsed.dueTime,
        estimatedDuration,
        tags: [],
        status: 'todo',
        subtasks: [],
        isCompleted: false,
        isOverdue: false,
      });
    }

    addToast({
      type: 'success',
      title: 'Task Added',
      message: `${cleanTitle}${effectiveDueDate ? ` (${effectiveDueDate})` : ''}`,
    });

    setRawInput('');
    setManualPriority(null);
    setManualDueDate('');
    setEstimatedDuration(undefined);
    setShowOptions(false);
  };

  const hasLiveSignals =
    rawInput.trim().length > 0 &&
    (Boolean(effectiveDueDate) ||
      Boolean(parsed.dueTime) ||
      effectivePriority !== 'medium' ||
      effectiveCategory !== 'General');

  return (
    <div className="quick-capture-bar" style={{ marginBottom: compact ? 0 : '18px' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--accent-subtle)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Plus size={15} />
          </div>

          <input
            type="text"
            className="quick-capture-input"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            onFocus={() => setShowOptions(true)}
            placeholder={placeholder}
            aria-label="Quick capture task"
          />

          {onExpandDetails && (
            <button
              type="button"
              onClick={() =>
                onExpandDetails({
                  title: parsed.title || rawInput.trim(),
                  priority: effectivePriority,
                  dueDate: effectiveDueDate || undefined,
                  category: effectiveCategory,
                  estimatedDuration,
                })
              }
              className="btn btn-ghost btn-icon"
              title="Open full task editor"
              aria-label="Open full task editor"
            >
              <Maximize2 size={14} />
            </button>
          )}

          <button
            type="submit"
            disabled={!rawInput.trim()}
            className="btn btn-primary btn-sm"
          >
            Add
          </button>
        </div>

        {/* Live parsed NLP signals preview */}
        {hasLiveSignals && (
          <div className="quick-capture-chips">
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={11} color="var(--accent-primary)" /> Parsed:
            </span>
            {effectiveDueDate && (
              <span className="badge badge-brick font-tabular">
                <Calendar size={10} /> {effectiveDueDate}
                {parsed.dueTime ? ` · ${parsed.dueTime}` : ''}
              </span>
            )}
            <span
              className={`badge ${
                effectivePriority === 'critical'
                  ? 'badge-danger'
                  : effectivePriority === 'high'
                  ? 'badge-warning'
                  : 'badge-silver'
              }`}
            >
              <Flag size={10} /> {effectivePriority}
            </span>
            {effectiveCategory !== 'General' && (
              <span className="badge badge-silver">
                <Tag size={10} /> {effectiveCategory}
              </span>
            )}
          </div>
        )}

        {/* Quick Override Bar when focused */}
        {showOptions && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setManualDueDate(manualDueDate === todayStr ? '' : todayStr)}
                className={`btn btn-sm ${manualDueDate === todayStr ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Calendar size={12} /> Today
              </button>
              <button
                type="button"
                onClick={() => setManualDueDate(manualDueDate === tomorrowStr ? '' : tomorrowStr)}
                className={`btn btn-sm ${manualDueDate === tomorrowStr ? 'btn-primary' : 'btn-secondary'}`}
              >
                Tomorrow
              </button>
              <select
                value={manualPriority || ''}
                onChange={(e) => setManualPriority((e.target.value as Priority) || null)}
                className="btn-sm"
                style={{ padding: '4px 8px', fontSize: '12px' }}
                aria-label="Override priority"
              >
                <option value="">Auto Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={estimatedDuration || ''}
                onChange={(e) => setEstimatedDuration(e.target.value ? Number(e.target.value) : undefined)}
                className="btn-sm"
                style={{ padding: '4px 8px', fontSize: '12px' }}
                aria-label="Estimated duration"
              >
                <option value="">Duration</option>
                <option value="15">15m</option>
                <option value="25">25m Sprint</option>
                <option value="45">45m</option>
                <option value="60">60m Deep</option>
              </select>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Tip: Try <code style={{ fontFamily: 'var(--font-mono)' }}>tomorrow 4pm !high #academics</code>
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
