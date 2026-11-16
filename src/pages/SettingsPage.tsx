import React, { useState, useEffect, useRef } from 'react';
import {
  Moon,
  Sun,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sliders
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { getStreakThreshold, setStreakThreshold } from '../db/statsRepo';
import { exportAllData, validateBackupJson, restoreFromBackup, factoryResetAllData, BackupValidationResult } from '../db/backupRepo';
import { Modal } from '../components/common/Modal';

export const SettingsPage: React.FC = () => {
  const { toggleTheme, isDark } = useTheme();
  const [streakThresholdPercent, setStreakThresholdPercent] = useState<number>(80);

  // Backup / Restore States
  const [exporting, setExporting] = useState(false);
  const [importSummary, setImportSummary] = useState<BackupValidationResult | null>(null);
  const [pendingBackupJson, setPendingBackupJson] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);

  // Reset Confirmation State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getStreakThreshold().then(val => {
      setStreakThresholdPercent(Math.round(val * 100));
    });
  }, []);

  const handleSaveThreshold = async (newVal: number) => {
    setStreakThresholdPercent(newVal);
    await setStreakThreshold(newVal);
  };

  // Export JSON file
  const handleExportBackup = async () => {
    setExporting(true);
    try {
      const jsonStr = await exportAllData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `daily-quest-backup-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  // Select File to Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const validation = validateBackupJson(content);
      if (validation.isValid) {
        setImportSummary(validation);
        setPendingBackupJson(content);
      } else {
        alert(validation.error || 'File backup tidak valid!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Execute Restore
  const handleConfirmRestore = async () => {
    if (!pendingBackupJson) return;
    setIsRestoring(true);
    try {
      const parsed = JSON.parse(pendingBackupJson);
      await restoreFromBackup(parsed, importMode);
      setImportSummary(null);
      setPendingBackupJson(null);
      setRestoreSuccessMsg('Data berhasil dipulihkan!');
      setTimeout(() => setRestoreSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Gagal memulihkan data: ${err.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  // Factory Reset
  const handleConfirmReset = async () => {
    if (resetConfirmText.toLowerCase() !== 'reset') return;
    setIsResetting(true);
    try {
      await factoryResetAllData();
      setShowResetModal(false);
      setResetConfirmText('');
      window.location.reload();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Pengaturan & Keamanan Data
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Konfigurasi tampilan, ambang streak konsistensi, backup data, dan manajemen database lokal
        </p>
      </div>

      {restoreSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>{restoreSuccessMsg}</span>
        </div>
      )}

      {/* 1. Appearance / Theme */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Tampilan Aplikasi
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
              Tema Antarmuka
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Pilih antara tema Dark Mode (Charcoal/Dark Navy) atau Light Mode
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-[#182030] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Consistency & Streak Threshold */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Ambang Sukses Streak Harian
            </h3>
          </div>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {streakThresholdPercent}%
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Hari dianggap sukses dan menambah streak jika kamu menyelesaikan minimal persentase quest aktif ini. Rekomendasi default: <b>80%</b>.
        </p>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={streakThresholdPercent}
            onChange={e => handleSaveThreshold(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
          <span>50% (Santai)</span>
          <span>80% (Standar Disiplin)</span>
          <span>100% (Sempurna)</span>
        </div>
      </div>

      {/* 3. Backup & Restore Data */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Backup & Restore (Offline-First)
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Seluruh data tersimpan aman secara lokal di browser perangkatmu. Lakukan export berkala untuk mengamankan data atau memindahkannya ke perangkat lain.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export Button */}
          <button
            onClick={handleExportBackup}
            disabled={exporting}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Mengexport...' : 'Export Backup JSON'}
          </button>

          {/* Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-[#182030] dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import Backup JSON
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* 4. Factory Reset / Danger Zone */}
      <div className="bg-rose-50/40 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Zona Berbahaya (Reset Database)
          </h3>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          Menghapus seluruh histori harian, catatan, transaksi XP, dan mereset quest ke konfigurasi awal bawaan. Tindakan ini tidak dapat dibatalkan jika kamu belum membuat backup.
        </p>

        <button
          onClick={() => {
            setResetConfirmText('');
            setShowResetModal(true);
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1.5 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Seluruh Data Aplikasi
        </button>
      </div>

      {/* 5. App Version Info */}
      <div className="text-center text-xs text-slate-400 pt-4">
        Daily Quest PWA v1.0.0 • Offline-First & Local-First (IndexedDB / Dexie.js)
      </div>

      {/* Import Preview Modal */}
      {importSummary && importSummary.summary && (
        <Modal
          isOpen={!!importSummary}
          onClose={() => setImportSummary(null)}
          title="Pratinjau File Backup"
          description="Periksa ringkasan isi file backup sebelum memulihkan database."
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-[#182030] rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Versi Backup:</span>
                <span className="font-bold text-slate-900 dark:text-white">v{importSummary.summary.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Export:</span>
                <span className="font-bold text-slate-900 dark:text-white">{importSummary.summary.exportedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah Quest:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{importSummary.summary.questCount} item</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Catatan Harian:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{importSummary.summary.recordCount} entri</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Reward:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{importSummary.summary.rewardCount} item</span>
              </div>
            </div>

            {/* Mode selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Metode Pemulihan:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition ${
                    importMode === 'replace'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  Gantikan Seluruh Data
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition ${
                    importMode === 'merge'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  Gabungkan (Merge)
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setImportSummary(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
              >
                {isRestoring ? 'Memulihkan...' : 'Pulihkan Sekarang'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <Modal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          title="Konfirmasi Reset Data"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Apakah kamu benar-benar yakin ingin menghapus seluruh data dan mereset ke konfigurasi pabrik?
            </p>
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Ketik kata <span className="font-bold underline">RESET</span> di bawah ini untuk mengonfirmasi:
            </p>

            <input
              type="text"
              value={resetConfirmText}
              onChange={e => setResetConfirmText(e.target.value)}
              placeholder="Ketik RESET"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182030] text-sm text-slate-900 dark:text-white uppercase font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={resetConfirmText.toLowerCase() !== 'reset' || isResetting}
                onClick={handleConfirmReset}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white transition shadow-sm"
              >
                {isResetting ? 'Mereset...' : 'Konfirmasi Reset'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
