export interface CycleEntry {
  id: string;
  userId: string;
  startDate: Date;
  endDate?: Date;
  cycleLength?: number;
  periodLength?: number;
  phase: CyclePhase;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum CyclePhase {
  MENSTRUAL = 'menstrual',
  FOLLICULAR = 'follicular',
  OVULATION = 'ovulation',
  LUTEAL = 'luteal',
}

export interface CyclePrediction {
  nextPeriodDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  ovulationDate: Date;
  confidence: number; // 0-1
}
