'use client';
import { useState } from 'react';

export default function SpreadPage() {
  const [question, setQuestion] = useState('');
  const [cards, setCards] = useState<string[]>([]);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const tarotDeck = [
    // Major Arcana
    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
    "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
    "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
    "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
    "Judgement", "The World",
  
    // Minor Arcana – Wands
    "Ace of Wands", "Two of Wands", "Three of Wands", "Four of Wands", "Five of Wands",
    "Six of Wands", "Seven of Wands", "Eight of Wands", "Nine of Wands", "Ten of Wands",
    "Page of Wands", "Knight of Wands", "Queen of Wands", "King of Wands",
  
    // Minor Arcana – Cups
    "Ace of Cups", "Two of Cups", "Three of Cups", "Four of Cups", "Five of Cups",
    "Six of Cups", "Seven of Cups", "Eight of Cups", "Nine of Cups", "Ten of Cups",
    "Page of Cups", "Knight of Cups", "Queen of Cups", "King of Cups",
  
    // Minor Arcana – Swords
    "Ace of Swords", "Two of Swords", "Three of Swords", "Four of Swords", "Five of Swords",
    "Six of Swords", "Seven of Swords", "Eight of Swords", "Nine of Swords", "Ten of Swords",
    "Page of Swords", "Knight of Swords", "Queen of Swords", "King of Swords",
  
    // Minor Arcana – Pentacles
    "Ace of Pentacles", "Two of Pentacles", "Three of Pentacles", "Four of Pentacles", "Five of Pentacles",
    "Six of Pentacles", "Seven of Pentacles", "Eight of Pentacles", "Nine of Pentacles", "Ten of Pentacles",
    "Page of Pentacles", "Knight of Pentacles", "Queen of Pentacles", "King of Pentacles"
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
