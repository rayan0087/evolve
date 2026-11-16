import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { PeriodSummary } from '../../db/statsRepo';

interface AnalyticsChartsProps {
  summary: PeriodSummary;
  isDark?: boolean;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ summary, isDark = true }) => {
  const chartData = summary.chartData;

  const strokeColor = '#10B981';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* XP Trends Chart */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tren Perolehan XP</h3>
            <p className="text-xs text-slate-400">Total akumulasi XP pada setiap tanggal</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
            +{summary.totalXp} XP Total
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="dateLabel" stroke={textColor} fontSize={11} tickLine={false} />
              <YAxis stroke={textColor} fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#182030' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  borderRadius: '12px',
                  color: isDark ? '#ffffff' : '#000000',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value} XP`, 'Perolehan']}
              />
              <Area
                type="monotone"
                dataKey="xp"
                stroke={strokeColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#xpGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Completion Rate Chart */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tingkat Penyelesaian (%)</h3>
            <p className="text-xs text-slate-400">Persentase quest selesai terhadap quest aktif</p>
          </div>
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg">
            {summary.completionRate}% Rata-rata
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="dateLabel" stroke={textColor} fontSize={11} tickLine={false} />
              <YAxis stroke={textColor} fontSize={11} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#182030' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  borderRadius: '12px',
                  color: isDark ? '#ffffff' : '#000000',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value}%`, 'Completion Rate']}
              />
              <Bar dataKey="completionRate" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
