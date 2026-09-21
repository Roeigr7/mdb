import { describe, expect, it } from 'vitest';
import { monthOverMonthPercent } from './dashboardMetrics';

describe('monthOverMonthPercent', () => {
  it('returns null without enough points', () => {
    expect(monthOverMonthPercent([])).toBeNull();
    expect(monthOverMonthPercent([10])).toBeNull();
  });

  it('computes real percentage change', () => {
    expect(monthOverMonthPercent([100, 112])).toBeCloseTo(12);
    expect(monthOverMonthPercent([200, 100])).toBeCloseTo(-50);
  });

  it('returns null when previous month is zero and current is not', () => {
    expect(monthOverMonthPercent([0, 50])).toBeNull();
  });
});
