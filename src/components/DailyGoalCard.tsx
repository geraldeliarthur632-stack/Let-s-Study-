import React, { useState, useEffect } from 'react';
import { studyGoalService, DailyGoalData } from '../services/studyGoalService';
import { soundEffects } from '../services/soundEffects';
import {
  Target,
  Clock,
  Flame,
  Gift,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';

interface DailyGoalCardProps {
  onBonusClaimed: (points: number) => void;
}

export const DailyGoalCard: React.FC<DailyGoalCardProps> = ({ onBonusClaimed }) => {
  const [goalData, setGoalData] = useState<DailyGoalData>(() => studyGoalService.getData());
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(goalData.targetMinutes);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const update = () => {
      setGoalData(studyGoalService.getData());
    };
    update();
    const interval = setInterval(update, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalMinutesStudied = Math.floor(goalData.todaySeconds / 60);
  const targetMinutes = goalData.targetMinutes || 15;
  const progressPercent = Math.min(100, Math.round((goalData.todaySeconds / (targetMinutes * 60)) * 100));
  const isGoalReached = progressPercent >= 100;
  const todayStr = new Date().toISOString().split('T')[0];
  const isBonusClaimed = goalData.claimedBonusDate === todayStr;

  const handleClaimBonus = () => {
    soundEffects.playCorrect();
    const result = studyGoalService.claimBonus();
    if (result.success) {
      setGoalData(result.data);
      onBonusClaimed(result.points);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4500);
    }
  };

  const handleSaveGoal = (minutes: number) => {
    soundEffects.playClick();
    const updated = studyGoalService.setTargetMinutes(minutes);
    setGoalData(updated);
    setIsConfigModalOpen(false);
  };

  const presetMinutes = [5, 10, 15, 20, 30, 45, 60];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-4 shadow-sm text-white space-y-3">
      {/* Background ambient decoration */}
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* HEADER ROW */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xs font-black">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black tracking-tight text-white">Meta Diária de Estudo</h3>
              {goalData.streakDays > 0 && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[9px] font-extrabold animate-pulse">
                  <Flame className="w-2.5 h-2.5 fill-orange-400" />
                  {goalData.streakDays} {goalData.streakDays === 1 ? 'dia' : 'dias'}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              Estude no seu ritmo e ganhe pontos extras diários
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundEffects.playClick();
            setSelectedMinutes(goalData.targetMinutes);
            setIsConfigModalOpen(true);
          }}
          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition text-[10px] flex items-center gap-1"
          title="Ajustar tempo da meta"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold">{targetMinutes} min</span>
        </button>
      </div>

      {/* PROGRESS BAR & STATS */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-300 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-400" />
            Hoje: <b className="text-white">{totalMinutesStudied}</b> de <b>{targetMinutes} min</b>
          </span>
          <span className="font-extrabold text-indigo-300 font-mono">
            {progressPercent}%
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isGoalReached
                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm shadow-emerald-500/50'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* CALL TO ACTION / CLAIM BONUS */}
      {isGoalReached ? (
        !isBonusClaimed ? (
          <button
            onClick={handleClaimBonus}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 active:scale-[0.99] text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition animate-bounce"
          >
            <Gift className="w-4 h-4 text-white animate-pulse" />
            <span>Resgatar Bônus: +100 Pontos Extras! 🎁</span>
          </button>
        ) : (
          <div className="py-2 px-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold">Meta de hoje atingida! (+100 pts coletados)</span>
            </div>
            <span className="text-[10px] text-emerald-400/80 font-bold">Parabéns! 🌟</span>
          </div>
        )
      ) : (
        <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800/60">
          <span>Faltam apenas {Math.max(1, targetMinutes - totalMinutesStudied)} minutos de estudo</span>
          <span className="text-amber-400 font-bold">Bônus: +100 pts</span>
        </div>
      )}

      {/* CELEBRATION POPUP TOAST */}
      {showCelebration && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center rounded-3xl z-20 animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500 text-amber-400 flex items-center justify-center text-2xl mb-2 animate-bounce">
            🏆
          </div>
          <h4 className="text-sm font-black text-white">Meta Diária Conquistada!</h4>
          <p className="text-xs text-amber-300 font-bold mt-0.5">+100 Pontos adicionados ao seu perfil!</p>
          <p className="text-[10px] text-slate-400 mt-1">Você está cada dia mais focado nos seus estudos!</p>
        </div>
      )}

      {/* GOAL CONFIGURATION MODAL */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold">Definir Meta Diária</h3>
                  <p className="text-[10px] text-slate-400">Quantos minutos você deseja estudar por dia?</p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {presetMinutes.map((min) => (
                <button
                  key={min}
                  onClick={() => setSelectedMinutes(min)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                    selectedMinutes === min
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-xs'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                >
                  {min} min
                </button>
              ))}
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-[11px] text-slate-300 space-y-1">
              <span className="font-bold text-indigo-300 block">💡 Dica Pedagógica:</span>
              <p className="text-slate-400 leading-relaxed">
                Metas de 15 a 30 minutos diários são ideais para reter o aprendizado sem cansar.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveGoal(selectedMinutes)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition shadow-xs"
              >
                Salvar Meta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
