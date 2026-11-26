import { describe, it, expect, vi, beforeEach } from 'vitest';
import useStore from '../src/store/useStore';
import { LifeOSRepository } from '../src/db/repository';

describe('Store Resilience & Rollback', () => {
  beforeEach(() => {
    useStore.setState({
      tasks: [],
      goals: [],
      toasts: [],
      initError: null,
    });
    vi.restoreAllMocks();
  });

  it('rolls back task state if repository fails during addTask', async () => {
    vi.spyOn(LifeOSRepository, 'saveTask').mockRejectedValueOnce(new Error('Disk I/O failure'));

    await expect(
      useStore.getState().addTask({
        title: 'Failing Task',
        priority: 'high',
        category: 'General',
      })
    ).rejects.toThrow('Disk I/O failure');

    // Tasks state must be rolled back to empty
    expect(useStore.getState().tasks.length).toBe(0);

    // Toast error must be emitted
    const toasts = useStore.getState().toasts;
    expect(toasts.some((t) => t.type === 'error' && t.title.includes('Task Save Failed'))).toBe(true);
  });

  it('rolls back goal state if repository fails during addGoal', async () => {
    vi.spyOn(LifeOSRepository, 'saveGoal').mockRejectedValueOnce(new Error('IndexedDB Quota Exceeded'));

    await expect(
      useStore.getState().addGoal({
        title: 'Failing Goal',
        category: 'Personal',
        priority: 'high',
        type: 'short-term',
      })
    ).rejects.toThrow('IndexedDB Quota Exceeded');

    expect(useStore.getState().goals.length).toBe(0);
    const toasts = useStore.getState().toasts;
    expect(toasts.some((t) => t.type === 'error' && t.title.includes('Goal Save Failed'))).toBe(true);
  });

  it('records initError if initializeFromDB fails', async () => {
    vi.spyOn(LifeOSRepository, 'initialize').mockRejectedValueOnce(new Error('Corrupted Schema'));

    await useStore.getState().initializeFromDB();

    expect(useStore.getState().initError).toBe('Corrupted Schema');
    expect(useStore.getState().isLoaded).toBe(true);
  });

  it('deduplicates concurrent StrictMode initializeFromDB calls into a single repository init', async () => {
    const spy = vi.spyOn(LifeOSRepository, 'initialize');

    await Promise.all([
      useStore.getState().initializeFromDB(),
      useStore.getState().initializeFromDB(),
    ]);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(useStore.getState().isLoaded).toBe(true);
    expect(useStore.getState().initError).toBeNull();
  });
});
