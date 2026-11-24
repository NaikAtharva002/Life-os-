import { describe, it, expect } from 'vitest';
import { parseQuickTaskInput } from '../src/lib/quickAddParser';
import { todayLocal, toLocalDateString } from '../src/lib/dates';

describe('Quick Add Natural Language Parser', () => {
  it('parses plain text task with default medium priority and general category', () => {
    const res = parseQuickTaskInput('Read chapter 4 of operating systems');
    expect(res.title).toBe('Read chapter 4 of operating systems');
    expect(res.priority).toBe('medium');
    expect(res.category).toBe('General');
    expect(res.dueDate).toBeUndefined();
  });

  it('extracts priority flags (!critical, !high, !p1)', () => {
    const res1 = parseQuickTaskInput('Urgent server maintenance !critical');
    expect(res1.title).toBe('Urgent server maintenance');
    expect(res1.priority).toBe('critical');

    const res2 = parseQuickTaskInput('!p2 Review pull request');
    expect(res2.title).toBe('Review pull request');
    expect(res2.priority).toBe('high');
  });

  it('extracts category hashtags (#academics, #finance, #fitness)', () => {
    const res = parseQuickTaskInput('Submit assignment #academics');
    expect(res.title).toBe('Submit assignment');
    expect(res.category).toBe('Academics');

    const res2 = parseQuickTaskInput('Pay electricity bill #finance');
    expect(res2.title).toBe('Pay electricity bill');
    expect(res2.category).toBe('Finance & Money');
  });

  it('extracts natural language dates using chrono-node', () => {
    const res = parseQuickTaskInput('Submit database lab tomorrow');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(res.dueDate).toBe(toLocalDateString(tomorrow));
    expect(res.title).toBe('Submit database lab');
  });

  it('extracts date, explicit hour/time, priority and category together', () => {
    const res = parseQuickTaskInput('Algorithm midterm exam tomorrow at 3pm !critical #academics');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(res.dueDate).toBe(toLocalDateString(tomorrow));
    expect(res.dueTime).toBe('15:00');
    expect(res.priority).toBe('critical');
    expect(res.category).toBe('Academics');
    expect(res.title).toBe('Algorithm midterm exam');
  });

  it('handles empty input gracefully', () => {
    const res = parseQuickTaskInput('   ');
    expect(res.title).toBe('');
    expect(res.priority).toBe('medium');
    expect(res.category).toBe('General');
  });
});
