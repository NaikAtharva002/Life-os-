import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  RotateCcw,
  X,
} from 'lucide-react';
import { MarkdownMessage } from '../MarkdownMessage';
import { RitAvatar } from './RitAvatar';
import type { AssistantMessage, RitPendingAction } from '../../types';

interface RitResponseCardProps {
  message: AssistantMessage;
  userInitial: string;
  currency: string;
  onNavigateView: (viewId: string) => void;
  onConfirmAction: (messageId: string, action: RitPendingAction) => Promise<void>;
  onCancelAction: (messageId: string, action: RitPendingAction) => void;
  onRetryPrompt?: (promptText: string) => void;
}

export const RitResponseCard: React.FC<RitResponseCardProps> = ({
  message,
  userInitial,
  currency,
  onNavigateView,
  onConfirmAction,
  onCancelAction,
  onRetryPrompt,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  if (isUser) {
    return (
      <div className="rit-msg-row rit-msg-user">
        <div className="rit-user-bubble">{message.content}</div>
        <div className="rit-user-badge" aria-hidden="true">
          {userInitial}
        </div>
      </div>
    );
  }

  const action = message.pendingAction;

  return (
    <div className="rit-msg-row rit-msg-assistant">
      <div className="rit-msg-avatar">
        <RitAvatar size={30} shape="circle" />
      </div>

      <div className="rit-response-panel">
        <div className="rit-response-meta">
          <div className="rit-response-author">
            <span className="rit-author-name">RIT</span>
            {message.source && (
              <span className="rit-source-pill">
                {message.source === 'nvidia-nim' ? 'NVIDIA NIM' : 'Local Rhythm'}
              </span>
            )}
          </div>
          <button
            type="button"
            className="rit-copy-btn"
            onClick={handleCopy}
            aria-label="Copy response"
            title="Copy response"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {message.notice && (
          <div className="rit-notice-banner" role="status">
            <AlertTriangle size={13} />
            <span>{message.notice}</span>
            {message.retryPrompt && onRetryPrompt && (
              <button
                type="button"
                className="rit-notice-retry"
                onClick={() => onRetryPrompt(message.retryPrompt!)}
              >
                <RotateCcw size={11} /> Retry
              </button>
            )}
          </div>
        )}

        <div className="rit-response-body">
          <MarkdownMessage content={message.content} />
        </div>

        {/* Interactive Confirmation Card for Life OS Mutations */}
        {action && (
          <div className={`rit-action-confirm-card status-${action.status}`}>
            <div className="rit-action-confirm-details">
              <span className="rit-action-kind">
                {action.type === 'create_task'
                  ? 'New Life OS Task'
                  : action.type === 'complete_task'
                  ? 'Complete Task'
                  : action.type === 'toggle_habit'
                  ? 'Habit Check-In'
                  : action.type === 'create_goal'
                  ? 'New Goal'
                  : 'Finance Record'}
              </span>

              <div className="rit-action-summary-line">
                {action.type === 'create_task' && (
                  <>
                    <strong>{action.title}</strong>
                    <span>
                      {action.dueDate || 'Today'}
                      {action.dueTime ? ` • ${action.dueTime}` : ''} • {action.priority.toUpperCase()} • {action.category}
                    </span>
                  </>
                )}
                {action.type === 'complete_task' && (
                  <>
                    <strong>{action.taskTitle}</strong>
                    <span>Marks task completed in Life OS Tasks</span>
                  </>
                )}
                {action.type === 'toggle_habit' && (
                  <>
                    <strong>{action.habitName}</strong>
                    <span>Logs today&apos;s entry ({action.date})</span>
                  </>
                )}
                {action.type === 'create_goal' && (
                  <>
                    <strong>{action.title}</strong>
                    <span>
                      {action.priority.toUpperCase()} • {action.category}
                      {action.targetDate ? ` • Target ${action.targetDate}` : ''}
                    </span>
                  </>
                )}
                {action.type === 'create_transaction' && (
                  <>
                    <strong>
                      {currency}
                      {action.amount.toFixed(2)} — {action.description}
                    </strong>
                    <span>
                      {action.category} • {action.date}
                    </span>
                  </>
                )}
              </div>
            </div>

            {action.status === 'pending' && (
              <div className="rit-action-buttons">
                <button
                  type="button"
                  className="rit-confirm-btn"
                  onClick={() => onConfirmAction(message.id, action)}
                >
                  <Check size={13} /> Confirm
                </button>
                <button
                  type="button"
                  className="rit-cancel-btn"
                  onClick={() => onCancelAction(message.id, action)}
                >
                  <X size={13} /> Cancel
                </button>
              </div>
            )}

            {action.status === 'executing' && (
              <div className="rit-action-state is-executing">
                <Loader2 size={13} className="rit-spin" /> Saving to Life OS...
              </div>
            )}

            {action.status === 'confirmed' && (
              <div className="rit-action-state is-confirmed">
                <CheckCircle2 size={14} /> Saved in Life OS
              </div>
            )}

            {action.status === 'cancelled' && (
              <div className="rit-action-state is-cancelled">Cancelled — no changes made.</div>
            )}

            {action.status === 'error' && (
              <div className="rit-action-state is-error">
                <AlertTriangle size={13} /> {action.errorMessage || 'Could not save change.'}
                <button
                  type="button"
                  className="rit-confirm-btn"
                  onClick={() => onConfirmAction(message.id, action)}
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Contextual Navigation Chips */}
        {message.suggestedViews && message.suggestedViews.length > 0 && (
          <div className="rit-suggested-links">
            {message.suggestedViews.map((link) => (
              <button
                key={link.viewId}
                type="button"
                className="rit-module-pill"
                onClick={() => onNavigateView(link.viewId)}
              >
                <span>{link.label}</span>
                <ArrowUpRight size={11} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
