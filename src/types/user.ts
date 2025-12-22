export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  profile?: UserProfile;
  onboardingCompleted?: boolean;
}

export interface UserProfile {
  // Basic Info
  dateOfBirth?: Date;
  height?: number; // in cm
  weight?: number; // in kg
  
  // Medical Context
  hasPCOS?: boolean;
  hasUlcer?: boolean;
  spicyFoodSensitivity?: boolean;
  
  // Cycle History
  averageCycleLength?: number; // in days (default 28)
  lastPeriodStartDate?: Date;
  periodLength?: number; // average period length in days
  
  // Legacy/Additional fields
  diagnosedDate?: Date;
  medications?: string[];
  allergies?: string[];
  healthGoals?: string[];
}
