# Daily Quest — Personal Habit Tracker PWA

Aplikasi **Personal Habit Tracker** berbasis web offline-first dengan gamification ala RPG quest tracker. Dibangun menggunakan React, TypeScript, Tailwind CSS, Lucide React, Recharts, Dexie.js (IndexedDB), dan Vite PWA.

---

## Fitur Utama

- **Offline-First & Local-First**: Seluruh data tersimpan di IndexedDB browser menggunakan Dexie.js. Tidak memerlukan server, cloud, atau login.
- **Daily Quests & Checklists**: Pantau aktivitas harian dengan checklist interaktif, animasi, dan confetti visual feedback.
- **Sistem XP Ledger**: Mencegah double XP dan menjaga konsistensi transaksi saat centang dibatalkan.
- **Level RPG Hero**: Level 1 (Novice) hingga Level 10 (Legendary Hero) berdasarkan akumulasi XP sepanjang masa.
- **Reward Berbasis Periode**: XP dihitung spesifik per periode (Weekly, Monthly, Quarterly, Semiannual, Yearly) untuk membuka reward nyata tanpa memotong saldo XP.
- **Streak & Konsistensi**: Ambang batas keberhasilan harian default 80% (dapat diatur di Pengaturan).
- **Analytics & Statistik Aktual**: Grafik tren XP dan bar chart tingkat penyelesaian dengan Recharts langsung dari data IndexedDB nyata.
- **Kalender Histori**: Kalender bulanan dengan indikator warna (Hijau 100%, Kuning ≥80%, Merah <80%, Abu-abu belum ada data) dan detail catatan harian.
- **Backup & Restore**: Export dan Import seluruh data ke file JSON dengan validasi skema dan keamanan transaksi.
- **PWA (Progressive Web App)**: Service Worker, Web App Manifest, dan kemampuan instalasi di perangkat mobile atau desktop.

---

## Panduan Menjalankan

### 1. Menjalankan Server Pengembangan
```bash
npm run dev
```
Akses di browser pada `http://localhost:5173`.

### 2. Menjalankan Unit Test (Vitest)
```bash
npm run test
```

### 3. Build Produksi
```bash
npm run build
npm run preview
```
