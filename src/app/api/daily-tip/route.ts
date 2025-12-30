import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { cyclePhase, gutHealth, cycleDay } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a wellness coach specializing in PCOS (Polycystic Ovary Syndrome) and women's health.

Current Context:
- Cycle Phase: ${cyclePhase}
- Cycle Day: ${cycleDay}
- Gut Health: ${gutHealth}

Generate ONE short, actionable daily wellness tip (2-3 sentences max) specifically for someone with PCOS in the ${cyclePhase} phase. 

Focus areas (pick ONE):
- Nutrition advice tailored to this cycle phase
- Gut health support and bloating management
- Natural remedies for PCOS symptoms
- Exercise recommendations for this phase
- Stress management techniques
- Sleep optimization
- Hormone-balancing foods

Requirements:
- Keep it conversational and supportive
- Be specific and actionable
- No medical advice or claims
- Focus on natural, holistic approaches
- Make it relevant to ${cyclePhase} phase energy levels

Format: Return ONLY the tip text without any labels or formatting.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const tip = response.text().trim();

    return NextResponse.json({ 
      tip,
      category: getCategoryFromPhase(cyclePhase)
    });
  } catch (error) {
    console.error('Error generating tip:', error);
    
    // Fallback tips if AI fails
    const fallbackTips = [
      "Stay hydrated! Aim for 8-10 glasses of water daily to support hormone balance and reduce bloating.",
      "Try adding cinnamon to your meals - it helps regulate blood sugar and supports insulin sensitivity.",
      "Prioritize sleep tonight. Aim for 7-9 hours to help regulate cortisol and support hormone balance.",
      "Consider adding spearmint tea to your routine - studies show it may help with PCOS symptoms.",
      "Focus on anti-inflammatory foods today like leafy greens, berries, and fatty fish.",
      "Take a 10-minute walk after meals to help manage blood sugar levels naturally.",
    ];
    
    return NextResponse.json({ 
      tip: fallbackTips[Math.floor(Math.random() * fallbackTips.length)],
      category: 'wellness'
    });
  }
}

function getCategoryFromPhase(phase: string): string {
  const categoryMap: { [key: string]: string } = {
    'Menstrual': 'nutrition',
    'Follicular': 'exercise',
    'Ovulation': 'wellness',
    'Luteal': 'nutrition',
  };
  return categoryMap[phase] || 'wellness';
}
