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

// Collections
const USERS_COLLECTION = 'users';
const CYCLES_COLLECTION = 'cycles';
const SYMPTOMS_COLLECTION = 'symptoms';
const MEALS_COLLECTION = 'meals';

// User operations
export const saveUserProfile = async (userId: string, data: any) => {
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
