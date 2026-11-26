import React from 'react';
import {
  X,
  ExternalLink,
  Edit3,
  Link2,
  Trash2,
  GitBranch,
  Focus,
  Calendar,
  Tag,
} from 'lucide-react';
import {
  UNIVERSE_CATEGORY_MAP,
  type UniverseEdge,
  type UniverseNode,
} from '../../lib/knowledgeGraph';

interface UniverseNodeInspectorProps {
  node: UniverseNode;
  allNodes: UniverseNode[];
  edges: UniverseEdge[];
  connectionScope: 'all' | 'direct';
  onToggleConnectionScope: () => void;
  onClose: () => void;
  onSelectNeighbor: (nodeId: string) => void;
  onOpenModule: (node: UniverseNode) => void;
  onEditCustomNode: (node: UniverseNode) => void;
  onDeleteCustomNode: (nodeId: string) => void;
  onOpenConnectModal: (sourceId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
}

export const UniverseNodeInspector: React.FC<UniverseNodeInspectorProps> = ({
  node,
  allNodes,
  edges,
  connectionScope,
  onToggleConnectionScope,
  onClose,
  onSelectNeighbor,
  onOpenModule,
  onEditCustomNode,
  onDeleteCustomNode,
  onOpenConnectModal,
  onDeleteEdge,
}) => {
  const catMeta = UNIVERSE_CATEGORY_MAP[node.category] || UNIVERSE_CATEGORY_MAP.personal;
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

  const relatedEdges = edges
    .filter((e) => e.source === node.id || e.target === node.id)
    .map((edge) => {
      const isOutgoing = edge.source === node.id;
      const otherId = isOutgoing ? edge.target : edge.source;
      return {
        edge,
        isOutgoing,
        other: nodeMap.get(otherId),
      };
    })
    .filter((item) => Boolean(item.other));

  return (
    <aside
      className="universe-inspector"
      aria-label="Node Information Panel"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <span
              className="badge"
              style={{
                background: `${catMeta.color}20`,
                color: catMeta.color,
                border: `1px solid ${catMeta.color}40`,
              }}
            >
              {catMeta.label}
            </span>
            {node.status && (
              <span
                className="badge badge-secondary"
                style={{ textTransform: 'capitalize' }}
              >
                {node.status}
              </span>
            )}
            {node.isCustom && (
              <span className="badge badge-brick">Custom Node</span>
            )}
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              wordBreak: 'break-word',
            }}
          >
            {node.title}
          </h3>
          {node.subtitle && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
              {node.subtitle}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-icon"
          aria-label="Close inspector"
        >
          <X size={15} />
        </button>
      </div>

      {/* Scrollable Body */}
      <div
        style={{
          padding: '14px 16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          flex: 1,
        }}
      >
        {typeof node.progress === 'number' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '5px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Progress</span>
              <span className="font-tabular" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {node.progress}%
              </span>
            </div>
            <div className="progress-hairline">
              <div
                className="progress-hairline-fill"
                style={{ width: `${Math.min(100, Math.max(0, node.progress))}%`, background: catMeta.color }}
              />
            </div>
          </div>
        )}

        {node.description && (
          <p
            style={{
              margin: 0,
              fontSize: '12.5px',
              lineHeight: 1.55,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {node.description}
          </p>
        )}

        {node.tags && node.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
            <Tag size={12} color="var(--text-muted)" />
            {node.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {node.createdAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            <Calendar size={12} />
            <span>Created {node.createdAt.slice(0, 10)}</span>
          </div>
        )}

        {/* Connections List */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <span className="section-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <GitBranch size={12} />
              Connections ({relatedEdges.length})
            </span>
            <button
              type="button"
              onClick={onToggleConnectionScope}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', padding: '2px 8px', height: '24px' }}
            >
              <Focus size={11} />
              {connectionScope === 'direct' ? 'Show All' : 'Isolate Direct'}
            </button>
          </div>

          {relatedEdges.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '6px 0' }}>
              No direct connections in current filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {relatedEdges.map(({ edge, isOutgoing, other }) => {
                if (!other) return null;
                const otherMeta = UNIVERSE_CATEGORY_MAP[other.category] || UNIVERSE_CATEGORY_MAP.personal;
                return (
                  <div
                    key={edge.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectNeighbor(other.id)}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: otherMeta.color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {other.title}
                        </span>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          {isOutgoing ? '→' : '←'} {edge.label}
                        </span>
                      </span>
                    </button>

                    {edge.isCustom && (
                      <button
                        type="button"
                        onClick={() => onDeleteEdge(edge.id)}
                        className="btn btn-ghost btn-icon"
                        style={{ width: '24px', height: '24px', color: 'var(--status-danger)' }}
                        aria-label={`Remove connection to ${other.title}`}
                        title="Remove custom connection"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {node.route && (
          <button
            type="button"
            onClick={() => onOpenModule(node)}
            className="btn btn-primary btn-sm"
            style={{ flex: '1 1 120px' }}
          >
            <ExternalLink size={13} />
            Open Record
          </button>
        )}

        {node.isCustom ? (
          <button
            type="button"
            onClick={() => onEditCustomNode(node)}
            className="btn btn-secondary btn-sm"
          >
            <Edit3 size={13} />
            Edit
          </button>
        ) : node.route ? (
          <button
            type="button"
            onClick={() => onOpenModule(node)}
            className="btn btn-secondary btn-sm"
          >
            <Edit3 size={13} />
            Edit in Module
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => onOpenConnectModal(node.id)}
          className="btn btn-secondary btn-sm"
        >
          <Link2 size={13} />
          Connect
        </button>

        {node.isCustom && (
          <button
            type="button"
            onClick={() => onDeleteCustomNode(node.id)}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--status-danger)' }}
            aria-label="Delete custom node"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </aside>
  );
};
