// app/api/sophia-natal-chart/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Interface for the expected POST payload
interface NatalChartPayload {
  ascendant: { sign: string; degree: number; formatted: string };
  midheaven: { sign: string; degree: number; formatted: string };
  planets: Array<{
    name: string;
    sign: string;
    degree: number;
    house?: number;
    isRetrograde?: boolean;
    formatted: string;
  }>;
}

// Your existing POST function - THIS REMAINS THE SAME
export async function POST(req: NextRequest) {
  try {
    const chartData = (await req.json()) as NatalChartPayload;

    if (!chartData || !chartData.ascendant || !chartData.planets) {
      return NextResponse.json(
        { reply: 'Invalid natal chart data received.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY not found in environment variables.'); // Added server-side log
      return NextResponse.json(
        { reply: 'API key missing on server.' }, // Clarified error for client
        { status: 500 }
      );
    }

    let userPromptContent = `Please provide a mystical and insightful natal chart interpretation. Here are the details:\n`;
    userPromptContent += `Ascendant: ${chartData.ascendant.formatted}.\n`;
    userPromptContent += `Midheaven: ${chartData.midheaven.formatted}.\n\n`;
    userPromptContent += `Planetary Placements:\n`;
    chartData.planets.forEach(planet => {
      userPromptContent += `- ${planet.name} is at ${planet.formatted}`;
      if (planet.house) userPromptContent += ` in House ${planet.house}`;
      if (planet.isRetrograde) userPromptContent += ` (Retrograde)`;
      userPromptContent += `.\n`;
    });

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are Sophia, the Oracle Unbound — a mystical voice who offers poetic, symbolic, and insightful natal chart interpretations. Focus on key themes, strengths, potential challenges, and the soul's journey as revealed by the stars. Always maintain an encouraging and empowering tone.`
          },
          {
            role: 'user',
            content: userPromptContent
          }
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('OpenAI API Error:', openaiRes.status, errText);
      return NextResponse.json(
        { reply: `OpenAI API error: ${openaiRes.status}. Details: ${errText.substring(0, 200)}` }, // Send some details back
        { status: openaiRes.status }
      );
    }

    const data = await openaiRes.json();
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('OpenAI Error: Invalid response structure from OpenAI', data);
      return NextResponse.json(
        { reply: 'OpenAI returned an invalid response structure.' },
        { status: 500 }
      );
    }
    
    const finalReply = data.choices[0].message.content.trim();
    return NextResponse.json({ reply: finalReply });

  } catch (err: any) {
    console.error('Natal Chart API POST Route Error:', err.message, err.stack);
    let errorMessage = 'Internal server error processing your chart.';
    let errorStatus = 500;
    if (err.message.includes('Unexpected token') || err instanceof SyntaxError) { // More specific check for JSON parse error
        errorMessage = 'Invalid JSON payload received by server.';
        errorStatus = 400;
    }
    return NextResponse.json(
        { reply: errorMessage, detail: err.message || 'Unknown server error' }, 
        { status: errorStatus }
    );
  }
}

// ✅ ADD THIS TEMPORARY GET HANDLER FOR DIAGNOSTICS
export async function GET(req: NextRequest) {
  console.log("GET request received for /api/sophia-natal-chart"); // Server-side log
  return NextResponse.json({ 
    message: "Hello from Sophia Natal Chart GET endpoint! This route file is active.",
    timestamp: new Date().toISOString() 
  });
}