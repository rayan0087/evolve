import React from 'react';
import { QuestBreakdownItem } from '../../db/statsRepo';
import { IconRenderer } from '../common/IconRenderer';
import { ProgressBar } from '../common/ProgressBar';

interface ActivityBreakdownTableProps {
  items: QuestBreakdownItem[];
}

export const ActivityBreakdownTable: React.FC<ActivityBreakdownTableProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-sm text-slate-400">
        Belum ada data aktivitas quest.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm overflow-hidden">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rincian Performa Quest</h3>
        <p className="text-xs text-slate-400">Statistik konsistensi untuk setiap aktivitas</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <th className="pb-3 pl-1">Aktivitas Quest</th>
              <th className="pb-3 text-center">Penyelesaian</th>
              <th className="pb-3">Konsistensi</th>
              <th className="pb-3 text-right pr-1">Total XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {items.map(item => (
              <tr key={item.questId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td className="py-3.5 pl-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <IconRenderer name={item.icon} className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.questName}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 text-center font-bold text-slate-700 dark:text-slate-200">
                  {item.completedTimes} <span className="text-[10px] text-slate-400 font-normal">/ {item.totalTrackedTimes} hari</span>
                </td>
                <td className="py-3.5 w-44">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={item.completionRate} color="emerald" height="sm" />
                    <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0 w-8 text-right">
                      {item.completionRate}%
                    </span>
                  </div>
                </td>
                <td className="py-3.5 text-right pr-1 font-bold text-emerald-600 dark:text-emerald-400">
                  +{item.totalXpGenerated} XP
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
