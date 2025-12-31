export interface DailyHealthSummary {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  // Data inputs
  waterIntake: number;
  sleepHours?: number;
  sleepQuality?: string;
  moodScore?: string;
  totalActiveMinutes: number;
  totalCalories: number;
  exerciseTypes: string[];
  gutHealth?: string;
  mealLogs?: number; // count of meals logged
  totalNutritionCalories?: number;
  
  // Analysis
  healthScore: number; // 0-100
  status: 'poor' | 'fair' | 'good' | 'excellent';
  insights: string[];
  recommendations: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
