import React, { useState, useEffect } from 'react';
import { WordSearchLevel, getWordSearchLevelsForGrade } from '../../data/educationalGamesData';
import { GradeLevel } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import {
  ArrowLeft,
  CheckCircle2,
  Trophy,
  RotateCcw,
  Sparkles,
  Search,
  ChevronRight,
  ChevronLeft,
  Flame,
  HelpCircle,
} from 'lucide-react';

interface WordSearchGameProps {
  grade?: GradeLevel;
  onBack: () => void;
  onEarnPoints: (pts: number, isMajor?: boolean) => void;
}

const STORAGE_PROGRESS_KEY = 'estudahud_wordsearch_progress_v1';

export const WordSearchGame: React.FC<WordSearchGameProps> = ({ grade = '6_fund' as GradeLevel, onBack, onEarnPoints }) => {
  const levels = getWordSearchLevelsForGrade(grade as GradeLevel);

  // Load saved level and found words progress
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PROGRESS_KEY}_${grade}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.levelIndex === 'number' ? Math.min(parsed.levelIndex, levels.length - 1) : 0;
      }
    } catch {}
    return 0;
  });

  const level: WordSearchLevel = levels[currentLevelIndex] || levels[0];

  // Found words set for the current level
  const [foundWords, setFoundWords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PROGRESS_KEY}_${grade}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.levelIndex === currentLevelIndex && Array.isArray(parsed.foundWords)) {
          return parsed.foundWords;
        }
      }
    } catch {}
    return [];
  });

  // Cell selection state: Dragging / Clicking selection
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Sync state with local storage whenever level or found words change
  useEffect(() => {
    try {
      localStorage.setItem(
        `${STORAGE_PROGRESS_KEY}_${grade}`,
        JSON.stringify({
          levelIndex: currentLevelIndex,
          foundWords: foundWords,
        })
      );
    } catch {}

    // Check if level is completed
    if (level.words.length > 0 && foundWords.length === level.words.length) {
      if (!isCompleted) {
        setIsCompleted(true);
        soundEffects.playLevelUp();
        onEarnPoints(30, true);
      }
    } else {
      setIsCompleted(false);
    }
  }, [currentLevelIndex, foundWords, level.words.length, grade, isCompleted]);

  // Handle cell click / tap start
  const handleCellClick = (r: number, c: number) => {
    soundEffects.playClick();
    if (selectedCells.length === 0) {
      setSelectedCells([[r, c]]);
      setIsSelecting(true);
    } else {
      // If clicking already selected or creating a line
      const first = selectedCells[0];
      const newPath = getLinearPath(first, [r, c]);
      if (newPath) {
        checkWordPath(newPath);
      }
      setSelectedCells([]);
      setIsSelecting(false);
    }
  };

  const getLinearPath = (start: [number, number], end: [number, number]): [number, number][] | null => {
    const [r1, c1] = start;
    const [r2, c2] = end;
    const path: [number, number][] = [];

    // Horizontal
    if (r1 === r2) {
      const step = c2 >= c1 ? 1 : -1;
      for (let c = c1; step > 0 ? c <= c2 : c >= c2; c += step) {
        path.push([r1, c]);
      }
      return path;
    }

    // Vertical
    if (c1 === c2) {
      const step = r2 >= r1 ? 1 : -1;
      for (let r = r1; step > 0 ? r <= r2 : r >= r2; r += step) {
        path.push([r, c1]);
      }
      return path;
    }

    // Diagonal
    if (Math.abs(r2 - r1) === Math.abs(c2 - c1)) {
      const rStep = r2 >= r1 ? 1 : -1;
      const cStep = c2 >= c1 ? 1 : -1;
      let r = r1;
      let c = c1;
      while (rStep > 0 ? r <= r2 : r >= r2) {
        path.push([r, c]);
        r += rStep;
        c += cStep;
      }
      return path;
    }

    return null;
  };

  const checkWordPath = (path: [number, number][]) => {
    const letters = path.map(([r, c]) => level.grid[r][c]).join('');
    const reversed = letters.split('').reverse().join('');

    const matched = level.words.find(
      (w) =>
        (w.word.toUpperCase() === letters.toUpperCase() ||
          w.word.toUpperCase() === reversed.toUpperCase()) &&
        !foundWords.includes(w.word)
    );

    if (matched) {
      soundEffects.playCorrect('bonus');
      const nextFound = [...foundWords, matched.word];
      setFoundWords(nextFound);
      onEarnPoints(15);

      if (nextFound.length === level.words.length) {
        soundEffects.playLevelUp();
        onEarnPoints(50, true);
        setIsCompleted(true);
      }
    } else {
      soundEffects.playError();
    }
  };

  const isCellInFoundWords = (r: number, c: number): boolean => {
    for (const w of level.words) {
      if (foundWords.includes(w.word)) {
        const path = getLinearPath(w.start, w.end);
        if (path && path.some(([pr, pc]) => pr === r && pc === c)) {
          return true;
        }
      }
    }
    return false;
  };

  const isCellSelected = (r: number, c: number): boolean => {
    return selectedCells.some(([sr, sc]) => sr === r && sc === c);
  };

  const handleNextLevel = () => {
    soundEffects.playClick();
    if (currentLevelIndex < levels.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
      setFoundWords([]);
      setSelectedCells([]);
    }
  };

  const handlePrevLevel = () => {
    soundEffects.playClick();
    if (currentLevelIndex > 0) {
      setCurrentLevelIndex((prev) => prev - 1);
      setFoundWords([]);
      setSelectedCells([]);
    }
  };

  const handleResetLevel = () => {
    soundEffects.playClick();
    setFoundWords([]);
    setSelectedCells([]);
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

        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-300 rounded-full text-emerald-900 text-xs font-bold shadow-xs">
          <Search className="w-3.5 h-3.5 text-emerald-700" />
          <span>Caça-Palavras Educativo</span>
        </div>

        <button
          onClick={handleResetLevel}
          title="Reiniciar nível atual"
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
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              Nível {level.id} de {levels.length}
            </span>
            <span className="text-[10px] font-bold text-slate-400">Progresso Salvo 💾</span>
          </div>
          <h3 className="text-xs font-black text-slate-900 mt-0.5">{level.theme}</h3>
        </div>

        <button
          disabled={currentLevelIndex === levels.length - 1}
          onClick={handleNextLevel}
          className="p-1.5 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition"
        >
          <ChevronRight className="w-4 h-4 text-slate-700" />
        </button>
      </div>

      {/* Word Grid Board */}
      <div className="bg-white border border-emerald-300 rounded-3xl p-3.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black text-slate-800">
            Palavras Encontradas: {foundWords.length}/{level.words.length}
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Toque na 1ª e última letra
          </span>
        </div>

        {/* The Matrix */}
        <div
          className="grid gap-1 select-none mx-auto w-full max-w-[340px]"
          style={{ gridTemplateColumns: `repeat(${level.gridSize}, minmax(0, 1fr))` }}
        >
          {level.grid.map((row, rIdx) =>
            row.map((letter, cIdx) => {
              const inFound = isCellInFoundWords(rIdx, cIdx);
              const isSel = isCellSelected(rIdx, cIdx);

              let style = 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-emerald-50';
              if (inFound) {
                style = 'bg-emerald-500 text-white font-black border-emerald-600 shadow-2xs scale-[0.98]';
              } else if (isSel) {
                style = 'bg-amber-400 text-amber-950 font-black border-amber-500 animate-pulse';
              }

              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                  className={`aspect-square rounded-xl border flex items-center justify-center font-bold text-xs sm:text-sm transition-all active:scale-90 ${style}`}
                >
                  {letter}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Words Checklist with Hints */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 shadow-xs">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
          Lista de Palavras & Pistas Educativas:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {level.words.map((w) => {
            const isFound = foundWords.includes(w.word);
            return (
              <div
                key={w.word}
                className={`p-2 rounded-xl border text-xs flex items-center justify-between transition ${
                  isFound
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 line-through'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <span className="font-black mr-1.5">{w.word}</span>
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    {w.hint}
                  </span>
                </div>
                {isFound ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Modal / Banner */}
      {isCompleted && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl text-center space-y-2 shadow-lg animate-in zoom-in-95">
          <Trophy className="w-8 h-8 mx-auto text-amber-300 animate-bounce" />
          <h3 className="text-sm font-black">Parabéns! Nível Concluído! 🎉</h3>
          <p className="text-xs text-emerald-100">
            Você encontrou todas as palavras educativas e faturou +50 Pontos!
          </p>
          {currentLevelIndex < levels.length - 1 && (
            <button
              onClick={handleNextLevel}
              className="mt-2 w-full py-2.5 bg-white text-emerald-900 rounded-xl font-bold text-xs shadow-xs hover:bg-emerald-50 transition active:scale-95 flex items-center justify-center gap-1.5"
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
