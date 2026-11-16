import React from 'react';
import {
  LayoutDashboard,
  BarChart2,
  Calendar,
  Gift,
  CheckSquare,
  Settings,
  ShieldAlert
} from 'lucide-react';
import clsx from 'clsx';

export type NavTab = 'dashboard' | 'analytics' | 'history' | 'rewards' | 'quests' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'history', label: 'History', icon: Calendar },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'quests', label: 'Manage Quests', icon: CheckSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-[#121824] border-r border-slate-200 dark:border-slate-800/80 p-4 min-h-screen">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-3 py-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl">
          DQ
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            Daily Quest
          </span>
          <span className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Habit Tracker PWA
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={clsx(
                'w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 text-left',
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm border border-emerald-200/60 dark:border-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              <Icon className={clsx('w-5 h-5', isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400')} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Offline-First Badge in Sidebar */}
      <div className="p-3 bg-slate-50 dark:bg-[#182030] rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>100% Offline & Local Data IndexedDB</span>
      </div>
    </aside>
  );
};
