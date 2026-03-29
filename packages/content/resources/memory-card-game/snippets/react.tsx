import { useState, useEffect, useCallback } from "react";

const EMOJIS = ["🚀", "🎨", "🎮", "💡", "🎵", "⚡", "🔥", "🌈"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Card = { id: number; emoji: string; flipped: boolean; matched: boolean };

function makeCards(): Card[] {
  return shuffle([...EMOJIS, ...EMOJIS]).map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
}

export default function MemoryCardGameRC() {
  const [cards, setCards] = useState<Card[]>(makeCards);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);

  const matched = cards.filter((c) => c.matched).length / 2;

  const flip = useCallback(
    (id: number) => {
      if (locked) return;
      const card = cards.find((c) => c.id === id);
      if (!card || card.flipped || card.matched) return;
      if (flipped.length === 2) return;

      const newFlipped = [...flipped, id];
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)));
      setFlipped(newFlipped);

      if (newFlipped.length === 2) {
        setMoves((m) => m + 1);
        const [a, b] = newFlipped.map((fid) => cards.find((c) => c.id === fid)!);
        if (a.emoji === b.emoji) {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                newFlipped.includes(c.id) ? { ...c, matched: true, flipped: true } : c
              )
            );
            setFlipped([]);
            setWon(cards.filter((c) => c.matched).length + 2 === cards.length);
          }, 400);
        } else {
          setLocked(true);
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) => (newFlipped.includes(c.id) ? { ...c, flipped: false } : c))
            );
            setFlipped([]);
            setLocked(false);
          }, 900);
        }
      }
    },
    [cards, flipped, locked]
  );

  useEffect(() => {
    if (cards.every((c) => c.matched)) setWon(true);
  }, [cards]);

  function restart() {
    setCards(makeCards());
    setFlipped([]);
    setMoves(0);
    setLocked(false);
    setWon(false);
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4 text-sm">
            <span className="text-[#8b949e]">
              Moves: <strong className="text-[#e6edf3]">{moves}</strong>
            </span>
            <span className="text-[#8b949e]">
              Matches:{" "}
              <strong className="text-[#7ee787]">
                {matched}/{EMOJIS.length}
              </strong>
            </span>
          </div>
          <button onClick={restart} className="text-xs text-[#58a6ff] hover:underline">
            New game
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => flip(card.id)}
              disabled={card.matched}
              className="aspect-square rounded-xl text-2xl transition-all duration-300 select-none"
              style={{
                background: card.flipped || card.matched ? "#21262d" : "#161b22",
                border: `1px solid ${card.matched ? "#238636" : card.flipped ? "#58a6ff" : "#30363d"}`,
                transform: card.flipped || card.matched ? "rotateY(0deg)" : "rotateY(180deg)",
              }}
            >
              {card.flipped || card.matched ? card.emoji : ""}
            </button>
          ))}
        </div>

        {won && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-10">
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 text-center m-6">
              <p className="text-4xl mb-3">🎉</p>
              <h2 className="text-[#e6edf3] font-bold text-xl mb-1">You won!</h2>
              <p className="text-[#8b949e] text-sm mb-6">Completed in {moves} moves</p>
              <button
                onClick={restart}
                className="px-6 py-2.5 bg-[#238636] border border-[#2ea043] text-white rounded-xl font-semibold text-sm hover:bg-[#2ea043] transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
