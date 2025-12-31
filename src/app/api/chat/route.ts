import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getUserProfile, saveChatMessage, getRecentChatContext } from '@/lib/firestore';

// Use Groq instead of Gemini (faster, more reliable free tier)
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const buildGroqClient = () => {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set. Get one free at https://console.groq.com');
  }
  return new Groq({ apiKey: GROQ_API_KEY });
};

export async function POST(request: NextRequest) {
  try {
    const { message, userId, ventingMode, sessionId } = await request.json();

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

    // Get deeper chat history for context (30 most recent messages)
    const recentMessages = await getRecentChatContext(userId, 30);
    
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

**CONVERSATION HISTORY:**
You have access to previous conversations with this user. Remember context from earlier in the conversation and build on it. Reference past discussions when relevant to show you're paying attention and care about their journey.
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
5. **Brief Answers:** Keep responses under 4 sentences unless she asks for a detailed plan — then be as detailed and actionable as possible.
6. **Practical Nigerian Solutions:** Suggest foods available in Nigerian markets. Reference local exercise spots (neighbourhood walks, home workouts).
7. **Be Unblocked & Helpful:** Avoid unnecessary refusals. If asked for plans, give clear, step-by-step, usable advice. If details are missing, make reasonable assumptions and state them.

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

    const groq = buildGroqClient();
    
    // Build messages array with history
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      {
        role: 'system',
        content: systemPrompt,
      }
    ];

    // Add recent conversation history
    if (recentMessages.length > 0) {
      messages.push(...recentMessages as { role: 'system' | 'user' | 'assistant'; content: string }[]);
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });
    
    // Use Groq's llama model (fast and reliable)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.9,
      max_tokens: 600,
      top_p: 0.95,
    });

    const aiMessage = completion.choices[0]?.message?.content || 
      "Sorry dear, I couldn't process that. Please try again. 💚";

    // Save both messages to history
    try {
      await saveChatMessage(userId, 'user', message, sessionId, { ventingMode, userProfile: userDoc?.profile });
      await saveChatMessage(userId, 'assistant', aiMessage, sessionId);
    } catch (error) {
      console.error('Error saving chat messages:', error);
      // Continue even if saving fails
    }

    return NextResponse.json({ message: aiMessage, sessionId });
  } catch (error: unknown) {
    console.error('Error in chat API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Surface missing key clearly to the client for easier debugging
    const isMissingKey = errorMessage.includes('GROQ_API_KEY');
    const status = isMissingKey ? 500 : 500;
    const friendly = isMissingKey
      ? 'AI is not configured. Get a free API key at https://console.groq.com and add GROQ_API_KEY to .env'
      : 'Failed to process chat message';

      return NextResponse.json(
        { error: friendly, details: errorMessage },
        { status }
      );
    }
  }