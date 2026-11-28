import React, { useMemo, useState } from 'react';
import {
  Compass,
  Heart,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import useStore from '../store/useStore';
import { todayLocal } from '../lib/dates';
import type { LifestyleCategory, LifestyleItem } from '../types';
import { EmptyState } from '../components/ui';

const CATEGORIES: Array<{ id: 'all' | LifestyleCategory; label: string }> = [
  { id: 'all', label: 'All Dimensions' },
  { id: 'travel', label: 'Travel' },
  { id: 'hobby', label: 'Hobbies' },
  { id: 'memory', label: 'Memories' },
  { id: 'relationship', label: 'Relationships' },
  { id: 'experience', label: 'Experiences' },
];

export default function LifestylePage() {
  const lifestyleItems = useStore((s) => s.lifestyleItems);
  const settings = useStore((s) => s.settings);
  const saveLifestyleItem = useStore((s) => s.saveLifestyleItem);
  const deleteLifestyleItem = useStore((s) => s.deleteLifestyleItem);
  const setActiveView = useStore((s) => s.setActiveView);
  const addToast = useStore((s) => s.addToast);

  const [categoryFilter, setCategoryFilter] = useState<'all' | LifestyleCategory>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LifestyleCategory>('experience');
  const [status, setStatus] = useState<'planned' | 'active' | 'completed'>('planned');
  const [date, setDate] = useState(todayLocal());
  const [location, setLocation] = useState('');
  const [peopleText, setPeopleText] = useState('');
  const [notes, setNotes] = useState('');

  const isDemoMode = Boolean(settings.isDemoMode);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lifestyleItems
      .filter((item) => !item.deletedAt && (isDemoMode || item.isDemo !== true))
      .filter((item) => (categoryFilter === 'all' ? true : item.category === categoryFilter))
      .filter((item) => {
        if (!q) return true;
        return (
          item.title.toLowerCase().includes(q) ||
          (item.location || '').toLowerCase().includes(q) ||
          (item.notes || '').toLowerCase().includes(q) ||
          (item.people || []).some((p) => p.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
  }, [lifestyleItems, isDemoMode, categoryFilter, search]);

  const counts = useMemo(() => {
    const active = lifestyleItems.filter(
      (i) => !i.deletedAt && (isDemoMode || i.isDemo !== true)
    );
    return {
      total: active.length,
      planned: active.filter((i) => i.status === 'planned').length,
      completed: active.filter((i) => i.status === 'completed').length,
    };
  }, [lifestyleItems, isDemoMode]);

  const openNewModal = (presetCat: LifestyleCategory = 'experience') => {
    setEditingId(undefined);
    setTitle('');
    setCategory(presetCat);
    setStatus(presetCat === 'memory' ? 'completed' : 'planned');
    setDate(todayLocal());
    setLocation('');
    setPeopleText('');
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (item: LifestyleItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setStatus(item.status);
    setDate(item.date || todayLocal());
    setLocation(item.location || '');
    setPeopleText((item.people || []).join(', '));
    setNotes(item.notes || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const people = peopleText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await saveLifestyleItem({
      id: editingId,
      title: cleanTitle,
      category,
      status,
      date: date || undefined,
      location: location.trim() || undefined,
      people: people.length > 0 ? people : undefined,
      notes: notes.trim() || undefined,
    });

    setModalOpen(false);
    addToast({
      type: 'success',
      title: editingId ? 'Lifestyle Item Updated' : 'Lifestyle Item Saved',
      message: `${cleanTitle} saved to Lifestyle & Experiences.`,
    });
  };

  const handleCycleStatus = async (item: LifestyleItem) => {
    const nextStatus =
      item.status === 'planned'
        ? 'active'
        : item.status === 'active'
        ? 'completed'
        : 'planned';
    await saveLifestyleItem({ ...item, status: nextStatus });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Lifestyle & Experiences
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Track travel plans, hobbies, meaningful memories, relationships, and lived experiences outside work.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              try {
                sessionStorage.setItem(
                  'lifeos_rit_pending_prompt',
                  'Summarize my lifestyle balance, hobbies, and planned experiences.'
                );
              } catch {}
              setActiveView('assistant');
            }}
          >
            <Sparkles size={15} />
            Ask RIT
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => openNewModal()}
          >
            <Plus size={15} />
            Add Experience
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Recorded</div>
          <div className="font-tabular" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {counts.total}
          </div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Planned Next</div>
          <div className="font-tabular" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {counts.planned}
          </div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Lived & Memories</div>
          <div className="font-tabular" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {counts.completed}
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div
        className="card"
        style={{
          padding: '12px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`btn btn-sm ${categoryFilter === cat.id ? 'btn-primary' : 'btn-ghost'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px', flex: '0 1 280px' }}>
          <Search size={14} color="var(--text-secondary)" />
          <input
            type="text"
            className="input"
            aria-label="Search lifestyle items"
            placeholder="Search places, people, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Items Grid or Empty State */}
      {visibleItems.length === 0 ? (
        <div className="card" style={{ padding: '24px' }}>
          <EmptyState
            icon={<Compass size={26} />}
            title={
              counts.total === 0
                ? 'Capture what makes life worth living'
                : 'No entries match your current filter'
            }
            description={
              counts.total === 0
                ? 'Log a trip you want to take, a creative hobby, a favorite memory, or time with people who matter.'
                : 'Clear your search query or switch category filters to view your entries.'
            }
            action={
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (counts.total === 0) {
                    openNewModal('experience');
                  } else {
                    setCategoryFilter('all');
                    setSearch('');
                  }
                }}
              >
                {counts.total === 0 ? 'Add First Experience' : 'Clear Filters'}
              </button>
            }
          />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '14px',
          }}
        >
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <span className="badge badge-silver" style={{ textTransform: 'capitalize' }}>
                    {item.category}
                  </span>
                  <button
                    type="button"
                    className={`badge ${
                      item.status === 'completed'
                        ? 'badge-success'
                        : item.status === 'active'
                        ? 'badge-warning'
                        : 'badge-silver'
                    }`}
                    style={{ cursor: 'pointer', border: 'none' }}
                    onClick={() => void handleCycleStatus(item)}
                    title="Click to cycle status"
                  >
                    {item.status === 'completed' ? (
                      <CheckCircle2 size={11} style={{ marginRight: 4 }} />
                    ) : (
                      <Clock size={11} style={{ marginRight: 4 }} />
                    )}
                    {item.status}
                  </button>
                </div>

                <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                  {item.title}
                </h2>

                {item.notes && (
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.45 }}>
                    {item.notes}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {item.date && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={12} /> {item.date}
                    </span>
                  )}
                  {item.location && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={12} /> {item.location}
                    </span>
                  )}
                  {item.people && item.people.length > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={12} /> {item.people.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '10px',
                }}
              >
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => openEditModal(item)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  aria-label={`Delete ${item.title}`}
                  onClick={() => void deleteLifestyleItem(item.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? 'Edit Lifestyle Item' : 'New Lifestyle Item'}
          onClick={() => setModalOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setModalOpen(false);
          }}
        >
          <div
            className="modal"
            style={{ maxWidth: '480px', width: '92%', padding: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={16} color="var(--accent-primary)" />
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {editingId ? 'Edit Lifestyle Entry' : 'Add Lifestyle & Experience'}
                </h2>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                aria-label="Close modal"
                onClick={() => setModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="label" htmlFor="lifestyle-title">Title</label>
                <input
                  id="lifestyle-title"
                  className="input"
                  autoFocus
                  required
                  placeholder="e.g., Weekend trek in Coorg or Evening jam session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label" htmlFor="lifestyle-cat">Category</label>
                  <select
                    id="lifestyle-cat"
                    className="input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as LifestyleCategory)}
                  >
                    <option value="travel">Travel</option>
                    <option value="hobby">Hobby</option>
                    <option value="memory">Memory</option>
                    <option value="relationship">Relationship</option>
                    <option value="experience">Experience</option>
                  </select>
                </div>

                <div>
                  <label className="label" htmlFor="lifestyle-status">Status</label>
                  <select
                    id="lifestyle-status"
                    className="input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'planned' | 'active' | 'completed')}
                  >
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label" htmlFor="lifestyle-date">Date</label>
                  <input
                    id="lifestyle-date"
                    type="date"
                    className="input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="lifestyle-location">Location</label>
                  <input
                    id="lifestyle-location"
                    className="input"
                    placeholder="Optional place"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="lifestyle-people">People (comma separated)</label>
                <input
                  id="lifestyle-people"
                  className="input"
                  placeholder="e.g., Aarav, Family, Hostel squad"
                  value={peopleText}
                  onChange={(e) => setPeopleText(e.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="lifestyle-notes">Notes or reflection</label>
                <textarea
                  id="lifestyle-notes"
                  className="input"
                  rows={3}
                  placeholder="Why it matters, highlights, or things to bring..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Save Changes' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
