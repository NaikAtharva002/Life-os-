import React, { useEffect, useState } from 'react';
import { X, Plus, Link2 } from 'lucide-react';
import {
  RELATION_LABELS,
  UNIVERSE_CATEGORIES,
  type UniverseNode,
} from '../../lib/knowledgeGraph';
import type {
  CustomGraphNode,
  CustomGraphNodeKind,
  UniverseCategory,
  UniverseRelationType,
} from '../../types';

const CUSTOM_KINDS: Array<{ id: CustomGraphNodeKind; label: string; defaultCat: UniverseCategory }> = [
  { id: 'note', label: 'Knowledge Note', defaultCat: 'knowledge' },
  { id: 'personal-topic', label: 'Personal Topic', defaultCat: 'personal' },
  { id: 'interest', label: 'Personal Interest', defaultCat: 'personal' },
  { id: 'concept', label: 'Concept / Idea', defaultCat: 'knowledge' },
  { id: 'learning-resource', label: 'Learning Resource', defaultCat: 'knowledge' },
  { id: 'research', label: 'Research Thread', defaultCat: 'knowledge' },
  { id: 'brand', label: 'Brand', defaultCat: 'business' },
  { id: 'business-idea', label: 'Business Idea', defaultCat: 'business' },
  { id: 'marketing-project', label: 'Marketing Project', defaultCat: 'business' },
  { id: 'product', label: 'Product', defaultCat: 'business' },
  { id: 'institution', label: 'Institution / University', defaultCat: 'academics' },
  { id: 'tool', label: 'Tool / Platform', defaultCat: 'technology' },
  { id: 'language', label: 'Programming Language', defaultCat: 'technology' },
  { id: 'framework', label: 'Framework / Library', defaultCat: 'technology' },
  { id: 'ai-experiment', label: 'AI Experiment', defaultCat: 'technology' },
  { id: 'custom', label: 'Custom Node', defaultCat: 'personal' },
];

interface CustomNodeModalProps {
  isOpen: boolean;
  editingNode?: CustomGraphNode | null;
  availableNodes: UniverseNode[];
  onClose: () => void;
  onSave: (payload: {
    id?: string;
    title: string;
    description: string;
    category: UniverseCategory;
    kind: CustomGraphNodeKind;
    tags: string[];
    relatedNodeIds: string[];
  }) => Promise<void>;
}

