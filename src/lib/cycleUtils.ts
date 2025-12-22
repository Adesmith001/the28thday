import { CycleEntry, CyclePrediction } from '@/types';

/**
 * Calculate the next period date based on previous cycles
 */
export function predictNextPeriod(cycles: CycleEntry[]): CyclePrediction | null {
  if (cycles.length === 0) return null;

  // Calculate average cycle length from past cycles
  const cycleLengths = cycles
    .filter(c => c.cycleLength)
    .map(c => c.cycleLength as number);

  if (cycleLengths.length === 0) return null;

  const avgCycleLength = Math.round(
    cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length
  );

  // Get the most recent cycle
  const lastCycle = cycles[0];
  const lastPeriodDate = new Date(lastCycle.startDate);

  // Calculate next period date
  const nextPeriodDate = new Date(lastPeriodDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycleLength);

  // Calculate ovulation date (typically 14 days before next period)
  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(ovulationDate.getDate() - 14);

  // Calculate fertile window (5 days before ovulation to 1 day after)
  const fertileWindowStart = new Date(ovulationDate);
  fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);

  const fertileWindowEnd = new Date(ovulationDate);
  fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 1);

  // Calculate confidence based on cycle regularity
  const stdDev = calculateStandardDeviation(cycleLengths);
  const confidence = Math.max(0, Math.min(1, 1 - stdDev / avgCycleLength));

  return {
    nextPeriodDate,
    fertileWindowStart,
    fertileWindowEnd,
    ovulationDate,
    confidence,
  };
}

/**
 * Calculate standard deviation of an array of numbers
 */
function calculateStandardDeviation(values: number[]): number {
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(val => Math.pow(val - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(avgSquareDiff);
}

/**
 * Determine current cycle phase based on day of cycle
 */
export function getCurrentPhase(dayOfCycle: number): string {
  if (dayOfCycle <= 5) return 'menstrual';
  if (dayOfCycle <= 13) return 'follicular';
  if (dayOfCycle <= 16) return 'ovulation';
  return 'luteal';
}
