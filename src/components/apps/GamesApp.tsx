'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Gamepad2, Search, Play, ArrowLeft, RotateCcw, Trophy, Volume2 } from 'lucide-react';

type GameMode = 'hub' | 'minesweeper' | 'snake' | '2048';

interface GameItem {
  id: 'minesweeper' | 'snake' | '2048';
  title: string;
  description: string;
  gradient: string;
  icon: string;
  accent: string;
  tag: string;
}

const GAMES: GameItem[] = [
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    description: 'Find every safe tile without opening a mine.',
    gradient: 'from-slate-800 to-zinc-900 border-slate-700/60',
    icon: '💣',
    accent: '#38BDF8',
    tag: 'Classic Logic',
  },
  {
    id: 'snake',
    title: 'Snake',
    description: 'Eat, grow, and keep the run alive.',
    gradient: 'from-emerald-800 to-green-950 border-emerald-600/50',
    icon: '🐍',
    accent: '#22C55E',
    tag: 'Retro Arcade',
  },
  {
    id: '2048',
    title: '2048',
    description: 'Merge tiles until the board sings.',
    gradient: 'from-amber-700 to-orange-950 border-orange-500/50',
    icon: '🔢',
    accent: '#F97316',
    tag: 'Math Puzzle',
  },
];

export function GamesApp() {
  const [activeGame, setActiveGame] = useState<GameMode>('hub');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = GAMES.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#11141B] text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Header */}
      <div className="h-16 px-6 bg-[#161B26] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {activeGame !== 'hub' ? (
            <button
              onClick={() => setActiveGame('hub')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Games</span>
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-xl shadow-inner border border-sky-500/30">
              <Gamepad2 size={22} />
            </div>
          )}

          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              {activeGame === 'hub'
                ? 'Games'
                : activeGame === 'minesweeper'
                ? 'Minesweeper'
                : activeGame === 'snake'
                ? 'Snake Arcade'
                : '2048 Puzzle'}
            </h1>
            <p className="text-[11px] text-slate-400">
              {activeGame === 'hub'
                ? 'Classic desktop breaks, rebuilt for this portfolio'
                : 'Interactive browser game built for LivingYuji OS'}
            </p>
          </div>
        </div>

        {/* Search Bar in Hub */}
        {activeGame === 'hub' && (
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search games"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1F2535] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto window-scroll p-6 flex flex-col justify-center">
        {activeGame === 'hub' && (
          <div className="max-w-3xl w-full mx-auto space-y-4">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                onClick={() => setActiveGame(game.id)}
                className={`p-5 rounded-2xl bg-gradient-to-r ${game.gradient} border shadow-lg cursor-pointer hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-between group`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-black/30 backdrop-blur-sm border border-white/15 flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                    {game.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white tracking-tight">{game.title}</h2>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-white/90">
                        {game.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{game.description}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveGame(game.id);
                  }}
                  className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform shrink-0"
                  title="Play"
                >
                  <Play size={20} className="fill-black ml-0.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeGame === 'minesweeper' && <PlayableMinesweeper onBack={() => setActiveGame('hub')} />}
        {activeGame === 'snake' && <PlayableSnake onBack={() => setActiveGame('hub')} />}
        {activeGame === '2048' && <Playable2048 onBack={() => setActiveGame('hub')} />}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 1. Playable Minesweeper
// ----------------------------------------------------
function PlayableMinesweeper({ onBack }: { onBack: () => void }) {
  const ROWS = 9;
  const COLS = 9;
  const MINES = 10;

  type Cell = { r: number; c: number; isMine: boolean; isOpen: boolean; isFlagged: boolean; count: number };
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [minesLeft, setMinesLeft] = useState(MINES);
  const [time, setTime] = useState(0);

  const initGame = useCallback(() => {
    const newBoard: Cell[][] = [];
    for (let r = 0; r < ROWS; r++) {
      newBoard[r] = [];
      for (let c = 0; c < COLS; c++) {
        newBoard[r][c] = { r, c, isMine: false, isOpen: false, isFlagged: false, count: 0 };
      }
    }

    // Place mines
    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (!newBoard[r][c].isMine) {
        newBoard[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate neighboring counts
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newBoard[nr][nc].isMine) {
                count++;
              }
            }
          }
          newBoard[r][c].count = count;
        }
      }
    }

    setBoard(newBoard);
    setGameState('playing');
    setMinesLeft(MINES);
    setTime(0);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    let t: any;
    if (gameState === 'playing') {
      t = setInterval(() => setTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(t);
  }, [gameState]);

  const openCell = (r: number, c: number) => {
    if (gameState !== 'playing' || board[r][c].isOpen || board[r][c].isFlagged) return;

    const nextBoard = board.map((row) => row.map((cell) => ({ ...cell })));

    if (nextBoard[r][c].isMine) {
      // Reveal all mines
      nextBoard.forEach((row) =>
        row.forEach((cell) => {
          if (cell.isMine) cell.isOpen = true;
        })
      );
      setBoard(nextBoard);
      setGameState('lost');
      return;
    }

    // Flood fill opening for empty cells
    const reveal = (currR: number, currC: number) => {
      if (currR < 0 || currR >= ROWS || currC < 0 || currC >= COLS) return;
      const cell = nextBoard[currR][currC];
      if (cell.isOpen || cell.isFlagged || cell.isMine) return;
      cell.isOpen = true;
      if (cell.count === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            reveal(currR + dr, currC + dc);
          }
        }
      }
    };

    reveal(r, c);
    setBoard(nextBoard);

    // Check win
    let won = true;
    for (let row of nextBoard) {
      for (let cell of row) {
        if (!cell.isMine && !cell.isOpen) won = false;
      }
    }
    if (won) setGameState('won');
  };

  const flagCell = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameState !== 'playing' || board[r][c].isOpen) return;
    const nextBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    const target = nextBoard[r][c];
    target.isFlagged = !target.isFlagged;
    setBoard(nextBoard);
    setMinesLeft((prev) => (target.isFlagged ? prev - 1 : prev + 1));
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="bg-[#181E2C] border-2 border-[#2B354C] rounded-2xl p-5 shadow-2xl">
        {/* Scoreboard / Controls */}
        <div className="flex items-center justify-between bg-[#0F1420] p-3 rounded-xl border border-white/10 mb-4">
          <div className="font-mono text-red-500 font-bold text-lg bg-black/60 px-3 py-1 rounded border border-red-500/30">
            {String(Math.max(0, minesLeft)).padStart(3, '0')}
          </div>
          <button
            onClick={initGame}
            className="text-2xl hover:scale-110 active:scale-95 transition-transform"
            title="Restart"
          >
            {gameState === 'playing' ? '🙂' : gameState === 'won' ? '😎' : '😵'}
          </button>
          <div className="font-mono text-red-500 font-bold text-lg bg-black/60 px-3 py-1 rounded border border-red-500/30">
            {String(Math.min(999, time)).padStart(3, '0')}
          </div>
        </div>

        {/* Board Grid */}
        <div className="grid grid-cols-9 gap-1 bg-[#0E121B] p-2 rounded-xl border border-white/10">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => openCell(r, c)}
                onContextMenu={(e) => flagCell(e, r, c)}
                className={`w-8 h-8 rounded text-xs font-bold flex items-center justify-center transition-all ${
                  cell.isOpen
                    ? cell.isMine
                      ? 'bg-red-600 text-white'
                      : 'bg-[#1E2536] text-white shadow-inner'
                    : 'bg-[#2E384D] hover:bg-[#3A4660] text-transparent shadow border-t border-l border-white/20'
                }`}
              >
                {cell.isOpen ? (
                  cell.isMine ? (
                    '💣'
                  ) : cell.count > 0 ? (
                    <span
                      style={{
                        color:
                          cell.count === 1
                            ? '#38BDF8'
                            : cell.count === 2
                            ? '#4ADE80'
                            : cell.count === 3
                            ? '#F87171'
                            : '#C084FC',
                      }}
                    >
                      {cell.count}
                    </span>
                  ) : (
                    ''
                  )
                ) : cell.isFlagged ? (
                  <span className="text-yellow-400">🚩</span>
                ) : (
                  ''
                )}
              </button>
            ))
          )}
        </div>
      </div>
      <div className="text-[11px] text-slate-400 flex items-center gap-4">
        <span>Click to uncover</span>
        <span>•</span>
        <span>Right-click to flag</span>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. Playable Snake Arcade
