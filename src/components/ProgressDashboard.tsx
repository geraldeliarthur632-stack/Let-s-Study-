import React, { useState, useEffect, useRef } from 'react';
import { Zap, CheckCircle2, Award, Sparkles, RefreshCw, Volume2, VolumeX, Target, Flame } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';
import { speechNarrator } from '../services/speechNarrator';
import { GradeLevel } from '../types';

interface ProgressDashboardProps {
  totalPoints: number;
  completedChallenges: number;
  userGrade?: GradeLevel;
  userName?: string;
  dailyGoalCount?: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  nextTitle: string;
  currentPointsInLevel: number;
  pointsNeededForNextLevel: number;
  progressPercent: number;
}

interface DailyTipData {
  tip: string;
  category: 'dica_estudo' | 'fato_rapido' | 'motivacao' | 'tecnica_memorizacao';
  topic: string;
  icon: string;
  dateKey?: string;
}

export function calculateAcademicLevel(totalPoints: number): LevelInfo {
  const levels = [
    { level: 1, title: 'Aspirante', threshold: 0 },
    { level: 2, title: 'Aprendiz', threshold: 100 },
    { level: 3, title: 'Explorador', threshold: 250 },
    { level: 4, title: 'Pesquisador', threshold: 450 },
    { level: 5, title: 'Estudioso', threshold: 700 },
    { level: 6, title: 'Mestre do Saber', threshold: 1000 },
    { level: 7, title: 'Sábio Acadêmico', threshold: 1400 },
    { level: 8, title: 'Doutor do Conhecimento', threshold: 1900 },
  ];

  let currentLevelIdx = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalPoints >= levels[i].threshold) {
      currentLevelIdx = i;
      break;
    }
  }

  const currentLevel = levels[currentLevelIdx];
  const nextLevel = levels[currentLevelIdx + 1] || {
    level: currentLevel.level + 1,
    title: 'Especialista Máximo',
    threshold: currentLevel.threshold + 500,
  };

  const levelSpan = nextLevel.threshold - currentLevel.threshold;
  const currentPointsInLevel = Math.max(0, totalPoints - currentLevel.threshold);
  const progressPercent = Math.min(100, Math.round((currentPointsInLevel / levelSpan) * 100));
  const pointsNeededForNextLevel = Math.max(0, nextLevel.threshold - totalPoints);

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    nextTitle: nextLevel.title,
    currentPointsInLevel,
    pointsNeededForNextLevel,
    progressPercent,
  };
}

const DEFAULT_TIP: DailyTipData = {
  tip: 'Revisar a matéria 24 horas após o primeiro estudo aumenta a fixação da memória a longo prazo em mais de 70%!',
  category: 'tecnica_memorizacao',
  topic: 'Curva de Esquecimento',
  icon: '🧠',
};

