import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { CycleEntry, SymptomLog, MealLog } from '@/types';
import { WaterIntake, Exercise, DailyActivity } from '@/types/activity';

// Helper to remove undefined fields from objects before Firestore writes
const removeUndefined = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof T] = value as T[keyof T];
    }
    return acc;
  }, {} as Partial<T>);
};

// Collections
const USERS_COLLECTION = 'users';
const CYCLES_COLLECTION = 'cycles';
const SYMPTOMS_COLLECTION = 'symptoms';
const MEALS_COLLECTION = 'meals';
const WATER_COLLECTION = 'waterIntake';
const EXERCISE_COLLECTION = 'exercises';
const DAILY_ACTIVITY_COLLECTION = 'dailyActivities';
const STREAKS_COLLECTION = 'streaks';

// User operations
export const saveUserProfile = async (userId: string, data: Record<string, unknown>) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await setDoc(userRef, { ...data, updatedAt: Timestamp.now() }, { merge: true });
};

export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

// Cycle operations
export const saveCycleEntry = async (userId: string, cycleData: Partial<CycleEntry>) => {
  const cycleRef = doc(collection(db, CYCLES_COLLECTION));
  await setDoc(cycleRef, {
    ...cycleData,
    userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return cycleRef.id;
};

export const getCycleEntries = async (userId: string, limitCount = 10) => {
  const q = query(
    collection(db, CYCLES_COLLECTION),
    where('userId', '==', userId),
    orderBy('startDate', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Symptom operations
export const saveSymptomLog = async (userId: string, symptomData: Partial<SymptomLog>) => {
  const symptomRef = doc(collection(db, SYMPTOMS_COLLECTION));
  await setDoc(symptomRef, {
    ...symptomData,
    userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return symptomRef.id;
};

export const getSymptomLogs = async (userId: string, limitCount = 30) => {
  const q = query(
    collection(db, SYMPTOMS_COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Meal operations
export const saveMealLog = async (userId: string, mealData: Partial<MealLog>) => {
  const mealRef = doc(collection(db, MEALS_COLLECTION));
  await setDoc(mealRef, {
    ...mealData,
    userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return mealRef.id;
};

export const getMealLogs = async (userId: string, limitCount = 30) => {
  const q = query(
    collection(db, MEALS_COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Water Intake operations
export const saveWaterIntake = async (userId: string, amount: number) => {
  try {
    const waterRef = doc(collection(db, WATER_COLLECTION));
    const waterData: Partial<WaterIntake> = {
      userId,
      amount,
      timestamp: new Date(),
      createdAt: new Date(),
    };
    await setDoc(waterRef, {
      ...waterData,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
    
    console.log('Water saved successfully:', waterRef.id);
    
    // Update daily activity
    await updateDailyActivity(userId, { waterIntake: amount });
    
    return waterRef.id;
  } catch (error) {
    console.error('Error saving water intake:', error);
    throw error;
  }
};

export const getTodayWaterIntake = async (userId: string) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const q = query(
      collection(db, WATER_COLLECTION),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(today)),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Array<WaterIntake & { id: string }>;
    
    // Sum all water intake amounts from today
    const total = entries.reduce((sum, entry) => {
      const amount = entry.amount || 0;
      return sum + amount;
    }, 0);
    
    console.log(`Found ${entries.length} water entries for today, total: ${total}ml`);
    
    return { total, entries };
  } catch (error) {
    console.error('Error fetching today water intake:', error);
    return { total: 0, entries: [] };
  }
};

// Exercise operations
export const saveExercise = async (userId: string, exerciseData: Partial<Exercise>) => {
  try {
    const exerciseRef = doc(collection(db, EXERCISE_COLLECTION));
    await setDoc(exerciseRef, {
      ...exerciseData,
      userId,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
    
    console.log('Exercise saved successfully:', exerciseRef.id);
    
    // Update daily activity
    await updateDailyActivity(userId, { 
      totalActiveMinutes: exerciseData.duration || 0,
      totalCalories: exerciseData.caloriesBurned || 0,
    });
    
    return exerciseRef.id;
  } catch (error) {
    console.error('Error saving exercise:', error);
    throw error;
  }
};

export const getTodayExercises = async (userId: string) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const q = query(
      collection(db, EXERCISE_COLLECTION),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(today)),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const exercises = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Array<Exercise & { id: string }>;
    
    // Calculate totals from all exercises today
    const totals = exercises.reduce((acc, exercise) => {
      return {
        totalMinutes: acc.totalMinutes + (exercise.duration || 0),
        totalCalories: acc.totalCalories + (exercise.caloriesBurned || 0),
      };
    }, { totalMinutes: 0, totalCalories: 0 });
    
    console.log(`Found ${exercises.length} exercises for today:`, totals);
    
    return { 
      exercises, 
      totalMinutes: totals.totalMinutes,
      totalCalories: totals.totalCalories 
    };
  } catch (error) {
    console.error('Error fetching today exercises:', error);
    return { 
      exercises: [], 
      totalMinutes: 0,
      totalCalories: 0 
    };
  }
};

// Daily Activity operations
export const updateDailyActivity = async (userId: string, updates: Partial<DailyActivity>) => {
  const today = new Date().toISOString().split('T')[0];
  const activityRef = doc(db, DAILY_ACTIVITY_COLLECTION, `${userId}_${today}`);
  
  const activitySnap = await getDoc(activityRef);
  
  if (activitySnap.exists()) {
    const current = activitySnap.data();
    await setDoc(activityRef, {
      ...current,
      userId,
      date: today,
      waterIntake: updates.waterIntake 
        ? (current.waterIntake || 0) + updates.waterIntake 
        : current.waterIntake,
      totalActiveMinutes: updates.totalActiveMinutes 
        ? (current.totalActiveMinutes || 0) + updates.totalActiveMinutes 
        : current.totalActiveMinutes,
      totalCalories: updates.totalCalories 
        ? (current.totalCalories || 0) + updates.totalCalories 
        : current.totalCalories,
      gutHealth: updates.gutHealth !== undefined ? updates.gutHealth : current.gutHealth,
      gutHealthStatus: updates.gutHealthStatus !== undefined ? updates.gutHealthStatus : current.gutHealthStatus,
      moodScore: updates.moodScore !== undefined ? updates.moodScore : current.moodScore,
      updatedAt: Timestamp.now(),
    }, { merge: true });
  } else {
    await setDoc(activityRef, removeUndefined({
      userId,
      date: today,
      waterIntake: updates.waterIntake || 0,
      exercises: [],
      totalActiveMinutes: updates.totalActiveMinutes || 0,
      totalCalories: updates.totalCalories || 0,
      gutHealth: updates.gutHealth || 'normal',
      gutHealthStatus: updates.gutHealthStatus || 'stable',
      moodScore: updates.moodScore,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }));
  }
  
  // Update streak
  await updateStreak(userId, 'overall');
};

export const getDailyActivity = async (userId: string, date?: string) => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const activityRef = doc(db, DAILY_ACTIVITY_COLLECTION, `${userId}_${targetDate}`);
  const activitySnap = await getDoc(activityRef);
  
  return activitySnap.exists() ? activitySnap.data() : null;
};

// Streak operations
export const updateStreak = async (userId: string, streakType: string) => {
  const streakRef = doc(db, STREAKS_COLLECTION, `${userId}_${streakType}`);
  const streakSnap = await getDoc(streakRef);
  
  const today = new Date().toISOString().split('T')[0];
  
  if (streakSnap.exists()) {
    const current = streakSnap.data();
    const lastDate = current.lastActivityDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = current.currentStreak;
    
    if (lastDate === yesterdayStr) {
      // Continue streak
      newStreak += 1;
    } else if (lastDate !== today) {
      // Streak broken, reset to 1
      newStreak = 1;
    }
    
    await setDoc(streakRef, {
      ...current,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, current.longestStreak || 0),
      lastActivityDate: today,
      updatedAt: Timestamp.now(),
    }, { merge: true });
  } else {
    await setDoc(streakRef, {
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: today,
      streakType,
      updatedAt: Timestamp.now(),
    });
  }
};

export const getStreak = async (userId: string, streakType: string = 'overall') => {
  const streakRef = doc(db, STREAKS_COLLECTION, `${userId}_${streakType}`);
  const streakSnap = await getDoc(streakRef);
  
  return streakSnap.exists() ? streakSnap.data() : { currentStreak: 0, longestStreak: 0 };
};

