import React from 'react';

function renderInlineSegments(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let segIndex = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    const key = `${keyPrefix}-${segIndex++}`;
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={key}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            padding: '1px 5px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11.5px',
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={key} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length ? parts : [text];
}

interface MarkdownMessageProps {
  content: string;
}

/**
 * Lightweight, XSS-safe Markdown renderer (pure React elements, zero HTML injection)
 * tailored for Astra Copilot plans, warnings, checklists, and code snippets.
 */
export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Fenced code blocks
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre
          key={`code-${i}`}
          style={{
            background: 'var(--bg-main)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11.5px',
            overflowX: 'auto',
            margin: '6px 0',
          }}
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Headings (h1-h4)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const fontSize = level === 1 ? '16px' : level === 2 ? '14.5px' : level === 3 ? '13.5px' : '12.5px';
      blocks.push(
        <div
          key={`h-${i}`}
          style={{
            fontSize,
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: blocks.length ? '8px 0 3px' : '0 0 4px',
            letterSpacing: '-0.01em',
          }}
        >
          {renderInlineSegments(headingMatch[2], `hi-${i}`)}
        </div>
      );
      i++;
      continue;
    }

    // Alert / Blockquote group
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        const cleaned = lines[i]
          .trim()
          .replace(/^>\s*/, '')
          .replace(/^\[!(WARNING|NOTE|TIP|IMPORTANT|CAUTION)\]\s*/i, '');
        if (cleaned) quoteLines.push(cleaned);
        i++;
      }
      const isWarning = /warning|overdue|critical|risk/i.test(raw + quoteLines.join(' '));
      blocks.push(
        <div
          key={`q-${i}`}
          style={{
            borderLeft: `3px solid ${isWarning ? 'var(--status-warning)' : 'var(--accent-primary)'}`,
            background: isWarning ? 'var(--status-warning-bg)' : 'var(--accent-subtle)',
            borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
            padding: '7px 10px',
            margin: '5px 0',
            fontSize: '12.5px',
          }}
        >
          {quoteLines.map((ql, qIdx) => (
            <div key={qIdx}>{renderInlineSegments(ql, `ql-${i}-${qIdx}`)}</div>
          ))}
        </div>
      );
      continue;
    }

    // Bullet / checklist / ordered list group
    if (/^(-|\*|\d+\.)\s+/.test(trimmed)) {
      const listItems: Array<{ text: string; checked?: boolean }> = [];
      const startIndex = i;
      while (i < lines.length && /^(-|\*|\d+\.)\s+/.test(lines[i].trim())) {
        const lineBody = lines[i].trim().replace(/^(-|\*|\d+\.)\s+/, '');
        const checkMatch = lineBody.match(/^\[( |x|X)\]\s+(.*)$/);
        if (checkMatch) {
          listItems.push({
            checked: checkMatch[1].toLowerCase() === 'x',
            text: checkMatch[2],
          });
        } else {
          listItems.push({ text: lineBody });
        }
        i++;
      }
      blocks.push(
        <ul
          key={`list-${startIndex}`}
          style={{
            margin: '4px 0',
            paddingLeft: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            listStyle: listItems.some((item) => item.checked !== undefined) ? 'none' : 'disc',
          }}
        >
          {listItems.map((item, idx) => (
            <li key={idx} style={{ fontSize: '12.8px', lineHeight: 1.5 }}>
              {item.checked !== undefined && (
                <span style={{ marginRight: '6px', color: item.checked ? 'var(--status-success)' : 'var(--text-muted)' }}>
                  {item.checked ? '☑' : '☐'}
                </span>
              )}
              {renderInlineSegments(item.text, `li-${startIndex}-${idx}`)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Standard paragraph
    blocks.push(
      <p key={`p-${i}`} style={{ margin: blocks.length ? '4px 0 0' : 0, fontSize: '13px', lineHeight: 1.55 }}>
        {renderInlineSegments(trimmed, `p-${i}`)}
      </p>
    );
    i++;
  }

  return <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>{blocks}</div>;
};
