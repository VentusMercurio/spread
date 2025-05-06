'use client';
import { useState } from 'react';

export default function SpreadPage() {
  const [question, setQuestion] = useState('');
  const [cards, setCards] = useState<string[]>([]);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const tarotDeck = [
    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
    "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
    "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
    "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
    "Judgement", "The World"
  ];

  function drawThreeCards() {
    const shuffled = [...tarotDeck].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setLoading(true);
    const drawn = drawThreeCards();
    setCards(drawn);

    const prompt = `A querent asked: "${question}". They drew the following three cards: 1) ${drawn[0]}, 2) ${drawn[1]}, 3) ${drawn[2]}. Please offer a poetic yet insightful three-card reading.`;

    try {
      const res = await fetch('/api/spread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await res.json();
      setResponse(data.reply);
    } catch {
      setResponse('⚠️ Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black p-6 font-serif text-center">
      <h1 className="text-3xl font-bold mb-4">Sophia’s Three Card Spread</h1>

      <input
        type="text"
        placeholder="Enter your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="p-2 border border-gray-400 rounded w-full max-w-md mb-4"
      />

      <div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded mb-6"
        >
          {loading ? 'Revealing...' : 'Reveal the Oracle'}
        </button>
      </div>

      {cards.length > 0 && (
        <div className="flex justify-center gap-4 mb-6">
          {cards.map((card, idx) => (
            <div key={idx} className="border p-4 rounded shadow bg-gray-100 w-32">
              <p className="font-bold">{card}</p>
            </div>
          ))}
        </div>
      )}

      {response && (
        <div className="max-w-xl mx-auto text-left border-t pt-4">
          <h2 className="font-semibold mb-2 text-lg">Sophia Replies:</h2>
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </main>
  );
}
// force cache bust
