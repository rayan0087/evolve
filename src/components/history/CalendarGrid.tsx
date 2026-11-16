import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth
} from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getLocalDateKey } from '../../lib/dateUtils';
import { DayDetailModal } from './DayDetailModal';

interface CalendarGridProps {
  dayMap: Map<string, { completedCount: number; totalActiveCount: number; xpSum: number }>;
  threshold?: number;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  dayMap,
  threshold = 0.8
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  // Indonesian / standard week starts on Monday (weekStartsOn: 1)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const todayKey = getLocalDateKey();

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const getDayStatus = (date: Date) => {
    const key = getLocalDateKey(date);
    const data = dayMap.get(key);

    if (!data || data.totalActiveCount === 0) {
      return { type: 'empty', rate: 0, completed: 0, total: 0 };
    }

    const rate = data.completedCount / data.totalActiveCount;
    if (rate >= 1) {
      return { type: 'full', rate, completed: data.completedCount, total: data.totalActiveCount }; // Green
    }
    if (rate >= (threshold - 0.0001)) {
      return { type: 'success', rate, completed: data.completedCount, total: data.totalActiveCount }; // Yellow/Amber
    }
    return { type: 'fail', rate, completed: data.completedCount, total: data.totalActiveCount }; // Red
  };

  const dayHeaders = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: id })}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Klik pada tanggal untuk melihat detail aktivitas dan catatan
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
          >
            Bulan Ini
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        {dayHeaders.map(h => (
          <div key={h} className="py-1">
            {h}
          </div>
        ))}
      </div>

      {/* Calendar Matrix */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map(day => {
          const key = getLocalDateKey(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = key === todayKey;
          const status = getDayStatus(day);

          let badgeColor = 'bg-slate-50 dark:bg-[#182030]/50 border-slate-100 dark:border-slate-800/60 text-slate-400';
          if (status.type === 'full') {
            badgeColor = 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/20';
          } else if (status.type === 'success') {
            badgeColor = 'bg-amber-400 text-amber-950 border-amber-500 font-bold';
          } else if (status.type === 'fail') {
            badgeColor = 'bg-rose-500 text-white border-rose-600';
          }

          return (
            <button
              key={key}
              onClick={() => setSelectedDateKey(key)}
              className={`min-h-[58px] sm:min-h-[68px] p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 ${
                isCurrentMonth ? 'opacity-100' : 'opacity-30'
              } ${isToday ? 'ring-2 ring-emerald-500 dark:ring-emerald-400' : ''} ${badgeColor}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  {format(day, 'd')}
                </span>
                {isToday && (
                  <span className="text-[9px] font-extrabold uppercase px-1 rounded bg-black/20">
                    Hari ini
                  </span>
                )}
              </div>

              {status.type !== 'empty' && (
                <div className="text-[10px] truncate leading-tight font-medium">
                  {status.completed}/{status.total}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Color Indicator Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-bold text-slate-700 dark:text-slate-300">Indikator:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block" />
          <span>100% Selesai</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-400 inline-block" />
          <span>Memenuhi Sukses ({Math.round(threshold * 100)}% - 99%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-rose-500 inline-block" />
          <span>Di Bawah Target (&lt; {Math.round(threshold * 100)}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-800 inline-block" />
          <span>Belum Ada Data</span>
        </div>
      </div>

      {/* Selected Day Detail Modal */}
      {selectedDateKey && (
        <DayDetailModal
          isOpen={!!selectedDateKey}
          onClose={() => setSelectedDateKey(null)}
          dateKey={selectedDateKey}
        />
      )}
    </div>
  );
};
