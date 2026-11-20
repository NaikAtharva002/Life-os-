import React, { useState } from 'react';
import useStore from '../store/useStore';
import JSZip from 'jszip';
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Folder,
  Tag,
  Search,
  ExternalLink,
  Save,
  Check,
} from 'lucide-react';
import type { ObsidianNote } from '../types';

export default function ObsidianPage() {
  const notes = useStore((s) => s.obsidianNotes);
  const goals = useStore((s) => s.goals);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitEntries = useStore((s) => s.habitEntries);
  const eveningReviews = useStore((s) => s.eveningReviews);
  const academicSubjects = useStore((s) => s.academicSubjects);
  const careerProjects = useStore((s) => s.careerProjects);
  const saveNote = useStore((s) => s.saveNote);
  const deleteNote = useStore((s) => s.deleteNote);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Note editor form
  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];
  const [editTitle, setEditTitle] = useState(activeNote?.title || '');
  const [editFolder, setEditFolder] = useState(activeNote?.folder || 'Notes');
  const [editContent, setEditContent] = useState(activeNote?.content || '');
  const [editTags, setEditTags] = useState(activeNote?.tags?.join(', ') || '');

  // Select note handler
  const handleSelectNote = (note: ObsidianNote) => {
    setSelectedNoteId(note.id);
    setEditTitle(note.title);
    setEditFolder(note.folder);
    setEditContent(note.content);
    setEditTags(note.tags?.join(', ') || '');
  };

  // Save changes handler
  const handleSave = async () => {
    if (!editTitle) return;
    await saveNote({
      id: activeNote?.id,
      title: editTitle,
      folder: editFolder,
      content: editContent,
      tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  // Create new note
  const handleCreateNew = async () => {
    const newNote: Omit<ObsidianNote, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'Untitled Note',
      folder: 'Notes',
      content: `# Untitled Note\n\nStart writing in Markdown with [[Wikilinks]]...`,
      tags: ['notes'],
    };
    await saveNote(newNote);
    const updatedNotes = useStore.getState().obsidianNotes;
    const latest = updatedNotes[0];
    if (latest) {
      handleSelectNote(latest);
    }
  };

  // Export Entire Obsidian Vault as .zip
  const handleExportObsidianVault = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();

      // 1. In-App User Notes
      notes.forEach((note) => {
        const path = `${note.folder}/${note.title.replace(/[\/\\?%*:|"<>]/g, '-')}.md`;
        zip.file(path, note.content);
      });

      // 2. Daily Journals from Evening Reviews
      eveningReviews.forEach((rev) => {
        const md = `---
date: ${rev.date}
rating: ${rev.rating}/5
tasks_completed: ${rev.tasksCompleted?.length || 0}
tasks_pending: ${rev.tasksPending?.length || 0}
tags:
  - daily-journal
  - review
---

# Daily Journal — ${rev.date}

## Reflections
${rev.reflection || 'No reflection recorded.'}

### What Went Wrong
${rev.whatWentWrong || 'None noted.'}

### What To Improve Tomorrow
${rev.whatToImproveTomorrow || 'None noted.'}

## Tomorrow's Top 3 Priorities
${rev.tomorrowPriorities?.map((p, i) => `${i + 1}. ${p}`).join('\n') || 'None set.'}
`;
        zip.file(`Daily Journals/${rev.date}.md`, md);
      });

      // 3. Goal Vault Notes
      goals.forEach((g) => {
        const md = `---
goal: "${g.title}"
priority: "${g.priority}"
progress: ${g.progress}%
target_date: "${g.targetDate || 'None'}"
tags:
  - goals
  - ${g.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}
---

# ${g.title}

> ${g.description}

## Milestones
${g.milestones.map((m) => `- [${m.isCompleted ? 'x' : ' '}] ${m.title}`).join('\n')}
`;
        zip.file(`Goals/${g.title.replace(/[\/\\?%*:|"<>]/g, '-')}.md`, md);
      });

      // 4. Academic Course Notes
      academicSubjects.forEach((sub) => {
        const md = `---
code: "${sub.code}"
name: "${sub.name}"
credits: ${sub.credits}
attendance: "${((sub.attendedClasses / (sub.totalClasses || 1)) * 100).toFixed(1)}%"
tags:
  - academics
  - university
---

# ${sub.code} — ${sub.name}

Professor: ${sub.professor || 'Unknown'}  
Room: ${sub.roomOrLink || 'Lecture Hall'}

## Course Notes
`;
        zip.file(`Academics/${sub.code}.md`, md);
      });

      // Generate zip blob
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LifeOS-Obsidian-Vault-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export vault:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Filtered Notes
  const folders = ['All', ...Array.from(new Set(notes.map((n) => n.folder)))];
  const filteredNotes = notes.filter((n) => {
    if (selectedFolder !== 'All' && n.folder !== selectedFolder) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="page-container" style={{ padding: '24px 28px', maxWidth: '1380px', margin: '0 auto', height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Obsidian Markdown Vault
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
            Bi-directional Wikilinks [[Note]], structured folder hierarchies, and one-click full vault export.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExportObsidianVault}
            disabled={isExporting}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Download size={15} /> {isExporting ? 'Generating Vault...' : 'Export Obsidian .zip'}
          </button>
          <button
            onClick={handleCreateNew}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Plus size={15} /> New Note
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Note Browser + Right Markdown Editor */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '18px', flex: 1, minHeight: 0 }}>
        
        {/* Left: Notes List & Folders */}
        <div
          className="card"
          style={{
            background: 'var(--bg-card)',
            borderRadius: '14px',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Search Bar */}
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search vault notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '12.5px',
                  width: '100%',
                  outline: 'none',
                }}
              />
            </div>

            {/* Folder Filter */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
              {folders.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFolder(f)}
                  style={{
                    border: 'none',
                    background: selectedFolder === f ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: selectedFolder === f ? '#fff' : 'var(--text-muted)',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Note List Items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {filteredNotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No notes found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredNotes.map((note) => {
                  const isSelected = activeNote?.id === note.id;
                  return (
                    <div
                      key={note.id}
                      onClick={() => handleSelectNote(note)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: isSelected ? 'var(--bg-hover)' : 'transparent',
                        borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '13px', color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {note.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <span>{note.folder}</span>
                        <span>•</span>
                        <span>{note.updatedAt?.substring(0, 10)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Markdown Note Editor & Preview */}
        {activeNote ? (
          <div
            className="card"
            style={{
              background: 'var(--bg-card)',
              borderRadius: '14px',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Editor Toolbar */}
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    width: '60%',
                  }}
                  placeholder="Note Title..."
                />
                <input
                  type="text"
                  value={editFolder}
                  onChange={(e) => setEditFolder(e.target.value)}
                  style={{
                    fontSize: '12px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-secondary)',
                    padding: '3px 8px',
                    width: '120px',
                  }}
                  placeholder="Folder name"
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSave}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', padding: '6px 12px' }}
                >
                  <Save size={14} /> Save Note
                </button>
                <button
                  onClick={() => deleteNote(activeNote.id)}
                  className="btn btn-ghost"
                  style={{ padding: '6px', color: 'var(--text-muted)' }}
                  title="Delete note"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Tags strip */}
            <div style={{ padding: '8px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={13} color="var(--text-muted)" />
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="Comma separated tags: academics, raft, systems..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  width: '100%',
                  outline: 'none',
                }}
              />
            </div>

            {/* Split Markdown Input Area */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 0 }}>
              {/* Raw Markdown Editor */}
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderRight: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  padding: '16px 20px',
                  resize: 'none',
                  outline: 'none',
                }}
                placeholder="Type Markdown content here. Use [[Other Note]] for Wikilinks..."
              />

              {/* Rendered Preview */}
              <div
                style={{
                  padding: '16px 20px',
                  overflowY: 'auto',
                  fontSize: '13.5px',
                  lineHeight: '1.6',
                  color: 'var(--text-primary)',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Live Preview
                </div>
                <div
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  dangerouslySetInnerHTML={{
                    __html: editContent
                      .replace(/# (.*)/g, '<h1 style="font-size: 20px; font-weight: 800; margin: 12px 0 6px 0;">$1</h1>')
                      .replace(/## (.*)/g, '<h2 style="font-size: 16px; font-weight: 700; margin: 10px 0 4px 0;">$1</h2>')
                      .replace(/### (.*)/g, '<h3 style="font-size: 14px; font-weight: 700; margin: 8px 0 2px 0;">$1</h3>')
                      .replace(/\[\[(.*?)\]\]/g, '<span style="color: var(--accent); background: var(--bg-hover); padding: 1px 6px; border-radius: var(--radius-xs); border: 1px solid var(--border); font-weight: 500;">[[$1]]</span>')
                      .replace(/`([^`]+)`/g, '<code style="background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>'),
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a note or create a new one to begin writing in Markdown.
          </div>
        )}
      </div>
    </div>
  );
}