// ----------------------------------------------------
function PlayableSnake({ onBack }: { onBack: () => void }) {
  const GRID_SIZE = 18;
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 9, y: 9 },
    { x: 8, y: 9 },
    { x: 7, y: 9 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 13, y: 9 });
  const [dir, setDir] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const resetSnake = () => {
    setSnake([
      { x: 9, y: 9 },
      { x: 8, y: 9 },
      { x: 7, y: 9 },
    ]);
    setFood({ x: 13, y: 9 });
    setDir('RIGHT');
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code) && dir !== 'DOWN') setDir('UP');
      if (['ArrowDown', 'KeyS'].includes(e.code) && dir !== 'UP') setDir('DOWN');
      if (['ArrowLeft', 'KeyA'].includes(e.code) && dir !== 'RIGHT') setDir('LEFT');
      if (['ArrowRight', 'KeyD'].includes(e.code) && dir !== 'LEFT') setDir('RIGHT');
    },
    [dir]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isGameOver || isPaused) return;

    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = { ...prev[0] };
        if (dir === 'UP') head.y -= 1;
        if (dir === 'DOWN') head.y += 1;
        if (dir === 'LEFT') head.x -= 1;
        if (dir === 'RIGHT') head.x += 1;

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setIsGameOver(true);
          return prev;
        }

        // Self collision
        if (prev.some((seg) => seg.x === head.x && seg.y === head.y)) {
          setIsGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];

        // Eat food
        if (head.x === food.x && head.y === food.y) {
          setScore((s) => {
            const next = s + 10;
            if (next > highScore) setHighScore(next);
            return next;
          });
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 110);

    return () => clearInterval(interval);
  }, [dir, food, isGameOver, isPaused, highScore]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="bg-[#121E17] border-2 border-emerald-600/40 rounded-2xl p-5 shadow-2xl">
        {/* Scoreboard */}
        <div className="flex items-center justify-between bg-black/40 px-4 py-2.5 rounded-xl border border-emerald-500/20 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span>Score:</span>
            <span className="text-white font-mono text-sm">{score}</span>
          </div>
          <button
            onClick={resetSnake}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-semibold text-xs transition-colors"
          >
            <RotateCcw size={14} />
            <span>Restart</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Trophy size={14} />
            <span className="text-white font-mono text-sm">{highScore}</span>
          </div>
        </div>

        {/* Board */}
        <div
          className="relative bg-[#07110B] rounded-xl border border-emerald-500/30 overflow-hidden"
          style={{ width: 320, height: 320 }}
        >
          {/* Food */}
          <div
            className="absolute rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]"
            style={{
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              left: `${(food.x * 100) / GRID_SIZE}%`,
              top: `${(food.y * 100) / GRID_SIZE}%`,
            }}
          />

          {/* Snake segments */}
          {snake.map((seg, idx) => (
            <div
              key={idx}
              className={`absolute rounded-sm ${
                idx === 0 ? 'bg-emerald-300 shadow-[0_0_6px_#6EE7B7]' : 'bg-emerald-500'
              }`}
              style={{
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                left: `${(seg.x * 100) / GRID_SIZE}%`,
                top: `${(seg.y * 100) / GRID_SIZE}%`,
              }}
            />
          ))}

          {isGameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
              <span className="text-xl font-bold text-red-400">Game Over!</span>
              <p className="text-xs text-slate-300">Final Score: {score}</p>
              <button
                onClick={resetSnake}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="text-[11px] text-slate-400">Use Arrow keys or WASD to control the snake</div>
    </div>
  );
}