const CATEGORY_LABELS: Record<string, { label: string; badgeClass: string }> = {
  dica_estudo: { label: 'Dica de Estudo', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  fato_rapido: { label: 'Fato Rápido', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  motivacao: { label: 'Motivação', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' },
  tecnica_memorizacao: { label: 'Memorização', badgeClass: 'bg-purple-100 text-purple-800 border-purple-200' },
};

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  totalPoints = 0,
  completedChallenges = 0,
  userGrade = '6_fund',
  userName = 'Estudante',
  dailyGoalCount = 3,
}) => {
  const levelInfo = calculateAcademicLevel(totalPoints);

  // Daily challenges goal calculation
  const remainingChallenges = Math.max(0, dailyGoalCount - completedChallenges);
  const isGoalCompleted = remainingChallenges === 0;

  // Track previous level and previous completed challenges to trigger level-up sound
  const prevLevelRef = useRef<number>(levelInfo.level);
  const prevCompletedGoalRef = useRef<boolean>(isGoalCompleted);
  const isInitialMount = useRef<boolean>(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevLevelRef.current = levelInfo.level;
      prevCompletedGoalRef.current = isGoalCompleted;
      return;
    }

    // Check if level increased
    if (levelInfo.level > prevLevelRef.current) {
      soundEffects.playLevelUp();
      prevLevelRef.current = levelInfo.level;
    }

    // Check if daily goal was just completed
    if (isGoalCompleted && !prevCompletedGoalRef.current) {
      soundEffects.playLevelUp();
      prevCompletedGoalRef.current = true;
    }
  }, [levelInfo.level, isGoalCompleted]);

  // Daily Tip State
  const [dailyTip, setDailyTip] = useState<DailyTipData>(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const cached = localStorage.getItem('estudahud_daily_tip');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.dateKey === todayStr && parsed.tip) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_TIP;
  });

  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [isSpeakingTip, setIsSpeakingTip] = useState(false);

  const fetchDailyTip = async (forceRefresh = false) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (!forceRefresh) {
      const cached = localStorage.getItem('estudahud_daily_tip');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.dateKey === todayStr && parsed.tip) {
            setDailyTip(parsed);
            return;
          }
        } catch {}
      }
    }

    setIsLoadingTip(true);
    try {
      const res = await fetch('/api/ai/daily-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: userGrade, userName }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.tip) {
          const tipObj: DailyTipData = {
            tip: data.tip,
            category: data.category || 'dica_estudo',
            topic: data.topic || 'Dica Diária',
            icon: data.icon || '💡',
            dateKey: todayStr,
          };
          setDailyTip(tipObj);
          try {
            localStorage.setItem('estudahud_daily_tip', JSON.stringify(tipObj));
          } catch {}
        }
      }
    } catch {
      // Fallback stays as current or default
    } finally {
      setIsLoadingTip(false);
    }
  };

  useEffect(() => {
    fetchDailyTip(false);
  }, [userGrade, userName]);

  const handleToggleSpeakTip = () => {
    soundEffects.playClick();
    if (isSpeakingTip) {
      speechNarrator.stop();
      setIsSpeakingTip(false);
    } else {
      setIsSpeakingTip(true);
      speechNarrator.speak(
        `${dailyTip.topic}: ${dailyTip.tip}`,
        () => setIsSpeakingTip(true),
        () => setIsSpeakingTip(false)
      );
    }
  };

  const handleRefreshTip = () => {
    soundEffects.playClick();
    if (isSpeakingTip) {
      speechNarrator.stop();
      setIsSpeakingTip(false);
    }
    fetchDailyTip(true);
  };

  const catMeta = CATEGORY_LABELS[dailyTip.category] || CATEGORY_LABELS.dica_estudo;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-3">
      {/* Top Header: Academic Level Badge, Title & Meta Diária Countdown Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-black text-xs shadow-xs shrink-0">
            N{levelInfo.level}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide truncate">
                {levelInfo.title}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold shrink-0">• Nível {levelInfo.level}</span>
            </div>
            <span className="text-[11px] text-slate-500 block truncate">
              Próximo: <strong className="text-blue-600 font-bold">{levelInfo.nextTitle}</strong>
            </span>
          </div>
        </div>

        {/* Meta Diária IA Countdown Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold shrink-0 transition shadow-2xs ${
            isGoalCompleted
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
          title={
            isGoalCompleted
              ? 'Parabéns! Você concluiu a meta diária de 3 desafios sugerida pela IA hoje!'
              : `Faltam ${remainingChallenges} ${remainingChallenges === 1 ? 'desafio' : 'desafios'} para bater sua meta diária de hoje`
          }
        >
          {isGoalCompleted ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Meta Concluída! 🎉</span>
            </>
          ) : (
            <>
              <Target className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>
                Faltam <strong className="font-black text-rose-700">{remainingChallenges}</strong> {remainingChallenges === 1 ? 'desafio' : 'desafios'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar towards Next Level */}
      <div className="space-y-1">
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 rounded-full shadow-xs"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span>{levelInfo.currentPointsInLevel} pts neste nível</span>
          <span>Faltam {levelInfo.pointsNeededForNextLevel} pts</span>
        </div>
      </div>

      {/* Stats Counter: Points & Challenges Completed */}
      <div className="grid grid-cols-2 gap-2">
        {/* Total Points */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-amber-50/70 border border-amber-200">
          <div className="w-7 h-7 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-700" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 font-medium block truncate">Pontos Totais</span>
            <span className="text-xs font-black text-amber-700 font-mono block truncate">
              {totalPoints.toLocaleString('pt-BR')} pts
            </span>
          </div>
        </div>

        {/* Challenges Completed */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <div className="w-7 h-7 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 font-medium block truncate">Desafios Concluídos</span>
            <span className="text-xs font-black text-emerald-700 font-mono block truncate">
              {completedChallenges} {completedChallenges === 1 ? 'desafio' : 'desafios'}
            </span>
          </div>
        </div>
      </div>

      {/* DICA DO DIA COM IA (GEMINI) */}
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-slate-50 border border-blue-200 relative overflow-hidden shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm shrink-0">{dailyTip.icon || '💡'}</span>
            <span className="text-[11px] font-bold text-slate-800 truncate">
              {dailyTip.topic || 'Dica do Dia'}
            </span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border shrink-0 ${catMeta.badgeClass}`}
            >
              {catMeta.label}
            </span>
          </div>

          {/* Action buttons: Listen & Regenerate with Gemini */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleToggleSpeakTip}
              title={isSpeakingTip ? 'Pausar áudio' : 'Ouvir dica em áudio'}
              aria-label={isSpeakingTip ? 'Pausar áudio da dica' : 'Ouvir dica da IA em áudio'}
              className={`p-1 rounded-lg transition ${
                isSpeakingTip
                  ? 'bg-blue-600 text-white animate-pulse'
                  : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {isSpeakingTip ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleRefreshTip}
              disabled={isLoadingTip}
              title="Gerar nova dica com IA"
              aria-label="Gerar nova dica com IA Gemini"
              className="p-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-purple-700 border border-slate-200 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTip ? 'animate-spin text-purple-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tip Text */}
        <div className="text-[11px] text-slate-700 leading-relaxed pl-1 border-l-2 border-blue-500 font-normal">
          {isLoadingTip ? (
            <div className="flex items-center gap-2 text-slate-500 py-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-spin" />
              <span>Consultando IA para uma nova dica...</span>
            </div>
          ) : (
            <p>"{dailyTip.tip}"</p>
          )}
        </div>
      </div>
    </div>
  );
};
