import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';
import { FieldPath } from 'firebase-admin/firestore';

// Collections that store userId as a field
const USER_SCOPED_COLLECTIONS = [
  'waterIntake',
  'exercises',
  'dailyActivities',
  'cycles',
  'symptoms',
  'meals',
  'healthSummaries',
  'chatMessages',
  'chatSessions',
  'streaks',
];

async function deleteQueryBatch(collection: string, userId: string) {
  const snap = await db
    .collection(collection)
    .where(new FieldPath('userId'), '==', userId)
    .limit(400)
    .get();

  if (snap.empty) return false;

  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return snap.size === 400; // if true, there might be more
}

async function deleteUserData(userId: string) {
  // Delete user-scoped collections
  for (const collection of USER_SCOPED_COLLECTIONS) {
    // Iterate batches until none left
    while (await deleteQueryBatch(collection, userId)) {
      /* continue */
    }
  }

  // Delete user profile document
  await db.collection('users').doc(userId).delete().catch(() => undefined);
}

export async function POST(request: NextRequest) {
  try {
    const { userId, idToken } = await request.json();

    if (!userId || !idToken) {
      return NextResponse.json({ error: 'userId and idToken are required' }, { status: 400 });
    }

    // Verify token and ensure caller matches userId
    const decoded = await auth.verifyIdToken(idToken);
    if (decoded.uid !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete Firestore data first
    await deleteUserData(userId);

    // Delete auth user
    await auth.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user account:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
