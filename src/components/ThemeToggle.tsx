import { Sun, Moon } from 'lucide-react';
import useStore from '../store/useStore';

export default function ThemeToggle() {
  const theme = useStore((s) => s.settings.theme);
  const setTheme = useStore((s) => s.setTheme);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <button className="btn btn-ghost btn-icon" onClick={toggle} aria-label="Toggle theme">
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
