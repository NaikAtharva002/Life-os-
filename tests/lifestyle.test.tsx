import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LifestylePage from '../src/pages/LifestylePage';
import AssistantPage from '../src/pages/AssistantPage';
import useStore from '../src/store/useStore';
import { LifeOSRepository } from '../src/db/repository';

describe('Lifestyle & RIT Workspace UI', () => {
  const initialState = useStore.getState();

  beforeEach(async () => {
    await LifeOSRepository.clearAllData();
    useStore.setState(initialState, true);
    useStore.setState({
      settings: { ...initialState.settings, isDemoMode: false, userName: 'Atharva' },
      lifestyleItems: [],
      ritMemories: [],
      tasks: [],
      goals: [],
      habits: [],
    });
  });

  it('creates, filters, and toggles lifestyle items cleanly', async () => {
    render(<LifestylePage />);

    expect(screen.getByText(/Capture what makes life worth living/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Add First Experience/i }));

    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'Leh Ladakh Road Trip' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'travel' } });
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Ladakh' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));

    await waitFor(() => {
      expect(screen.getByText('Leh Ladakh Road Trip')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Hobbies' }));
    expect(screen.queryByText('Leh Ladakh Road Trip')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Travel' }));
    expect(screen.getByText('Leh Ladakh Road Trip')).toBeInTheDocument();
  });

  it('saves RIT personal memory and executes a proposed create_task action', async () => {
    render(<AssistantPage />);

    // Open memory drawer and save one memory
    fireEvent.click(screen.getByRole('button', { name: /Memory \(0\)/i }));
    const memInput = screen.getByPlaceholderText(/deep coding best/i);
    fireEvent.change(memInput, { target: { value: 'Prefers 50m study blocks' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Memory/i }));

    await waitFor(() => {
      expect(screen.getByText('Prefers 50m study blocks')).toBeInTheDocument();
    });

    // Issue task creation command to RIT and click Run Action
    const chatInput = screen.getByLabelText('Message RIT');
    fireEvent.change(chatInput, { target: { value: 'Add task finish OS project' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send to RIT' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Run Action/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Run Action/i }));

    await waitFor(() => {
      expect(screen.getByText('Executed')).toBeInTheDocument();
    });
    expect(useStore.getState().tasks.some((t) => t.title.toLowerCase().includes('finish os project'))).toBe(true);
  });
});
