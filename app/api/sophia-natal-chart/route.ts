// app/api/sophia-natal-chart/route.ts
import { NextRequest, NextResponse } from 'next/server'; // NextResponse is often preferred for responses

export async function POST(req: NextRequest) {
  try {
    // --- 1. Define Expected Input Data Structure ---
    // We expect data like: { ascendant: {...}, midheaven: {...}, planets: [...] }
    // Let's define an interface for better type safety (optional but good practice)
    interface NatalChartPayload {
      ascendant: { sign: string; degree: number; formatted: string };
      midheaven: { sign: string; degree: number; formatted: string };
      planets: Array<{
        name: string;
        sign: string;
        degree: number;
        house?: number; // House might be optional if not always calculated/sent
        isRetrograde?: boolean;
        formatted: string;
      }>;
      // You could add other fields like user_query_about_chart if needed
    }

    // --- 2. Parse Incoming Natal Chart Data ---
    const chartData = (await req.json()) as NatalChartPayload; // Type assertion
    
    // Basic validation (you can add more robust validation)
    if (!chartData || !chartData.ascendant || !chartData.planets) {
      return NextResponse.json(
        { reply: 'Invalid natal chart data received.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { reply: 'API key missing.' },
        { status: 500 }
      );
    }

    // --- 3. Construct the Prompt for OpenAI ---
    // This is where we'll build the detailed prompt for Sophia
    let userPromptContent = `Please provide a mystical and insightful natal chart interpretation. Here are the details:\n`;
    userPromptContent += `Ascendant: ${chartData.ascendant.formatted}.\n`;
    userPromptContent += `Midheaven: ${chartData.midheaven.formatted}.\n\n`;
    userPromptContent += `Planetary Placements:\n`;

    chartData.planets.forEach(planet => {
      userPromptContent += `- ${planet.name} is at ${planet.formatted}`;
      if (planet.house) {
        userPromptContent += ` in House ${planet.house}`;
      }
      if (planet.isRetrograde) {
        userPromptContent += ` (Retrograde)`;
      }
      userPromptContent += `.\n`;
    });
    
    // You can add more sections to the prompt here, e.g., if you send aspects, or signs on house cusps.
    // userPromptContent += "\nConsider the overall themes and energies present in this chart."

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Or gpt-4 if you have access and prefer it
        messages: [
          {
            role: 'system',
            // ✅ MODIFIED System Prompt for Natal Charts
            content: `You are Sophia, the Oracle Unbound — a mystical voice who offers poetic, symbolic, and insightful natal chart interpretations. Focus on key themes, strengths, potential challenges, and the soul's journey as revealed by the stars. Always maintain an encouraging and empowering tone.`
          },
          {
            role: 'user',
            content: userPromptContent // ✅ Our dynamically generated prompt
          }
        ],
        // temperature: 0.7, // Optional: Adjust creativity. 0.7 is a common default.
        // max_tokens: 500,  // Optional: Limit response length if needed
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('OpenAI Error:', openaiRes.status, errText);
      return NextResponse.json(
        { reply: `OpenAI API error: ${openaiRes.status}. Please check server logs.` },
        { status: openaiRes.status } // Return OpenAI's status code
      );
    }

    const data = await openaiRes.json();
    
    // Check if choices array exists and has content
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
        console.error('OpenAI Error: Invalid response structure', data);
        return NextResponse.json(
            { reply: 'OpenAI returned an invalid response structure.' },
            { status: 500 }
        );
    }
    
    const finalReply = data.choices[0].message.content.trim();

    return NextResponse.json({ reply: finalReply }); // Using NextResponse for consistency

  } catch (err: any) { // Type the error for better handling
    console.error('Natal Chart API Route Error:', err);
    let errorMessage = 'Internal server error.';
    if (err instanceof SyntaxError) { // Specifically catch JSON parsing errors
        errorMessage = 'Invalid JSON payload received.';
        return NextResponse.json({ reply: errorMessage }, { status: 400 });
    }
    // You could add more specific error handling here
    return NextResponse.json(
        { reply: errorMessage, detail: err.message || 'Unknown error' }, 
        { status: 500 }
    );
  }
}