import React, { useMemo } from 'react';
import { Sun, Moon, Wifi, WifiOff, Flame, Shield } from 'lucide-react';
import { formatDisplayDate, getTimeGreeting } from '../../lib/dateUtils';
import { LevelInfo } from '../../lib/levelUtils';
import { StreakResult } from '../../lib/streakUtils';

interface HeaderProps {
  levelInfo?: LevelInfo;
  streakStats?: StreakResult;
  isOnline: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
}

const QUOTES = [
  'Disiplin adalah jembatan antara cita-cita dan pencapaian.',
  'Konsistensi kecil hari ini menghasilkan lompatan besar esok hari.',
  'Satu quest diselesaikan, satu langkah lebih dekat ke versi terbaikmu.',
  'Fokus pada progres, bukan kesempurnaan.',
  'Jadikan setiap hari sebagai kemenangan pribadi.'
];

export const Header: React.FC<HeaderProps> = ({
  levelInfo,
  streakStats,
  isOnline,
  isDark,
  onToggleTheme
}) => {
  const greeting = getTimeGreeting();
  const todayStr = formatDisplayDate(new Date());

  // Select quote based on day of month so it rotates daily
  const dailyQuote = useMemo(() => {
    const day = new Date().getDate();
    return QUOTES[day % QUOTES.length];
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Greeting & Quote */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {todayStr}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            {isOnline ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Wifi className="w-3 h-3" /> Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <WifiOff className="w-3 h-3" /> Offline (Tersimpan Lokal)
              </span>
            )}
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {greeting}, Hero! ⚡
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1 mt-0.5">
            "{dailyQuote}"
          </p>
        </div>

        {/* Right: Gamification Badges & Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Level Pill */}
          {levelInfo && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#182030] border border-slate-200 dark:border-slate-700/60 px-3 py-1.5 rounded-xl shadow-sm">
              <Shield className="w-4 h-4 text-emerald-500" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Lv. {levelInfo.level}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                    ({levelInfo.title})
                  </span>
                </div>
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  {levelInfo.totalXp} XP
                </span>
              </div>
            </div>
          )}

          {/* Streak Pill */}
          {streakStats && (
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1.5 rounded-xl shadow-sm">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  {streakStats.currentStreak} Hari
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400">
                  Best: {streakStats.bestStreak}
                </span>
              </div>
            </div>
          )}

          {/* Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#182030] dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 transition shadow-sm"
            title={isDark ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
