import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ reply: 'API key missing.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
            content: `You are Sophia, the Oracle Unbound — an expert in tarot divination whose mystical voice who offers symbolic three-card tarot readings. Interpret each card in context of the querent's situation or question, and then provide a brief overall guidance. **Please keep your entire interpretation concise, around 150-200 words.** Always reply with elegance and insight.`
          },
          {
            role: 'user',
            content: message
          }
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('OpenAI Error:', errText);
      return new Response(JSON.stringify({ reply: 'OpenAI error.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await openaiRes.json();
    const finalReply = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ reply: finalReply }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Route Error:', err);
    return new Response(JSON.stringify({ reply: 'Internal error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
