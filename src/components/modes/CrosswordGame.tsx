import React, { useState, useEffect } from 'react';
import { CrosswordLevel, getCrosswordLevelsForGrade } from '../../data/educationalGamesData';
import { GradeLevel } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import {
  ArrowLeft,
  CheckCircle2,
  Trophy,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Grid,
  Lightbulb,
} from 'lucide-react';

interface CrosswordGameProps {
  grade?: GradeLevel;
  onBack: () => void;
  onEarnPoints: (pts: number, isMajor?: boolean) => void;
}

const STORAGE_CROSSWORD_KEY = 'estudahud_crossword_progress_v1';

export const CrosswordGame: React.FC<CrosswordGameProps> = ({ grade = '6_fund' as GradeLevel, onBack, onEarnPoints }) => {
  const levels = getCrosswordLevelsForGrade(grade as GradeLevel);

  // Load saved level index
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_CROSSWORD_KEY}_${grade}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.levelIndex === 'number' ? Math.min(parsed.levelIndex, levels.length - 1) : 0;
      }
    } catch {}
    return 0;
  });

  const level: CrosswordLevel = levels[currentLevelIndex] || levels[0];

  // Grid user inputs matrix [row][col] => letter
  const [userGrid, setUserGrid] = useState<string[][]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_CROSSWORD_KEY}_${grade}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.levelIndex === currentLevelIndex && Array.isArray(parsed.userGrid)) {
          return parsed.userGrid;
        }
      }
    } catch {}
    // Empty matrix
    return Array.from({ length: level.gridSize.rows }, () =>
      Array.from({ length: level.gridSize.cols }, () => '')
    );
  });

  const [selectedClueIndex, setSelectedClueIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Initialize or re-set when changing level
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_CROSSWORD_KEY}_${grade}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.levelIndex === currentLevelIndex && Array.isArray(parsed.userGrid)) {
          setUserGrid(parsed.userGrid);
          return;
        }
      }
    } catch {}

    setUserGrid(
      Array.from({ length: level.gridSize.rows }, () =>
        Array.from({ length: level.gridSize.cols }, () => '')
      )
    );
    setSelectedClueIndex(0);
    setIsCompleted(false);
  }, [currentLevelIndex, level.gridSize.rows, level.gridSize.cols, grade]);

  // Save progress & check win condition
  useEffect(() => {
    try {
      localStorage.setItem(
        `${STORAGE_CROSSWORD_KEY}_${grade}`,
        JSON.stringify({
          levelIndex: currentLevelIndex,
          userGrid: userGrid,
        })
      );
    } catch {}

    // Verify all clues
    let allCorrect = true;
    for (const clue of level.clues) {
      for (let i = 0; i < clue.answer.length; i++) {
        const r = clue.direction === 'across' ? clue.row : clue.row + i;
        const c = clue.direction === 'across' ? clue.col + i : clue.col;
        if (r < level.gridSize.rows && c < level.gridSize.cols) {
          if ((userGrid[r]?.[c] || '').toUpperCase() !== clue.answer[i].toUpperCase()) {
            allCorrect = false;
            break;
          }
        }
      }
      if (!allCorrect) break;
    }

    if (allCorrect && level.clues.length > 0 && !isCompleted) {
      setIsCompleted(true);
      soundEffects.playLevelUp();
      onEarnPoints(50, true);
    }
  }, [userGrid, currentLevelIndex, level.clues, level.gridSize.rows, level.gridSize.cols, isCompleted, onEarnPoints]);

  // Build a map of valid crossword cells with clue numbers
  const cellInfoMap = React.useMemo(() => {
    const map = new Map<string, { valid: boolean; numbers: number[] }>();

    level.clues.forEach((clue) => {
      for (let i = 0; i < clue.answer.length; i++) {
        const r = clue.direction === 'across' ? clue.row : clue.row + i;
        const c = clue.direction === 'across' ? clue.col + i : clue.col;
        const key = `${r}-${c}`;
        const existing = map.get(key) || { valid: true, numbers: [] };
        if (i === 0) {
          existing.numbers.push(clue.number);
        }
        map.set(key, existing);
      }
    });

    return map;
  }, [level.clues]);

  const handleInputChange = (r: number, c: number, value: string) => {
    const letter = value.slice(-1).toUpperCase();
    soundEffects.playClick();

    setUserGrid((prev) => {
      const next = prev.map((rowArr) => [...rowArr]);
      next[r][c] = letter;
      return next;
    });
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
    setUserGrid(
      Array.from({ length: level.gridSize.rows }, () =>
        Array.from({ length: level.gridSize.cols }, () => '')
      )
    );
    setIsCompleted(false);
  };

  // Check if a single clue is solved
  const isClueSolved = (clue: (typeof level.clues)[0]) => {
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i;
      const c = clue.direction === 'across' ? clue.col + i : clue.col;
      if (r < level.gridSize.rows && c < level.gridSize.cols) {
        if ((userGrid[r]?.[c] || '').toUpperCase() !== clue.answer[i].toUpperCase()) {
          return false;
        }
      }
    }
    return true;
  };

  const activeClue = level.clues[selectedClueIndex] || level.clues[0];

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

        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 border border-purple-300 rounded-full text-purple-900 text-xs font-bold shadow-xs">
          <Grid className="w-3.5 h-3.5 text-purple-700" />
          <span>Palavras Cruzadas</span>
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
            <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
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

      {/* Active Clue Highlight Card */}
      {activeClue && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-2.5 shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {activeClue.number}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">
              {activeClue.direction === 'across' ? '➡️ Horizontal' : '⬇️ Vertical'} • Pista Atual
            </span>
            <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-snug">
              {activeClue.clue}
            </p>
          </div>
        </div>
      )}

      {/* Crossword Grid Matrix */}
      <div className="bg-white border border-purple-300 rounded-3xl p-4 shadow-sm">
        <div
          className="grid gap-1 mx-auto max-w-[320px]"
          style={{ gridTemplateColumns: `repeat(${level.gridSize.cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: level.gridSize.rows }).map((_, r) =>
            Array.from({ length: level.gridSize.cols }).map((__, c) => {
              const info = cellInfoMap.get(`${r}-${c}`);
              if (!info || !info.valid) {
                return (
                  <div
                    key={`${r}-${c}`}
                    className="aspect-square bg-slate-900/10 rounded-lg"
                  />
                );
              }

              const val = userGrid[r]?.[c] || '';

              return (
                <div key={`${r}-${c}`} className="relative aspect-square">
                  {info.numbers && Array.isArray(info.numbers) && info.numbers.length > 0 && (
                    <span className="absolute top-0.5 left-1 text-[8px] font-black text-slate-500 pointer-events-none select-none z-10">
                      {info.numbers.join('/')}
                    </span>
                  )}
                  <input
                    type="text"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleInputChange(r, c, e.target.value)}
                    className="w-full h-full text-center uppercase font-black text-sm bg-white border border-slate-300 rounded-xl focus:bg-purple-50 focus:border-purple-600 focus:outline-none shadow-2xs transition"
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Clues List Accordion / Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 shadow-xs">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
          Pistas da Cruzadinha:
        </span>

        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {level.clues.map((clue, idx) => {
            const solved = isClueSolved(clue);
            const isSelected = selectedClueIndex === idx;

            return (
              <button
                key={clue.number}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedClueIndex(idx);
                }}
                className={`w-full p-2 rounded-xl border text-left flex items-center justify-between text-xs transition ${
                  isSelected
                    ? 'bg-purple-100/70 border-purple-400 font-bold text-purple-900'
                    : solved
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-white border border-slate-300 flex items-center justify-center font-bold text-[10px]">
                    {clue.number}
                  </span>
                  <span className="text-[11px] truncate">
                    {clue.direction === 'across' ? '➡️' : '⬇️'} {clue.clue}
                  </span>
                </div>
                {solved && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="p-4 bg-purple-600 text-white rounded-2xl text-center space-y-2 shadow-lg animate-in zoom-in-95">
          <Trophy className="w-8 h-8 mx-auto text-amber-300 animate-bounce" />
          <h3 className="text-sm font-black">Cruzadinha Resolvida com Sucesso! 🎉</h3>
          <p className="text-xs text-purple-100">
            Você completou todas as palavras e faturou +50 Pontos!
          </p>
          {currentLevelIndex < levels.length - 1 && (
            <button
              onClick={handleNextLevel}
              className="mt-2 w-full py-2.5 bg-white text-purple-900 rounded-xl font-bold text-xs shadow-xs hover:bg-purple-50 transition active:scale-95 flex items-center justify-center gap-1.5"
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
