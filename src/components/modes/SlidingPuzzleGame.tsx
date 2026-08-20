import React, { useState, useEffect } from 'react';
import { SlidingPuzzleLevel, getSlidingPuzzleLevelsForGrade } from '../../data/educationalGamesData';
import { GradeLevel } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import {
  ArrowLeft,
  Trophy,
  RotateCcw,
  Sparkles,
  Puzzle,
  ChevronRight,
  ChevronLeft,
  Shuffle,
  Clock,
  Zap,
} from 'lucide-react';

interface SlidingPuzzleGameProps {
  grade?: GradeLevel;
  onBack: () => void;
  onEarnPoints: (pts: number, isMajor?: boolean) => void;
}

const STORAGE_PUZZLE_KEY = 'estudahud_sliding_puzzle_progress_v1';

export const SlidingPuzzleGame: React.FC<SlidingPuzzleGameProps> = ({ grade = '6_fund' as GradeLevel, onBack, onEarnPoints }) => {
  const levels = getSlidingPuzzleLevelsForGrade(grade as GradeLevel);

  // Load saved level index
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PUZZLE_KEY}_${grade}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.levelIndex === 'number' ? Math.min(parsed.levelIndex, levels.length - 1) : 0;
      }
    } catch {}
    return 0;
  });

  const level: SlidingPuzzleLevel = levels[currentLevelIndex] || levels[0];

  // Current board state
  const [tiles, setTiles] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PUZZLE_KEY}_${grade}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.levelIndex === currentLevelIndex && Array.isArray(parsed.tiles)) {
          return parsed.tiles;
        }
      }
    } catch {}
    return [...level.tiles];
  });

  const [movesCount, setMovesCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Sync / Reset on level switch
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PUZZLE_KEY}_${grade}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.levelIndex === currentLevelIndex && Array.isArray(parsed.tiles)) {
          setTiles(parsed.tiles);
          setMovesCount(parsed.movesCount || 0);
          return;
        }
      }
    } catch {}

    setTiles([...level.tiles]);
    setMovesCount(0);
    setIsCompleted(false);
  }, [currentLevelIndex, level.tiles, grade]);

  // Check solved condition & save state
  useEffect(() => {
    try {
      localStorage.setItem(
        `${STORAGE_PUZZLE_KEY}_${grade}`,
        JSON.stringify({
          levelIndex: currentLevelIndex,
          tiles: tiles,
          movesCount: movesCount,
        })
      );
    } catch {}

    // Check if current tiles match solution
    const isSolved = tiles.every((val, idx) => val === level.solution[idx]);
    if (isSolved && !isCompleted && movesCount > 0) {
      setIsCompleted(true);
      soundEffects.playLevelUp();
      onEarnPoints(50, true);
    }
  }, [tiles, level.solution, currentLevelIndex, movesCount, isCompleted, onEarnPoints, grade]);

  // Handle tile slide click
  const handleTileClick = (index: number) => {
    if (isCompleted) return;

    const emptyIndex = tiles.indexOf(0);
    const size = level.size;

    const row = Math.floor(index / size);
    const col = index % size;

    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    // Check adjacency (up, down, left, right)
    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      soundEffects.playClick();
      const newTiles = [...tiles];
      newTiles[emptyIndex] = newTiles[index];
      newTiles[index] = 0;
      setTiles(newTiles);
      setMovesCount((prev) => prev + 1);
    } else {
      soundEffects.playError();
    }
  };

  const handleNextLevel = () => {
    soundEffects.playClick();
    if (currentLevelIndex < levels.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
    }
  };

  const handlePrevLevel = () => {
    soundEffects.playClick();
    if (currentLevelIndex > 0) {
      setCurrentLevelIndex((prev) => prev - 1);
    }
  };

  const handleResetLevel = () => {
    soundEffects.playClick();
    setTiles([...level.tiles]);
    setMovesCount(0);
    setIsCompleted(false);
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-3.5 bg-slate-50 max-w-lg mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-200 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Jogos</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-100 border border-cyan-300 rounded-full text-cyan-900 text-xs font-bold shadow-xs">
          <Puzzle className="w-3.5 h-3.5 text-cyan-700" />
          <span>Quebra-Cabeça Deslizante</span>
        </div>

        <button
          onClick={handleResetLevel}
          title="Reiniciar posição inicial"
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Level Selection & Navigation bar */}
      <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
        <button
          disabled={currentLevelIndex === 0}
          onClick={handlePrevLevel}
          className="p-1.5 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition"
        >
          <ChevronLeft className="w-4 h-4 text-slate-700" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full border border-cyan-200">
              Nível {level.id} de {levels.length}
            </span>
            <span className="text-[10px] font-bold text-slate-400">Progresso Salvo 💾</span>
          </div>
          <h3 className="text-xs font-black text-slate-900 mt-0.5">{level.category}</h3>
        </div>

        <button
          disabled={currentLevelIndex === levels.length - 1}
          onClick={handleNextLevel}
          className="p-1.5 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition"
        >
          <ChevronRight className="w-4 h-4 text-slate-700" />
        </button>
      </div>

      {/* Goal Instructions */}
      <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
        <div>
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
            Objetivo:
          </span>
          <p className="text-xs font-semibold text-slate-800 leading-snug">
            {level.description}
          </p>
        </div>
        <div className="text-right shrink-0 pl-3">
          <span className="text-[10px] font-bold text-slate-400 block">Movimentos</span>
          <span className="text-sm font-black font-mono text-cyan-700">{movesCount}</span>
        </div>
      </div>

      {/* Puzzle Board Grid */}
      <div className="bg-white border border-cyan-300 rounded-3xl p-4 shadow-sm">
        <div
          className="grid gap-2 mx-auto max-w-[320px] aspect-square"
          style={{ gridTemplateColumns: `repeat(${level.size}, minmax(0, 1fr))` }}
        >
          {tiles.map((val, idx) => {
            const isEmpty = val === 0;
            const emojiText = level.themeEmojis ? level.themeEmojis[val - 1] : null;

            if (isEmpty) {
              return (
                <div
                  key={idx}
                  className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100/50 flex items-center justify-center text-slate-300 text-xs font-mono"
                >
                  Vazio
                </div>
              );
            }

            return (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                className="rounded-2xl bg-gradient-to-b from-cyan-50 to-blue-50 border-2 border-cyan-200 hover:border-cyan-400 text-cyan-950 font-black text-sm sm:text-base flex flex-col items-center justify-center p-2 shadow-xs hover:shadow-md transition active:scale-95 group"
              >
                {emojiText ? (
                  <span className="text-xs sm:text-sm text-center leading-tight">
                    {emojiText}
                  </span>
                ) : (
                  <span className="text-lg font-mono font-black text-cyan-900 group-hover:scale-110 transition">
                    {val}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="p-4 bg-cyan-600 text-white rounded-2xl text-center space-y-2 shadow-lg animate-in zoom-in-95">
          <Trophy className="w-8 h-8 mx-auto text-amber-300 animate-bounce" />
          <h3 className="text-sm font-black">Quebra-Cabeça Resolvido com Sucesso! 🎉</h3>
          <p className="text-xs text-cyan-100">
            Você completou o nível em {movesCount} movimentos e faturou +50 Pontos!
          </p>
          {currentLevelIndex < levels.length - 1 && (
            <button
              onClick={handleNextLevel}
              className="mt-2 w-full py-2.5 bg-white text-cyan-900 rounded-xl font-bold text-xs shadow-xs hover:bg-cyan-50 transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Próximo Nível</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
