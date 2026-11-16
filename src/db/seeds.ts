import { Quest, Reward } from '../lib/types';

export const INITIAL_QUESTS: Omit<Quest, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'quest-steps',
    name: '10.000 Langkah',
    description: 'Jalan kaki atau jogging hingga mencapai target langkah harian',
    target: '10.000 langkah',
    targetNumber: 10000,
    unit: 'langkah',
    icon: 'Footprints',
    xpReward: 30,
    isActive: true,
    order: 1
  },
  {
    id: 'quest-workout',
    name: 'Workout Barbel',
    description: 'Latihan beban / barbel untuk melatih kekuatan otot',
    target: 'Menyelesaikan workout',
    targetNumber: 1,
    unit: 'sesi',
    icon: 'Dumbbell',
    xpReward: 30,
    isActive: true,
    order: 2
  },
  {
    id: 'quest-pushup',
    name: 'Push Up',
    description: 'Latihan push up untuk melatih otot dada dan trisep',
    target: '15 repetisi',
    targetNumber: 15,
    unit: 'repetisi',
    icon: 'Flame',
    xpReward: 15,
    isActive: true,
    order: 3
  },
  {
    id: 'quest-situp',
    name: 'Sit Up',
    description: 'Latihan sit up untuk melatih kekuatan otot perut',
    target: '15 repetisi',
    targetNumber: 15,
    unit: 'repetisi',
    icon: 'Activity',
    xpReward: 15,
    isActive: true,
    order: 4
  },
  {
    id: 'quest-plank',
    name: 'Plank',
    description: 'Tahan posisi plank untuk memperkuat core tubuh',
    target: '1 menit',
    targetNumber: 1,
    unit: 'menit',
    icon: 'Timer',
    xpReward: 15,
    isActive: true,
    order: 5
  },
  {
    id: 'quest-portion',
    name: 'Kurangi Porsi Makan',
    description: 'Menjaga porsi makan secukupnya dan kurangi kalori berlebih',
    target: 'Menjaga porsi makan',
    targetNumber: 1,
    unit: 'hari',
    icon: 'Utensils',
    xpReward: 20,
    isActive: true,
    order: 6
  }
];

export const INITIAL_REWARDS: Omit<Reward, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'reward-movie',
    name: 'Movie Night & Popcorn',
    description: 'Nonton film favorit di akhir pekan tanpa rasa bersalah',
    imageOrEmoji: '🎬',
    periodType: 'weekly',
    targetXp: 500,
    isActive: true
  },
  {
    id: 'reward-coffee',
    name: 'Kopi Favorit di Cafe',
    description: 'Nikmati segelas artisan coffee pilihanmu',
    imageOrEmoji: '☕',
    periodType: 'monthly',
    targetXp: 1000,
    isActive: true
  },
  {
    id: 'reward-mukbang',
    name: 'Mukbang Nasi Goreng Spesial',
    description: 'Hadiah makan malam lezat nasi goreng favorit',
    imageOrEmoji: '🍛',
    periodType: 'monthly',
    targetXp: 2000,
    isActive: true
  },
  {
    id: 'reward-burger',
    name: 'Burger Treat Supreme',
    description: 'Nikmati burger premium setelah konsisten 3 bulan',
    imageOrEmoji: '🍔',
    periodType: 'quarterly',
    targetXp: 5000,
    isActive: true
  },
  {
    id: 'reward-wishlist',
    name: 'Membeli Barang Impian',
    description: 'Reward puncak tahunan untuk barang di wishlist pribadimu',
    imageOrEmoji: '🎁',
    periodType: 'yearly',
    targetXp: 25000,
    isActive: true
  }
];
