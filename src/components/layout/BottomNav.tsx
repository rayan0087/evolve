import React from 'react';
import {
  LayoutDashboard,
  BarChart2,
  Calendar,
  Gift,
  CheckSquare,
  Settings
} from 'lucide-react';
import clsx from 'clsx';
import { NavTab } from './Sidebar';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

const MOBILE_NAV_ITEMS: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Quest', icon: LayoutDashboard },
  { id: 'analytics', label: 'Stats', icon: BarChart2 },
  { id: 'history', label: 'Kalender', icon: Calendar },
  { id: 'rewards', label: 'Reward', icon: Gift },
  { id: 'quests', label: 'Kelola', icon: CheckSquare },
  { id: 'settings', label: 'Setting', icon: Settings },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121824]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800/80 px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around">
        {MOBILE_NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={clsx(
                'flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-[50px]',
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'
              )}
            >
              <Icon className={clsx('w-5 h-5 mb-0.5', isActive && 'stroke-[2.5]')} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
