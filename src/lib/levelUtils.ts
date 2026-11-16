export interface LevelTier {
  level: number;
  title: string;
  minXp: number;
}

export const LEVEL_TIERS: LevelTier[] = [
  { level: 1, title: 'Novice Adventurer', minXp: 0 },
  { level: 2, title: 'Beginner Tracker', minXp: 150 },
  { level: 3, title: 'Consistent Seeker', minXp: 400 },
  { level: 4, title: 'Disciplined Warrior', minXp: 800 },
  { level: 5, title: 'Dedicated Striker', minXp: 1400 },
  { level: 6, title: 'Strong Achiever', minXp: 2200 },
  { level: 7, title: 'Elite Champion', minXp: 3200 },
  { level: 8, title: 'Master of Habits', minXp: 4500 },
  { level: 9, title: 'Unstoppable Force', minXp: 6000 },
  { level: 10, title: 'Legendary Hero', minXp: 8000 },
];

export interface LevelInfo {
  level: number;
  title: string;
  totalXp: number;
  currentTierMinXp: number;
  nextTierMinXp: number | null;
  xpInCurrentTier: number;
  xpNeededForNextTier: number;
  progressPercent: number;
  isMaxLevel: boolean;
}

/**
 * Calculates user level and progression metrics from total all-time XP.
 */
export function calculateLevelInfo(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(totalXp || 0));

  let currentTierIndex = 0;
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (safeXp >= LEVEL_TIERS[i].minXp) {
      currentTierIndex = i;
      break;
    }
  }

  const currentTier = LEVEL_TIERS[currentTierIndex];
  const isMaxLevel = currentTierIndex === LEVEL_TIERS.length - 1;
  const nextTier = isMaxLevel ? null : LEVEL_TIERS[currentTierIndex + 1];

  const currentTierMinXp = currentTier.minXp;
  const nextTierMinXp = nextTier ? nextTier.minXp : null;

  if (isMaxLevel || nextTierMinXp === null) {
    return {
      level: currentTier.level,
      title: currentTier.title,
      totalXp: safeXp,
      currentTierMinXp,
      nextTierMinXp: null,
      xpInCurrentTier: safeXp - currentTierMinXp,
      xpNeededForNextTier: 0,
      progressPercent: 100,
      isMaxLevel: true
    };
  }

  const range = nextTierMinXp - currentTierMinXp;
  const xpInCurrentTier = safeXp - currentTierMinXp;
  const xpNeededForNextTier = nextTierMinXp - safeXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentTier / range) * 100)));

  return {
    level: currentTier.level,
    title: currentTier.title,
    totalXp: safeXp,
    currentTierMinXp,
    nextTierMinXp,
    xpInCurrentTier,
    xpNeededForNextTier,
    progressPercent,
    isMaxLevel: false
  };
}