// ----------------------------------------------------
// 3. Playable 2048 Puzzle
// ----------------------------------------------------
function Playable2048({ onBack }: { onBack: () => void }) {
  const [grid, setGrid] = useState<number[][]>(() => initGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  function initGrid() {
    const g = Array(4)
      .fill(0)
      .map(() => Array(4).fill(0));
    addRandom(g);
    addRandom(g);
    return g;
  }

  function addRandom(g: number[][]) {
    const empty: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length > 0) {
      const [r, c] = empty[Math.floor(Math.random() * empty.length)];
      g[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  const slideRow = (row: number[]): { newRow: number[]; gained: number } => {
    const filtered = row.filter((val) => val !== 0);
    let gained = 0;
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        gained += filtered[i];
        filtered.splice(i + 1, 1);
      }
    }
    while (filtered.length < 4) filtered.push(0);
    return { newRow: filtered, gained };
  };

  const move = useCallback(
    (dir: 'left' | 'right' | 'up' | 'down') => {
      let moved = false;
      let totalGained = 0;
      const nextGrid = grid.map((r) => [...r]);

      if (dir === 'left') {
        for (let r = 0; r < 4; r++) {
          const { newRow, gained } = slideRow(nextGrid[r]);
          totalGained += gained;
          if (newRow.some((val, idx) => val !== nextGrid[r][idx])) moved = true;
          nextGrid[r] = newRow;
        }
      } else if (dir === 'right') {
        for (let r = 0; r < 4; r++) {
          const reversed = [...nextGrid[r]].reverse();
          const { newRow, gained } = slideRow(reversed);
          newRow.reverse();
          totalGained += gained;
          if (newRow.some((val, idx) => val !== nextGrid[r][idx])) moved = true;
          nextGrid[r] = newRow;
        }
      } else if (dir === 'up') {
        for (let c = 0; c < 4; c++) {
          const col = [nextGrid[0][c], nextGrid[1][c], nextGrid[2][c], nextGrid[3][c]];
          const { newRow, gained } = slideRow(col);
          totalGained += gained;
          for (let r = 0; r < 4; r++) {
            if (nextGrid[r][c] !== newRow[r]) moved = true;
            nextGrid[r][c] = newRow[r];
          }
        }
      } else if (dir === 'down') {
        for (let c = 0; c < 4; c++) {
          const col = [nextGrid[3][c], nextGrid[2][c], nextGrid[1][c], nextGrid[0][c]];
          const { newRow, gained } = slideRow(col);
          newRow.reverse();
          totalGained += gained;
          for (let r = 0; r < 4; r++) {
            if (nextGrid[r][c] !== newRow[r]) moved = true;
            nextGrid[r][c] = newRow[r];
          }
        }
      }

      if (moved) {
        addRandom(nextGrid);
        setGrid(nextGrid);
        setScore((prev) => {
          const next = prev + totalGained;
          if (next > bestScore) setBestScore(next);
          return next;
        });
      }
    },
    [grid, bestScore]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) move('left');
      if (['ArrowRight', 'KeyD'].includes(e.code)) move('right');
      if (['ArrowUp', 'KeyW'].includes(e.code)) move('up');
      if (['ArrowDown', 'KeyS'].includes(e.code)) move('down');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="bg-[#211710] border-2 border-orange-500/40 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between bg-black/40 px-4 py-2.5 rounded-xl border border-orange-500/20 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
            <span>Score:</span>
            <span className="text-white font-mono text-sm">{score}</span>
          </div>
          <button
            onClick={() => {
              setGrid(initGrid());
              setScore(0);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-600/30 hover:bg-orange-600/50 text-orange-300 font-semibold text-xs transition-colors"
          >
            <RotateCcw size={14} />
            <span>Restart</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Trophy size={14} />
            <span className="text-white font-mono text-sm">{bestScore}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 bg-[#120B06] p-3 rounded-xl border border-orange-500/30">
          {grid.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-base shadow-sm transition-all select-none"
                style={{
                  backgroundColor:
                    val === 0
                      ? 'rgba(255,255,255,0.04)'
                      : val === 2
                      ? '#E2E8F0'
                      : val === 4
                      ? '#CBD5E1'
                      : val === 8
                      ? '#F97316'
                      : val === 16
                      ? '#EA580C'
                      : val === 32
                      ? '#DC2626'
                      : val === 64
                      ? '#B91C1C'
                      : val >= 128
                      ? '#FBBF24'
                      : '#F59E0B',
                  color: val <= 4 && val > 0 ? '#1E293B' : '#FFFFFF',
                }}
              >
                {val > 0 ? val : ''}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="text-[11px] text-slate-400">Use Arrow keys or WASD to merge tiles</div>
    </div>
  );
}
