export interface SymptomLog {
  id: string;
  userId: string;
  date: Date;
  symptoms: Symptom[];
  mood: MoodLevel;
  energyLevel: EnergyLevel;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Symptom {
  type: SymptomType;
  severity: SeverityLevel;
  notes?: string;
}

export enum SymptomType {
  CRAMPS = 'cramps',
  BLOATING = 'bloating',
  ACNE = 'acne',
  HEADACHE = 'headache',
  MOOD_SWINGS = 'mood_swings',
  FATIGUE = 'fatigue',
  BACK_PAIN = 'back_pain',
  BREAST_TENDERNESS = 'breast_tenderness',
  FOOD_CRAVINGS = 'food_cravings',
  INSOMNIA = 'insomnia',
  ANXIETY = 'anxiety',
  DEPRESSION = 'depression',
  HAIR_LOSS = 'hair_loss',
  WEIGHT_GAIN = 'weight_gain',
  IRREGULAR_PERIODS = 'irregular_periods',
  OTHER = 'other',
}

export enum SeverityLevel {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
}

export enum MoodLevel {
  VERY_HAPPY = 'very_happy',
  HAPPY = 'happy',
  NEUTRAL = 'neutral',
  SAD = 'sad',
  VERY_SAD = 'very_sad',
}

export enum EnergyLevel {
  VERY_HIGH = 'very_high',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
  VERY_LOW = 'very_low',
}
