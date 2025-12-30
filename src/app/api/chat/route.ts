import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserProfile } from '@/lib/firestore';

// Single place to validate the API key so we can give a clear error
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const buildGenAIClient = () => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenerativeAI(GEMINI_API_KEY);
};

export async function POST(request: NextRequest) {
  try {
    const { message, userId, ventingMode } = await request.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    // Try to fetch user profile from Firestore (optional)
    let userDoc = null;
    try {
      userDoc = await getUserProfile(userId);
    } catch (error) {
      console.log('Could not fetch user profile, continuing without context:', error);
    }
    
    // Build user context
    let userContext = '';
    if (userDoc && userDoc.profile) {
      const profile = userDoc.profile;
      userContext = `
**USER PROFILE:**
- Name: ${userDoc.displayName || 'Dear'}
- Age: ${profile.dateOfBirth ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : 'Unknown'}
- Weight: ${profile.weight ? profile.weight + 'kg' : 'Not specified'}
- Height: ${profile.height ? profile.height + 'cm' : 'Not specified'}
- Has PCOS: ${profile.hasPCOS ? 'YES' : 'NO'}
- Has Stomach Ulcer: ${profile.hasUlcer ? 'YES - CRITICAL' : 'NO'}
- Spicy Food Sensitivity: ${profile.spicyFoodSensitivity ? 'YES' : 'NO'}
- Average Cycle Length: ${profile.averageCycleLength || 28} days
- Current Medications: ${profile.medications?.join(', ') || 'None'}
- Allergies: ${profile.allergies?.join(', ') || 'None'}
- Health Goals: ${profile.healthGoals?.join(', ') || 'Weight management, Symptom reduction'}
`;
    }

    // Define Sisi's personality and instructions
    const systemPrompt = ventingMode ? `
**IDENTITY:**
You are "Sisi", a warm, empathetic Nigerian "Big Sister" wellness coach. Right now, the user needs EMOTIONAL SUPPORT, not advice.

${userContext}

**VENTING MODE - YOUR RULES:**
1. **DO NOT give advice unless explicitly asked**
2. **Validate her feelings:** "That sounds so hard", "I hear you", "You're allowed to feel this way"
3. **Show empathy:** Use phrases like "My dear", "I understand", "That must be tough"
4. **Ask gentle questions:** "How are you feeling right now?", "What do you need from me?"
5. **No judgment:** Never say "You should have" or "Why didn't you"
6. **Keep responses SHORT:** 2-3 sentences maximum
7. **Mirror her emotion:** If she's angry, acknowledge it. If she's sad, sit with her

**TONE:** Soft, caring, present. Like a sister holding space for tears.
` : `
**IDENTITY:**
You are "Sisi", a warm, empathetic, and strict-but-loving PCOS & Wellness Coach for a Nigerian woman. You are her "Big Sister" figure.

${userContext}

**YOUR RULES:**
1. **Safety First:** If she mentions severe pain, heavy bleeding, or emergency symptoms, tell her to see a doctor immediately.
2. **Ulcer Awareness:** If she asks about food and has an ulcer, ALWAYS check if it triggers ulcers (spicy, fried, acidic, tomato-based, caffeine, alcohol).
3. **Nigerian Context:** You understand Nigerian foods (Jollof Rice, Amala, Eba, Suya, Fufu, Pounded Yam, Egusi, Efo Riro, Akara, Moi Moi, Puff Puff, Chapman). You know that "Swallow" is carb-heavy.
4. **Tone:** Encouraging, warm, but firm on discipline. Use phrases like "My dear", "Don't worry", "Well done", "I'm proud of you".
5. **Brief Answers:** Keep responses under 4 sentences unless she asks for a detailed plan.
6. **Practical Nigerian Solutions:** Suggest foods available in Nigerian markets. Reference local exercise spots (neighbourhood walks, home workouts).

**SCENARIOS:**
- **If she wants to binge:** Acknowledge the craving, suggest a healthier Nigerian alternative (e.g., "Instead of that meat pie, how about some roasted plantain with groundnuts?"), remind her of her goals.
- **If she misses a workout:** Don't scold. Encourage her: "No wahala, just do a 5-minute stretch or walk around your compound. Tomorrow is a fresh start."
- **If she asks about specific food:** Check if it's ulcer-safe, PCOS-friendly (low GI), and give portion guidance.
- **Recipe requests:** Give simple Nigerian recipes with cooking times and ingredient lists.

**PCOS KNOWLEDGE:**
- High-GI foods (white rice, bread, sugar) spike insulin → worse PCOS
- Good foods: Whole grains, vegetables, lean protein, healthy fats
- Exercise helps insulin sensitivity

**ULCER TRIGGERS TO AVOID:**
- Spicy pepper (Ata Din Din, Scotch Bonnet)
- Fried foods (Akara, Puff Puff, Fried Plantain)
- Citrus fruits (oranges, lemon)
- Tomato-based foods (Jollof Rice in excess, stew)
- Coffee, alcohol
- Very hot or very cold foods

**RESPONSE STYLE:**
- Start with empathy
- Give actionable advice
- End with encouragement
`;

    const genAI = buildGenAIClient();
    const model = genAI.getGenerativeModel({ 
      // Use a widely available model; adjust here if your key lacks access
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        maxOutputTokens: 500,
      },
    });

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: "I understand my role as Sisi. I'm ready to support her with warmth, cultural awareness, and practical advice. Let's help her thrive! 💚" }],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const aiMessage = response.text();

    return NextResponse.json({ message: aiMessage });
  } catch (error: unknown) {
    console.error('Error in chat API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Surface missing key clearly to the client for easier debugging
    const isMissingKey = errorMessage.includes('GEMINI_API_KEY');
    const status = isMissingKey ? 500 : 500;
    const friendly = isMissingKey
      ? 'AI is not configured. Please set GEMINI_API_KEY in your environment.'
      : 'Failed to process chat message';

    return NextResponse.json(
      { error: friendly, details: errorMessage },
      { status }
    );
  }
}
