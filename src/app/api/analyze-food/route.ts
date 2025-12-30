/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { image, userId, userProfile } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Remove data URL prefix
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

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

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro-latest',
    });

    const prompt = `${contextPrompt}

You are analyzing a food image for a Nigerian woman with specific health needs.

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

**OUTPUT FORMAT (JSON):**
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
- Keep recommendations supportive and brief`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    // Try to extract JSON from response
    let analysis;
    try {
      // Find JSON in response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to parse the entire response
        analysis = JSON.parse(text);
      }
    } catch (parseError) {
      // If parsing fails, create a structured response from the text
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
    return NextResponse.json(
      { error: 'Failed to analyze food image' },
      { status: 500 }
    );
  }
}
