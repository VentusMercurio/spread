'use client';

import { useState } from 'react';

export default function Page() {
  const [prompt, setPrompt] = useState('');
  const [cards, setCards] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState('');

  const handleCardChange = (index: number, value: string) => {
    const updated = [...cards];
    updated[index] = value;
    setCards(updated);
  };

  const submitSpread = async () => {
    setLoading(true);
    setReply('');
    try {
      const res = await fetch('/api/spread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, cards }),
      });
      const data = await res.json();
      setReply(data.reply);
    } catch {
      setReply('⚠️ Failed to get reading.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1e0631] text-white flex flex-col items-center justify-center p-6 space-y-6 font-cinzel">
      <h1 className="text-3xl font-bold text-pink-300">Sophia’s Three Card Spread</h1>
      
      <input
        className="p-2 w-full max-w-md text-black rounded"
        placeholder="Enter your question..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div className="flex flex-col space-y-2 w-full max-w-md">
        {cards.map((card, i) => (
          <input
            key={i}
            className="p-2 text-black rounded"
            placeholder={`Card ${i + 1}`}
            value={card}
            onChange={(e) => handleCardChange(i, e.target.value)}
          />
        ))}
      </div>

      <button
        className="px-4 py-2 bg-pink-600 hover:bg-pink-800 rounded"
        onClick={submitSpread}
        disabled={loading}
      >
        {loading ? 'Interpreting...' : 'Reveal the Oracle'}
      </button>

      {reply && (
        <div className="bg-white bg-opacity-10 p-4 rounded max-w-2xl text-center text-sm">
          <strong className="text-pink-400">Sophia replies:</strong><br />
          {reply}
        </div>
      )}
    </main>
  );
}
