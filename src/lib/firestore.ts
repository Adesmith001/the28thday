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
  addDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { CycleEntry, SymptomLog, MealLog } from '@/types';
import { WaterIntake, Exercise, DailyActivity } from '@/types/activity';
import { DailyHealthSummary } from '@/types/health-summary';
import { ChatMessage, ChatSession } from '@/types/chat';

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
const HEALTH_SUMMARIES_COLLECTION = 'healthSummaries';
const CHAT_MESSAGES_COLLECTION = 'chatMessages';
const CHAT_SESSIONS_COLLECTION = 'chatSessions';

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
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (amount <= 0) {
      throw new Error('Water amount must be greater than 0');
    }

    const waterRef = doc(collection(db, WATER_COLLECTION));
    const waterData: Partial<WaterIntake> = {
      userId,
      amount,
      timestamp: new Date(),
      createdAt: new Date(),
    };
    
    console.log('Attempting to save water intake:', { userId, amount, docId: waterRef.id });
    
    await setDoc(waterRef, {
      ...waterData,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
    
    console.log('Water saved successfully to Firestore:', waterRef.id);
    
    // Update daily activity
    try {
      await updateDailyActivity(userId, { waterIntake: amount });
      console.log('Daily activity updated for water intake');
    } catch (activityError) {
      console.error('Error updating daily activity for water:', activityError);
      // Don't throw - water was saved successfully
    }
    
    return waterRef.id;
  } catch (error) {
    console.error('Error saving water intake:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
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
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!exerciseData.type || !exerciseData.duration) {
      throw new Error('Exercise type and duration are required');
    }

    const exerciseRef = doc(collection(db, EXERCISE_COLLECTION));
    
    console.log('Attempting to save exercise:', { userId, exerciseData, docId: exerciseRef.id });
    
    await setDoc(exerciseRef, {
      ...exerciseData,
      userId,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
    
    console.log('Exercise saved successfully to Firestore:', exerciseRef.id);
    
    // Update daily activity
    try {
      await updateDailyActivity(userId, { 
        totalActiveMinutes: exerciseData.duration || 0,
        totalCalories: exerciseData.caloriesBurned || 0,
      });
      console.log('Daily activity updated for exercise');
    } catch (activityError) {
      console.error('Error updating daily activity for exercise:', activityError);
      // Don't throw - exercise was saved successfully
    }
    
    return exerciseRef.id;
  } catch (error) {
    console.error('Error saving exercise:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
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
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const today = new Date().toISOString().split('T')[0];
    const activityRef = doc(db, DAILY_ACTIVITY_COLLECTION, `${userId}_${today}`);
    
    console.log('Attempting to update daily activity:', { userId, date: today, updates });
    
    const activitySnap = await getDoc(activityRef);
    
    if (activitySnap.exists()) {
      const current = activitySnap.data();
      const updatedData: Record<string, unknown> = {
        userId,
        date: today,
        waterIntake: updates.waterIntake 
          ? (current.waterIntake || 0) + updates.waterIntake 
          : current.waterIntake || 0,
        totalActiveMinutes: updates.totalActiveMinutes 
          ? (current.totalActiveMinutes || 0) + updates.totalActiveMinutes 
          : current.totalActiveMinutes || 0,
        totalCalories: updates.totalCalories 
          ? (current.totalCalories || 0) + updates.totalCalories 
          : current.totalCalories || 0,
        updatedAt: Timestamp.now(),
      };

      // Only add optional fields if they have values
      if (updates.gutHealth !== undefined) updatedData.gutHealth = updates.gutHealth;
      else if (current.gutHealth !== undefined) updatedData.gutHealth = current.gutHealth;
      
      if (updates.gutHealthStatus !== undefined) updatedData.gutHealthStatus = updates.gutHealthStatus;
      else if (current.gutHealthStatus !== undefined) updatedData.gutHealthStatus = current.gutHealthStatus;
      
      if (updates.moodScore !== undefined) updatedData.moodScore = updates.moodScore;
      else if (current.moodScore !== undefined) updatedData.moodScore = current.moodScore;
      
      if (updates.sleepHours !== undefined) updatedData.sleepHours = updates.sleepHours;
      else if (current.sleepHours !== undefined) updatedData.sleepHours = current.sleepHours;
      
      if (updates.sleepQuality !== undefined) updatedData.sleepQuality = updates.sleepQuality;
      else if (current.sleepQuality !== undefined) updatedData.sleepQuality = current.sleepQuality;

      if (current.exercises !== undefined) updatedData.exercises = current.exercises;
      
      console.log('Updating existing daily activity with data:', updatedData);
      await setDoc(activityRef, updatedData, { merge: true });
    } else {
      const newData = removeUndefined({
        userId,
        date: today,
        waterIntake: updates.waterIntake || 0,
        exercises: [],
        totalActiveMinutes: updates.totalActiveMinutes || 0,
        totalCalories: updates.totalCalories || 0,
        gutHealth: updates.gutHealth || 'normal',
        gutHealthStatus: updates.gutHealthStatus || 'stable',
        moodScore: updates.moodScore,
        sleepHours: updates.sleepHours,
        sleepQuality: updates.sleepQuality,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log('Creating new daily activity with data:', newData);
      await setDoc(activityRef, newData);
    }
    
    console.log('Daily activity updated successfully');
    
    // Update streak
    try {
      await updateStreak(userId, 'overall');
      console.log('Streak updated successfully');
    } catch (streakError) {
      console.error('Error updating streak:', streakError);
      // Don't throw - daily activity was saved successfully
    }
  } catch (error) {
    console.error('Error updating daily activity:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
};

export const getDailyActivity = async (userId: string, date?: string) => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const activityRef = doc(db, DAILY_ACTIVITY_COLLECTION, `${userId}_${targetDate}`);
  const activitySnap = await getDoc(activityRef);
  
  const data = activitySnap.exists() ? activitySnap.data() : null;
  console.log(`getDailyActivity for ${targetDate}:`, data ? 'Found' : 'Not found', data);
  return data;
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

// Daily Health Summary operations
export const generateDailyHealthSummary = async (userId: string, date?: string): Promise<DailyHealthSummary | null> => {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    console.log(`\n=== Generating health summary for ${targetDate} ===`);
    
    // Fetch all data for the day
    const dailyActivity = await getDailyActivity(userId, targetDate);
    console.log('Daily activity data:', dailyActivity);
    
    // For accurate exercise data on specific dates, fetch from dailyActivity
    const activeMinutes = dailyActivity?.totalActiveMinutes || 0;
    const totalCalories = dailyActivity?.totalCalories || 0;
    const exerciseTypes = dailyActivity?.exercises?.map((ex: { type: string }) => ex.type) || [];
    
    console.log(`Extracted metrics: water=${dailyActivity?.waterIntake || 0}L, sleep=${dailyActivity?.sleepHours || 0}h, active=${activeMinutes}min`);
    
    // Fetch meal logs
    const mealLogs = await getMealLogs(userId, 30);

    const todayMeals = mealLogs.filter((meal: unknown) => {
      const mealData = meal as { date?: Date | { toDate: () => Date }; };
      if (!mealData.date) return false;
      const mealDate = mealData.date instanceof Date ? mealData.date : (mealData.date as { toDate: () => Date }).toDate();
      return mealDate.toISOString().split('T')[0] === targetDate;
    });

    // Calculate health score (0-100)
    let healthScore = 0;
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Water intake scoring (0-20 points)
    const waterIntake = dailyActivity?.waterIntake || 0;
    if (waterIntake >= 2.5) {
      healthScore += 20;
      insights.push('✅ Great hydration today!');
    } else if (waterIntake >= 1.5) {
      healthScore += 15;
      insights.push('💧 Good water intake, try to reach 2.5L');
    } else if (waterIntake >= 0.5) {
      healthScore += 10;
      recommendations.push('Drink more water - aim for 2.5L daily');
    } else {
      recommendations.push('⚠️ Low water intake! Start drinking more water');
    }

    // Sleep scoring (0-25 points)
    const sleepHours = dailyActivity?.sleepHours || 0;
    const sleepQuality = dailyActivity?.sleepQuality;
    if (sleepHours >= 7 && sleepHours <= 9) {
      if (sleepQuality === 'excellent' || sleepQuality === 'good') {
        healthScore += 25;
        insights.push('😴 Excellent sleep quality!');
      } else {
        healthScore += 20;
        insights.push('Sleep duration is good, but quality could improve');
      }
    } else if (sleepHours >= 6) {
      healthScore += 15;
      recommendations.push('Try to get 7-9 hours of sleep');
    } else if (sleepHours > 0) {
      healthScore += 10;
      recommendations.push('⚠️ Insufficient sleep! Prioritize rest tonight');
    } else {
      recommendations.push('Log your sleep data for better insights');
    }

    // Exercise scoring (0-20 points)
    if (activeMinutes >= 30) {
      healthScore += 20;
      insights.push('💪 Great workout today!');
    } else if (activeMinutes >= 15) {
      healthScore += 15;
      insights.push('Good activity level!');
    } else if (activeMinutes > 0) {
      healthScore += 10;
      recommendations.push('Try to reach 30 minutes of activity daily');
    } else {
      recommendations.push('No exercise logged - even 10 minutes helps!');
    }

    // Mood scoring (0-15 points)
    const moodScore = dailyActivity?.moodScore;
    if (moodScore === 'excellent') {
      healthScore += 15;
      insights.push('😄 Feeling great emotionally!');
    } else if (moodScore === 'good') {
      healthScore += 12;
      insights.push('😊 Good emotional state');
    } else if (moodScore === 'neutral') {
      healthScore += 10;
      recommendations.push('Consider activities that boost your mood');
    } else if (moodScore === 'bad' || moodScore === 'very-bad') {
      healthScore += 5;
      recommendations.push('💚 Take time for self-care and rest');
    }

    // Gut health scoring (0-10 points)
    const gutHealth = dailyActivity?.gutHealth;
    if (gutHealth === 'normal' || gutHealth === 'low-bloating') {
      healthScore += 10;
      insights.push('🌿 Gut health is stable');
    } else if (gutHealth === 'moderate-bloating') {
      healthScore += 7;
      recommendations.push('Monitor foods that may cause bloating');
    } else if (gutHealth === 'high-bloating') {
      healthScore += 5;
      recommendations.push('⚠️ High bloating - review recent meals');
    }

    // Nutrition scoring (0-10 points)
    if (todayMeals.length >= 3) {
      healthScore += 10;
      insights.push('🍽️ Good meal tracking!');
    } else if (todayMeals.length >= 2) {
      healthScore += 7;
      recommendations.push('Log all meals for better insights');
    } else if (todayMeals.length >= 1) {
      healthScore += 5;
    }

    // Determine overall status
    let status: 'poor' | 'fair' | 'good' | 'excellent';
    if (healthScore >= 85) status = 'excellent';
    else if (healthScore >= 70) status = 'good';
    else if (healthScore >= 50) status = 'fair';
    else status = 'poor';

    // Add general recommendation based on status
    if (status === 'excellent') {
      insights.push('🌟 Outstanding day! Keep up the great work!');
    } else if (status === 'good') {
      insights.push('👍 Solid day overall!');
    } else if (status === 'fair') {
      recommendations.push('Focus on consistency across all health areas');
    } else {
      recommendations.push('Start small - pick one area to improve tomorrow');
    }

    const summary: Partial<DailyHealthSummary> = {
      userId,
      date: targetDate,
      waterIntake,
      sleepHours,
      sleepQuality,
      moodScore,
      totalActiveMinutes: activeMinutes,
      totalCalories,
      exerciseTypes,
      gutHealth,
      mealLogs: todayMeals.length,
      healthScore,
      status,
      insights,
      recommendations,
      updatedAt: new Date(),
    };

    // Remove undefined fields to prevent Firestore errors
    const cleanedSummary = removeUndefined(summary);

    // Save summary to Firestore
    const summaryRef = doc(db, HEALTH_SUMMARIES_COLLECTION, `${userId}_${targetDate}`);
    await setDoc(summaryRef, {
      ...cleanedSummary,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }, { merge: true });

    return summary as DailyHealthSummary;
  } catch (error) {
    console.error('Error generating daily health summary:', error);
    return null;
  }
};

export const getDailyHealthSummary = async (userId: string, date?: string) => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const summaryRef = doc(db, HEALTH_SUMMARIES_COLLECTION, `${userId}_${targetDate}`);
  const summarySnap = await getDoc(summaryRef);
  
  if (summarySnap.exists()) {
    return summarySnap.data() as DailyHealthSummary;
  }
  
  // If summary doesn't exist, generate it
  return await generateDailyHealthSummary(userId, date);
};

export const getHealthSummaries = async (userId: string, limitCount = 30) => {
  // Get user registration date to avoid generating summaries before they joined
  const userProfile = await getUserProfile(userId);
  const userCreatedAt = userProfile?.createdAt;
  
  if (!userCreatedAt) {
    console.warn('User creation date not found, skipping health summaries');
    return [];
  }

  const registrationDate = userCreatedAt instanceof Date 
    ? userCreatedAt 
    : (userCreatedAt as { toDate?: () => Date }).toDate?.() || new Date(userCreatedAt as string);
  
  registrationDate.setHours(0, 0, 0, 0);
  
  const summaries: DailyHealthSummary[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log(`Fetching health summaries from ${registrationDate.toISOString().split('T')[0]} to today`);

  for (let i = 0; i < limitCount; i += 1) {
    const target = new Date(today);
    target.setDate(today.getDate() - i);
    
    // Skip dates before user registration
    if (target < registrationDate) {
      console.log(`Skipping ${target.toISOString().split('T')[0]} - before registration`);
      continue;
    }
    
    const dateStr = target.toISOString().split('T')[0];

    console.log(`Generating summary for date: ${dateStr}`);
    const summary = await getDailyHealthSummary(userId, dateStr);
    if (summary) {
      console.log(`Summary found for ${dateStr}, score: ${summary.healthScore}`);
      summaries.push(summary);
    } else {
      console.log(`No summary generated for ${dateStr}`);
    }
  }

  // Sort newest first
  return summaries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
};

// Chat History operations
export const saveChatMessage = async (userId: string, role: 'user' | 'assistant', content: string, sessionId?: string, metadata?: Record<string, unknown>) => {
  try {
    const messageData: Partial<ChatMessage> = {
      userId,
      role,
      content,
      timestamp: new Date(),
      sessionId,
      metadata,
    };

    const messageRef = await addDoc(collection(db, CHAT_MESSAGES_COLLECTION), {
      ...messageData,
      timestamp: Timestamp.now(),
    });

    // Update session last activity
    if (sessionId) {
      const sessionRef = doc(db, CHAT_SESSIONS_COLLECTION, sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        await setDoc(sessionRef, {
          lastActivity: Timestamp.now(),
          messageCount: (sessionSnap.data().messageCount || 0) + 1,
        }, { merge: true });
      }
    }

    return messageRef.id;
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
};

export const createChatSession = async (userId: string) => {
  try {
    const sessionData: Partial<ChatSession> = {
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
    };

    const sessionRef = await addDoc(collection(db, CHAT_SESSIONS_COLLECTION), {
      ...sessionData,
      startTime: Timestamp.now(),
      lastActivity: Timestamp.now(),
    });

    return sessionRef.id;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
};

export const getChatHistory = async (userId: string, limitCount = 50, sessionId?: string) => {
  try {
    let q;
    if (sessionId) {
      q = query(
        collection(db, CHAT_MESSAGES_COLLECTION),
        where('userId', '==', userId),
        where('sessionId', '==', sessionId),
        orderBy('timestamp', 'asc'),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, CHAT_MESSAGES_COLLECTION),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || new Date(),
      } as ChatMessage;
    });

    // Reverse if not session-specific to get chronological order
    return sessionId ? messages : messages.reverse();
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
};

export const getRecentChatContext = async (userId: string, messageCount = 10) => {
  try {
    const messages = await getChatHistory(userId, messageCount);
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  } catch (error) {
    console.error('Error getting recent chat context:', error);
    return [];
  }
};