export const CustomNodeModal: React.FC<CustomNodeModalProps> = ({
  isOpen,
  editingNode,
  availableNodes,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<CustomGraphNodeKind>('personal-topic');
  const [category, setCategory] = useState<UniverseCategory>('personal');
  const [tagsText, setTagsText] = useState('');
  const [relatedNodeIds, setRelatedNodeIds] = useState<string[]>([]);
  const [relatedSearch, setRelatedSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingNode) {
      setTitle(editingNode.title);
      setDescription(editingNode.description || '');
      setKind(editingNode.kind || 'custom');
      setCategory(editingNode.category || 'personal');
      setTagsText(editingNode.tags?.join(', ') || '');
      setRelatedNodeIds(editingNode.relatedNodeIds || []);
    } else {
      setTitle('');
      setDescription('');
      setKind('personal-topic');
      setCategory('personal');
      setTagsText('');
      setRelatedNodeIds([]);
    }
    setRelatedSearch('');
  }, [isOpen, editingNode]);

  if (!isOpen) return null;

  const linkableNodes = availableNodes.filter(
    (n) =>
      n.id !== editingNode?.id &&
      n.kind !== 'category-hub' &&
      (!relatedSearch.trim() ||
        n.title.toLowerCase().includes(relatedSearch.trim().toLowerCase()) ||
        n.category.toLowerCase().includes(relatedSearch.trim().toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await onSave({
        id: editingNode?.id,
        title: title.trim(),
        description: description.trim(),
        category,
        kind,
        tags: tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        relatedNodeIds,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const toggleRelated = (id: string) => {
    setRelatedNodeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={editingNode ? 'Edit Universe Node' : 'Add Universe Node'}>
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} color="var(--accent-primary)" />
            <h3 className="modal-title">{editingNode ? 'Edit Custom Node' : 'Add to Knowledge Universe'}</h3>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label className="label" htmlFor="ku-node-title">Title *</label>
              <input
                id="ku-node-title"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Distributed Consensus Research or Acme Brand"
                autoFocus
                required
              />
            </div>

            <div className="grid-2">
              <div>
                <label className="label" htmlFor="ku-node-kind">Node Type</label>
                <select
                  id="ku-node-kind"
                  className="select"
                  value={kind}
                  onChange={(e) => {
                    const nextKind = e.target.value as CustomGraphNodeKind;
                    setKind(nextKind);
                    const matched = CUSTOM_KINDS.find((k) => k.id === nextKind);
                    if (matched && !editingNode) setCategory(matched.defaultCat);
                  }}
                >
                  {CUSTOM_KINDS.map((k) => (
                    <option key={k.id} value={k.id}>{k.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="ku-node-cat">Domain Category</label>
                <select
                  id="ku-node-cat"
                  className="select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as UniverseCategory)}
                >
                  {UNIVERSE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="ku-node-desc">Description</label>
              <textarea
                id="ku-node-desc"
                className="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Context, idea details, or why this connects to your workspace..."
              />
            </div>

            <div>
              <label className="label" htmlFor="ku-node-tags">Tags (comma-separated)</label>
              <input
                id="ku-node-tags"
                className="input"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="systems, design, learning"
              />
            </div>

            {!editingNode && availableNodes.length > 0 && (
              <div>
                <label className="label">Connect to Existing Records ({relatedNodeIds.length} selected)</label>
                <input
                  className="input"
                  value={relatedSearch}
                  onChange={(e) => setRelatedSearch(e.target.value)}
                  placeholder="Filter existing goals, projects, subjects, notes..."
                  style={{ marginBottom: '6px' }}
                />
                <div
                  style={{
                    maxHeight: '140px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    background: 'var(--bg-elevated)',
                  }}
                >
                  {linkableNodes.slice(0, 30).map((n) => {
                    const checked = relatedNodeIds.includes(n.id);
                    return (
                      <label
                        key={n.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '4px 6px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          background: checked ? 'var(--accent-subtle)' : 'transparent',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRelated(n.id)}
                          style={{ accentColor: 'var(--accent-primary)' }}
                        />
                        <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: checked ? 600 : 400 }}>
                          {n.title}
                        </span>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          {n.category}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={!title.trim() || saving} className="btn btn-primary btn-sm">
              {saving ? 'Saving...' : editingNode ? 'Save Changes' : 'Create Node'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ConnectNodesModalProps {
  isOpen: boolean;
  initialSourceId?: string | null;
  availableNodes: UniverseNode[];
  onClose: () => void;
  onConnect: (payload: {
    sourceId: string;
    targetId: string;
    relationType: UniverseRelationType;
    label?: string;
  }) => Promise<void>;
}

export const ConnectNodesModal: React.FC<ConnectNodesModalProps> = ({
  isOpen,
  initialSourceId,
  availableNodes,
  onClose,
  onConnect,
}) => {
  const selectable = availableNodes.filter((n) => n.kind !== 'category-hub');
  const [sourceId, setSourceId] = useState(initialSourceId || selectable[0]?.id || 'me');
  const [targetId, setTargetId] = useState(selectable[1]?.id || 'me');
  const [relationType, setRelationType] = useState<UniverseRelationType>('related_to');
  const [customLabel, setCustomLabel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const nextSrc = initialSourceId && selectable.some((n) => n.id === initialSourceId)
      ? initialSourceId
      : selectable[0]?.id || 'me';
    setSourceId(nextSrc);
    const nextTgt = selectable.find((n) => n.id !== nextSrc)?.id || 'me';
    setTargetId(nextTgt);
    setRelationType('related_to');
    setCustomLabel('');
  }, [isOpen, initialSourceId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId || sourceId === targetId || saving) return;
    setSaving(true);
    try {
      await onConnect({
        sourceId,
        targetId,
        relationType,
        label: customLabel.trim() || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Connect Two Nodes">
      <div className="modal-content" style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link2 size={16} color="var(--accent-primary)" />
            <h3 className="modal-title">Create Relationship</h3>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label className="label" htmlFor="ku-edge-source">From Node</label>
              <select
                id="ku-edge-source"
                className="select"
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
              >
                {selectable.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title} ({n.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="ku-edge-rel">Relationship Type</label>
              <select
                id="ku-edge-rel"
                className="select"
                value={relationType}
                onChange={(e) => setRelationType(e.target.value as UniverseRelationType)}
              >
                {(Object.entries(RELATION_LABELS) as [UniverseRelationType, string][]).map(
                  ([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="ku-edge-target">To Node</label>
              <select
                id="ku-edge-target"
                className="select"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
              >
                {selectable.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title} ({n.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="ku-edge-label">Optional Custom Label</label>
              <input
                id="ku-edge-label"
                className="input"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder={RELATION_LABELS[relationType]}
              />
            </div>

            {sourceId === targetId && (
              <div style={{ fontSize: '12px', color: 'var(--status-danger)' }}>
                Select two distinct nodes to create a relationship.
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!sourceId || !targetId || sourceId === targetId || saving}
              className="btn btn-primary btn-sm"
            >
              {saving ? 'Connecting...' : 'Create Connection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
