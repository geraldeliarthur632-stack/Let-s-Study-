import React from 'react';
import { GradeLevel } from '../types';
import { GRADE_LABELS } from '../data/curriculumData';
import { soundEffects } from '../services/soundEffects';
import {
  Trophy,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Star,
} from 'lucide-react';

interface GradePromotionModalProps {
  isOpen: boolean;
  previousGrade: GradeLevel;
  nextGrade: GradeLevel;
  onAdvance: () => void;
}

export const GradePromotionModal: React.FC<GradePromotionModalProps> = ({
  isOpen,
  previousGrade,
  nextGrade,
  onAdvance,
}) => {
  if (!isOpen) return null;

  const prevLabel = GRADE_LABELS[previousGrade]?.label || 'Série Anterior';
  const nextLabel = GRADE_LABELS[nextGrade]?.label || 'Próxima Série';
  const nextShort = GRADE_LABELS[nextGrade]?.short || 'Nova Série';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-2 border-amber-500/50 rounded-3xl max-w-sm w-full p-6 text-white text-center space-y-4 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
        {/* Glow Effects */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />

        {/* Celebration Header */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-4xl mx-auto shadow-lg shadow-amber-500/30 animate-bounce">
            🎓
          </div>
          <span className="absolute -top-1 right-1/4 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-amber-500 text-xs font-black text-slate-900 items-center justify-center">
              ⭐
            </span>
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            Ano Escolar Concluído! 🎉
          </span>
          <h2 className="text-lg font-black text-white">Parabéns pela Formatura!</h2>
          <p className="text-xs text-slate-300">
            Você completou com sucesso todos os conteúdos de <strong>{prevLabel}</strong>!
          </p>
        </div>

        {/* PROMOTION CARD */}
        <div className="bg-slate-950/80 border border-indigo-500/40 rounded-2xl p-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Promovido para:</span>
            <span className="px-2 py-0.5 rounded-lg bg-indigo-500/30 text-indigo-300 font-extrabold text-xs border border-indigo-500/40">
              {nextShort}
            </span>
          </div>

          <h3 className="text-sm font-extrabold text-white">{nextLabel}</h3>

          <div className="space-y-1.5 text-[11px] text-slate-300 pt-1 border-t border-slate-800">
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">1.</span>
              <p>
                <strong>Fundamentos Fáceis e Básicos:</strong> Comece com revisões simples para ganhar confiança.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">2.</span>
              <p>
                <strong>Explicações Aprofundadas da IA:</strong> Conceitos detalhados com áudio e texto antes dos exercícios!
              </p>
            </div>
          </div>
        </div>

        {/* Bonus Reward */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-300 font-bold">
          <span>Recompensa de Avanço:</span>
          <span className="text-amber-400 font-black">+200 Pontos Extras! 🎁</span>
        </div>

        {/* Button */}
        <button
          onClick={() => {
            soundEffects.playCorrect();
            onAdvance();
          }}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
        >
          <span>Avançar para o {nextShort} e Aprender!</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
