import { NextRequest, NextResponse } from 'next/server';
import { saveMealLog } from '@/lib/firestore';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userId, ...mealData } = data;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const mealId = await saveMealLog(userId, {
      ...mealData,
      date: new Date(),
    });

    return NextResponse.json({ success: true, mealId });
  } catch (error) {
    console.error('Error saving meal log:', error);
    return NextResponse.json(
      { error: 'Failed to save meal log' },
      { status: 500 }
    );
  }
}
