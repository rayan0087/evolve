import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/index';
import { seedInitialQuestsIfEmpty } from './db/questRepo';
import { seedInitialRewardsIfEmpty } from './db/rewardRepo';
import { getUserProgression } from './db/statsRepo';
import { useTheme } from './hooks/useTheme';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { HistoryPage } from './pages/HistoryPage';
import { RewardsPage } from './pages/RewardsPage';
import { ManageQuestsPage } from './pages/ManageQuestsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const { toggleTheme, isDark } = useTheme();
  const isOnline = useOnlineStatus();
  const [progression, setProgression] = useState<Awaited<ReturnType<typeof getUserProgression>> | null>(null);

  // Initialize DB seeds on startup
  useEffect(() => {
    async function initDb() {
      await seedInitialQuestsIfEmpty();
      await seedInitialRewardsIfEmpty();
      const prog = await getUserProgression();
      setProgression(prog);
    }
    initDb();
  }, []);

  // Update progression when XP transactions or daily records change
  const liveXpTx = useLiveQuery(() => db.xp_transactions.toArray());
  const liveRecords = useLiveQuery(() => db.daily_records.toArray());

  useEffect(() => {
    getUserProgression().then(setProgression);
  }, [liveXpTx, liveRecords]);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Top Header */}
        <Header
          levelInfo={progression?.levelInfo}
          streakStats={progression?.streakStats}
          isOnline={isOnline}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {activeTab === 'dashboard' && <DashboardPage onNavigateTab={setActiveTab} />}
          {activeTab === 'analytics' && <AnalyticsPage isDark={isDark} />}
          {activeTab === 'history' && <HistoryPage />}
          {activeTab === 'rewards' && <RewardsPage />}
          {activeTab === 'quests' && <ManageQuestsPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
};

export default App;
