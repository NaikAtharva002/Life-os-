export interface AppRouteMeta {
  id: string;
  path: string;
  title: string;
  section: 'Daily Loop' | 'Student Hub' | 'Cadence' | 'System';
}

export const APP_ROUTES: AppRouteMeta[] = [
  { id: 'dashboard', path: '/', title: 'Today', section: 'Daily Loop' },
  { id: 'tasks', path: '/tasks', title: 'Tasks', section: 'Daily Loop' },
  { id: 'goals', path: '/goals', title: 'Goals', section: 'Daily Loop' },
  { id: 'habits', path: '/habits', title: 'Habits', section: 'Daily Loop' },
  { id: 'academics', path: '/academics', title: 'Academics', section: 'Student Hub' },
  { id: 'finance', path: '/finance', title: 'Finance', section: 'Student Hub' },
  { id: 'fitness', path: '/fitness', title: 'Fitness', section: 'Student Hub' },
  { id: 'career', path: '/career', title: 'Career', section: 'Student Hub' },
  { id: 'obsidian', path: '/notes', title: 'Notes', section: 'Student Hub' },
  { id: 'focus', path: '/focus', title: 'Deep Focus', section: 'Cadence' },
  { id: 'review', path: '/review', title: 'Evening Review', section: 'Cadence' },
  { id: 'history', path: '/history', title: 'Review Archive', section: 'Cadence' },
  { id: 'analytics', path: '/analytics', title: 'Analytics', section: 'Cadence' },
  { id: 'universe', path: '/universe', title: 'Knowledge Universe', section: 'Cadence' },
  { id: 'assistant', path: '/assistant', title: 'Planner Helper', section: 'Cadence' },
  { id: 'settings', path: '/settings', title: 'Settings', section: 'System' },
  { id: 'design-system', path: '/design-system', title: 'Design Tokens', section: 'System' },
];

export function viewIdToPath(viewId: string): string {
  const match = APP_ROUTES.find((r) => r.id === viewId);
  return match ? match.path : '/';
}

export function pathToViewMeta(pathname: string): AppRouteMeta {
  const normalized = pathname === '/today' ? '/' : pathname;
  return (
    APP_ROUTES.find((r) => r.path === normalized) || {
      id: 'dashboard',
      path: '/',
      title: 'Today',
      section: 'Daily Loop',
    }
  );
}
