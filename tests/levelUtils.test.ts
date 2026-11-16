import { describe, it, expect } from 'vitest';
import { calculateLevelInfo, LEVEL_TIERS } from '../src/lib/levelUtils';

describe('levelUtils', () => {
  it('starts at Level 1 for 0 XP', () => {
    const info = calculateLevelInfo(0);
    expect(info.level).toBe(1);
    expect(info.title).toBe('Novice Adventurer');
    expect(info.progressPercent).toBe(0);
    expect(info.xpNeededForNextTier).toBe(150);
  });

  it('calculates mid-level progression correctly', () => {
    // Level 1 tier range is 0 to 150. At 75 XP, progress should be 50%
    const info = calculateLevelInfo(75);
    expect(info.level).toBe(1);
    expect(info.progressPercent).toBe(50);
    expect(info.xpInCurrentTier).toBe(75);
    expect(info.xpNeededForNextTier).toBe(75);
  });

  it('advances to Level 2 at 150 XP', () => {
    const info = calculateLevelInfo(150);
    expect(info.level).toBe(2);
    expect(info.title).toBe('Beginner Tracker');
    expect(info.progressPercent).toBe(0);
    expect(info.currentTierMinXp).toBe(150);
    expect(info.nextTierMinXp).toBe(400);
  });

  it('handles maximum level correctly without overflow', () => {
    const maxTier = LEVEL_TIERS[LEVEL_TIERS.length - 1];
    const info = calculateLevelInfo(maxTier.minXp + 5000);
    expect(info.level).toBe(maxTier.level);
    expect(info.isMaxLevel).toBe(true);
    expect(info.progressPercent).toBe(100);
    expect(info.nextTierMinXp).toBeNull();
  });
});
