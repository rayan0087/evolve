import React from 'react';
import {
  Footprints,
  Dumbbell,
  Flame,
  Activity,
  Timer,
  Utensils,
  Heart,
  Zap,
  Trophy,
  Target,
  BookOpen,
  Code,
  Droplets,
  Smile,
  Moon,
  Sun,
  Sparkles,
  Award,
  HelpCircle,
  type LucideIcon
} from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number | string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Footprints,
  Dumbbell,
  Flame,
  Activity,
  Timer,
  Utensils,
  Heart,
  Zap,
  Trophy,
  Target,
  BookOpen,
  Code,
  Droplets,
  Smile,
  Moon,
  Sun,
  Sparkles,
  Award,
  HelpCircle
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP).filter(k => k !== 'HelpCircle');

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = 'w-5 h-5', size = 20 }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent className={className} size={size} />;
};
