import * as chrono from 'chrono-node';
import { toLocalDateString } from './dates';
import type { Priority } from '../types';

export interface ParsedQuickTask {
  title: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  category: string;
}

export function parseQuickTaskInput(input: string): ParsedQuickTask {
  if (!input || !input.trim()) {
    return {
      title: '',
      priority: 'medium',
      category: 'General',
    };
  }

  let text = input.trim();

  // 1. Extract Priority Tag (!critical, !high, !medium, !low, !p1, !p2, !p3, !p4)
  let priority: Priority = 'medium';
  const priorityMatch = text.match(/(?:^|\s)!(critical|high|medium|low|p1|p2|p3|p4)(?:\s|$)/i);
  if (priorityMatch) {
    const rawTag = priorityMatch[1].toLowerCase();
    if (rawTag === 'critical' || rawTag === 'p1') priority = 'critical';
    else if (rawTag === 'high' || rawTag === 'p2') priority = 'high';
    else if (rawTag === 'medium' || rawTag === 'p3') priority = 'medium';
    else if (rawTag === 'low' || rawTag === 'p4') priority = 'low';

    text = text.replace(priorityMatch[0], ' ');
  }

  // 2. Extract Category Tag (#academics, #career, #finance, #fitness, #personal, etc.)
  let category = 'General';
  const categoryMatch = text.match(/(?:^|\s)#([a-zA-Z0-9_-]+)(?:\s|$)/);
  if (categoryMatch) {
    const rawCategory = categoryMatch[1].toLowerCase();
    const categoryMap: Record<string, string> = {
      academics: 'Academics',
      academic: 'Academics',
      study: 'Academics',
      career: 'Career & Work',
      work: 'Career & Work',
      job: 'Career & Work',
      finance: 'Finance & Money',
      money: 'Finance & Money',
      fitness: 'Health & Fitness',
      health: 'Health & Fitness',
      gym: 'Health & Fitness',
      personal: 'Personal Development',
      life: 'Personal Development',
    };

    category = categoryMap[rawCategory] || rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
    text = text.replace(categoryMatch[0], ' ');
  }

  // 3. Extract Natural Language Date/Time with chrono-node
  let dueDate: string | undefined;
  let dueTime: string | undefined;

  const parsedResults = chrono.parse(text);
  if (parsedResults.length > 0) {
    const firstResult = parsedResults[0];
    const parsedDate = firstResult.start.date();

    dueDate = toLocalDateString(parsedDate);

    // If time was explicitly specified in natural language (e.g. 5pm or 14:00)
    if (firstResult.start.isCertain('hour')) {
      const hours = String(parsedDate.getHours()).padStart(2, '0');
      const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
      dueTime = `${hours}:${minutes}`;
    }

    // Strip date string from title text
    text = text.replace(firstResult.text, ' ');
  }

  // 4. Clean up title whitespace
  const cleanTitle = text.replace(/\s+/g, ' ').trim();

  return {
    title: cleanTitle || input.trim(),
    dueDate,
    dueTime,
    priority,
    category,
  };
}
