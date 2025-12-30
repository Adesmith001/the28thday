/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const buildGroqClient = () => {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set. Get one free at https://console.groq.com');
  }
  return new Groq({ apiKey: GROQ_API_KEY });
};

export async function POST(request: NextRequest) {
  try {
    const { foodDescription, userId, userProfile } = await request.json();

    if (!foodDescription) {
      return NextResponse.json({ 
        error: 'Please describe the food',
        suggestion: 'Use the chat to ask: "Can I eat [food name]?"'
      }, { status: 400 });
    }

    // Build context from user profile
    let contextPrompt = '';
    if (userProfile) {
      contextPrompt = `
**USER CONTEXT:**
- Conditions: ${userProfile.hasPCOS ? 'PCOS' : ''} ${userProfile.hasUlcer ? '+ Active Stomach Ulcer' : ''}
- Ulcer Sensitivity: ${userProfile.hasUlcer ? 'HIGH - Avoid spicy, fried, acidic foods' : 'None'}
- PCOS Management: ${userProfile.hasPCOS ? 'Focus on low-GI, anti-inflammatory foods' : 'None'}
- Current Weight: ${userProfile.weight ? userProfile.weight + 'kg' : 'Not specified'}
`;
    }

    const groq = buildGroqClient();

    const prompt = `${contextPrompt}

You are analyzing food for a Nigerian woman with specific health needs.

**FOOD:** ${foodDescription}

**TASK:**
1. Identify the food item (use Nigerian food names if applicable: Jollof Rice, Amala, Suya, Eba, etc.)
2. Estimate nutritional values per serving:
   - Calories (kcal)
   - Protein (g)
   - Carbohydrates (g)
   - Fat (g)
3. **ULCER SAFETY CHECK:** If user has an ulcer, identify any triggers (spicy, fried, acidic, tomato-based)
4. **PCOS ADVICE:** If user has PCOS, comment on glycemic index and insulin impact
5. Give a brief recommendation (1-2 sentences)

**OUTPUT FORMAT (JSON only, no markdown):**
{
  "foodName": "Name of the dish",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "ulcerWarning": "Warning message if triggers detected, or null",
  "pcosAdvice": "PCOS-specific advice or null",
  "recommendation": "Brief recommendation"
}

**IMPORTANT:** 
- Be accurate with Nigerian dishes
- If you're uncertain, estimate conservatively
- For ulcers, be STRICT about triggers
- Keep recommendations supportive and brief
- Return ONLY valid JSON, no markdown code blocks`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const text = completion.choices[0]?.message?.content || '';

    // Try to extract JSON from response
    let analysis;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      // Find JSON in response
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(cleanText);
      }
    } catch (parseError) {
      console.log('Could not parse JSON, using text response:', text);
      analysis = {
        foodName: 'Food Item',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        ulcerWarning: null,
        pcosAdvice: null,
        recommendation: text,
      };
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing food:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to analyze food', details: errorMessage },
      { status: 500 }
    );
  }
}
