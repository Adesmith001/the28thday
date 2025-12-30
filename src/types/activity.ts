export interface WaterIntake {
  id: string;
  userId: string;
  amount: number; // in liters
  timestamp: Date;
  createdAt: Date;
}

export interface Exercise {
  id: string;
  userId: string;
  type: string; // e.g., "Yoga", "Cardio", "Strength", "Walking"
  duration: number; // in minutes
  intensity?: 'low' | 'medium' | 'high';
  caloriesBurned?: number;
  timestamp: Date;
  createdAt: Date;
}

export interface DailyActivity {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  waterIntake: number; // total liters
  exercises: string[]; // array of exercise IDs
  totalActiveMinutes: number;
  totalCalories: number;
  moodScore?: 'poor' | 'fair' | 'good' | 'great' | 'excellent';
  gutHealth?: 'low-bloating' | 'moderate-bloating' | 'high-bloating' | 'normal';
  gutHealthStatus?: 'stable' | 'improving' | 'worsening';
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsistencyStreak {
  id: string;
  userId: string;
  currentStreak: number; // days
  longestStreak: number; // days
  lastActivityDate: string; // YYYY-MM-DD format
  streakType: 'overall' | 'water' | 'exercise' | 'food-logging';
  updatedAt: Date;
}

export interface DailyTip {
  id: string;
  content: string;
  category: 'nutrition' | 'exercise' | 'wellness' | 'cycle';
  icon?: string;
  createdAt: Date;
}
