/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const buildOpenAIClient = () => {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set. Add it to your environment variables.');
  }
  return new OpenAI({ apiKey: OPENAI_API_KEY });
};

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, userId, userProfile } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ 
        error: 'Please provide a food image',
        suggestion: 'Upload or snap a clear photo of your meal'
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

    const openai = buildOpenAIClient();

    const prompt = `${contextPrompt}

  You are analyzing a food image for a Nigerian woman with specific health needs.

  **TASK:** Identify the food in the image

**YOUR TASK:**
1. Identify the food item (use Nigerian food names if applicable: Jollof Rice, Amala, Suya, Eba, Fufu, Pounded Yam, Egusi, Efo Riro, Akara, Moi Moi, Puff Puff, etc.)
2. Estimate portion size and nutritional values:
   - Calories (kcal)
   - Protein (g)
   - Carbohydrates (g)
   - Fat (g)
   - Fiber (g)
3. **ULCER SAFETY CHECK:** If user has an ulcer, identify any triggers (spicy, fried, acidic, tomato-based)
4. **PCOS ADVICE:** If user has PCOS, comment on glycemic index and insulin impact
5. Give a brief recommendation (1-2 sentences)

**OUTPUT FORMAT (JSON only):**
{
  "foodName": "Name of the dish",
  "portionSize": "estimated portion (e.g., '1 plate', '2 cups')",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "ulcerWarning": "Warning message if triggers detected, or null",
  "pcosAdvice": "PCOS-specific advice or null",
  "recommendation": "Brief recommendation"
}

**IMPORTANT:** 
- Be accurate with Nigerian dishes and portions
- If analyzing an image, describe what you see first
- For ulcers, be STRICT about triggers
- Keep recommendations supportive and brief
- Return ONLY valid JSON, no markdown code blocks`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
              detail: 'high'
            }
          }
        ]
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Vision model for image understanding
      messages,
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
      console.error('Failed to parse AI response:', text);
      return NextResponse.json({
        error: 'Failed to analyze food',
        details: 'AI response was not in expected format',
        rawResponse: text,
      }, { status: 500 });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing food:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const isMissingKey = errorMessage.includes('OPENAI_API_KEY');
    const friendly = isMissingKey
      ? 'AI is not configured. Add OPENAI_API_KEY to your environment variables'
      : 'Failed to analyze food';

    return NextResponse.json(
      { error: friendly, details: errorMessage },
      { status: 500 }
    );
  }
}
