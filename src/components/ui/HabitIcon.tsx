import React from 'react';
import {
  Zap,
  Dumbbell,
  BookOpen,
  DollarSign,
  Moon,
  Flame,
  Heart,
  Brain,
  Code,
  Coffee,
  Sun,
  Target,
  Check,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';

const HABIT_ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  dumbbell: Dumbbell,
  bookopen: BookOpen,
  book: BookOpen,
  dollarsign: DollarSign,
  dollar: DollarSign,
  moon: Moon,
  flame: Flame,
  heart: Heart,
  brain: Brain,
  code: Code,
  coffee: Coffee,
  sun: Sun,
  target: Target,
  check: Check,
  checkcircle2: CheckCircle2,
};

interface HabitIconProps {
  icon?: string;
  size?: number;
  color?: string;
}

/**
 * Renders stored habit icon keys ('Zap', 'Dumbbell', 'BookOpen', etc.) as Lucide icons
 * while preserving user-entered emoji glyphs unchanged.
 */
export const HabitIcon: React.FC<HabitIconProps> = ({
  icon,
  size = 16,
  color = 'currentColor',
}) => {
  const raw = icon?.trim();
  if (!raw) {
    return <Zap size={size} color={color} aria-hidden="true" />;
  }
  const IconComp = HABIT_ICON_MAP[raw.toLowerCase()];
  if (IconComp) {
    return <IconComp size={size} color={color} aria-hidden="true" />;
  }
  return <span style={{ fontSize: `${size + 1}px`, lineHeight: 1 }}>{raw}</span>;
};
