import { useEffect, useRef, useState, useCallback } from "react";

const GRID = 20;
const TILE = 20;
const SIZE = GRID * TILE;

type Point = { x: number; y: number };

export default function SimpleGameRC() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }] as Point[],
    food: { x: 5, y: 5 } as Point,
    dx: 0,
    dy: 0,
    running: false,
    score: 0,
    gameOver: false,
  });
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem("snake-hs") || 0));
  const [phase, setPhase] = useState<"idle" | "running" | "over">("idle");

  function placeFood(snake: Point[]): Point {
    let f: Point;
    do {
      f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (snake.some((s) => s.x === f.x && s.y === f.y));
    return f;
  }

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    // Move
    const head = { x: s.snake[0].x + s.dx, y: s.snake[0].y + s.dy };
    s.snake.unshift(head);

    if (head.x === s.food.x && head.y === s.food.y) {
      s.score += 10;
      setScore(s.score);
      s.food = placeFood(s.snake);
    } else {
      s.snake.pop();
    }

    // Collision
    const hitWall = head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID;
    const hitSelf = s.snake.slice(1).some((seg) => seg.x === head.x && seg.y === head.y);
    if (hitWall || hitSelf) {
      clearInterval(loopRef.current!);
      s.running = false;
      setPhase("over");
      if (s.score > highScore) {
        const hs = s.score;
        setHighScore(hs);
        localStorage.setItem("snake-hs", String(hs));
      }
      return;
    }

    // Render
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(s.food.x * TILE, s.food.y * TILE, TILE - 2, TILE - 2);
    s.snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? "#34d399" : "#10b981";
      ctx.fillRect(seg.x * TILE, seg.y * TILE, TILE - 2, TILE - 2);
    });
  }, [highScore]);

  function startGame() {
    const s = stateRef.current;
    s.snake = [{ x: 10, y: 10 }];
    s.dx = 1;
    s.dy = 0;
    s.score = 0;
    s.running = true;
    s.gameOver = false;
    s.food = placeFood(s.snake);
    setScore(0);
    setPhase("running");
    if (loopRef.current) clearInterval(loopRef.current);
    loopRef.current = setInterval(draw, 100);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const s = stateRef.current;
      if (!s.running && e.code === "Space") {
        startGame();
        return;
      }
      switch (e.key) {
        case "ArrowUp":
        case "w":
          if (s.dy === 0) {
            s.dx = 0;
            s.dy = -1;
          }
          break;
        case "ArrowDown":
        case "s":
          if (s.dy === 0) {
            s.dx = 0;
            s.dy = 1;
          }
          break;
        case "ArrowLeft":
        case "a":
          if (s.dx === 0) {
            s.dx = -1;
            s.dy = 0;
          }
          break;
        case "ArrowRight":
        case "d":
          if (s.dx === 0) {
            s.dx = 1;
            s.dy = 0;
          }
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-4 p-6">
      <div className="flex gap-8 text-sm">
        <span className="text-[#8b949e]">
          Score: <strong className="text-[#34d399] tabular-nums">{score}</strong>
        </span>
        <span className="text-[#8b949e]">
          Best: <strong className="text-[#f1e05a] tabular-nums">{highScore}</strong>
        </span>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-[#30363d]">
        <canvas ref={canvasRef} width={SIZE} height={SIZE} className="block" />
        {phase !== "running" && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
            <p className="text-[#e6edf3] text-xl font-bold">
              {phase === "over" ? "Game Over" : "Snake"}
            </p>
            {phase === "over" && <p className="text-[#8b949e] text-sm">Score: {score}</p>}
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-[#238636] border border-[#2ea043] text-white rounded-xl font-semibold text-sm hover:bg-[#2ea043] transition-colors"
            >
              {phase === "over" ? "Try Again" : "Start Game"}
            </button>
          </div>
        )}
      </div>

      {/* Mobile D-pad */}
      <div className="grid grid-cols-3 gap-1 mt-2">
        {[
          {
            label: "↑",
            row: 1,
            col: 2,
            dir: { dx: 0, dy: -1 },
            cond: (s: typeof stateRef.current) => s.dy === 0,
          },
          {
            label: "←",
            row: 2,
            col: 1,
            dir: { dx: -1, dy: 0 },
            cond: (s: typeof stateRef.current) => s.dx === 0,
          },
          {
            label: "↓",
            row: 2,
            col: 2,
            dir: { dx: 0, dy: 1 },
            cond: (s: typeof stateRef.current) => s.dy === 0,
          },
          {
            label: "→",
            row: 2,
            col: 3,
            dir: { dx: 1, dy: 0 },
            cond: (s: typeof stateRef.current) => s.dx === 0,
          },
        ].map(({ label, row, col, dir, cond }) => (
          <button
            key={label}
            onClick={() => {
              const s = stateRef.current;
              if (s.running && cond(s)) {
                s.dx = dir.dx;
                s.dy = dir.dy;
              }
            }}
            style={{ gridRow: row, gridColumn: col }}
            className="w-10 h-10 bg-[#21262d] border border-[#30363d] rounded-lg text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e]/40 transition-colors flex items-center justify-center"
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-[#484f58]">Arrow keys or WASD to control</p>
    </div>
  );
}
