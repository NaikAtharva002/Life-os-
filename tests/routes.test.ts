import { describe, it, expect } from 'vitest';
import { APP_ROUTES, viewIdToPath, pathToViewMeta } from '../src/lib/routes';

describe('Router & Navigation Metadata', () => {
  it('maps every route id cleanly to its path and back', () => {
    for (const route of APP_ROUTES) {
      expect(viewIdToPath(route.id)).toBe(route.path);
      expect(pathToViewMeta(route.path).id).toBe(route.id);
    }
  });

  it('normalizes /today to dashboard and unknown routes to Today fallback', () => {
    expect(pathToViewMeta('/today').id).toBe('dashboard');
    expect(pathToViewMeta('/universe').id).toBe('universe');
    expect(pathToViewMeta('/nonexistent-route').id).toBe('dashboard');
    expect(viewIdToPath('unknown-view')).toBe('/');
  });
});
