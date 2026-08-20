import React, { useState } from 'react';
import { GradeLevel, UserProfile } from '../types';
import { GRADE_LABELS } from '../data/curriculumData';
import { soundEffects } from '../services/soundEffects';
import { Sparkles, ArrowRight, GraduationCap } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: { name: string; grade: GradeLevel; avatar: string }) => void;
}

const AVATARS = ['🎓', '🦁', '🚀', '⭐', '🦉', '⚡', '🦊', '👑', '💎', '🔥'];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('6_fund');
  const [avatar, setAvatar] = useState('🎓');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, digite seu nome ou apelido.');
      soundEffects.playError();
      return;
    }
    soundEffects.playClick();
    onComplete({
      name: name.trim(),
      grade,
      avatar,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
        {/* Header decoration */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-3xl shadow-lg mb-3">
            {avatar}
          </div>
          <h2 className="text-xl font-extrabold text-zinc-100">Bem-vindo ao Let's Study!</h2>
          <p className="text-xs text-zinc-400 mt-1">Configure seu perfil de estudos para começar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Avatar selector */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">Escolha seu avatar</label>
            <div className="grid grid-cols-5 gap-1.5 p-2 bg-zinc-950/70 rounded-xl border border-zinc-800">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setAvatar(emoji);
                  }}
                  className={`h-9 text-lg rounded-lg flex items-center justify-center transition ${
                    avatar === emoji
                      ? 'bg-blue-600/40 border-2 border-blue-400 scale-105'
                      : 'hover:bg-zinc-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">Qual é o seu nome ou apelido?</label>
            <input
              type="text"
              value={name}
              maxLength={20}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Digite seu nome..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-3 text-zinc-100 focus:outline-hidden focus:border-blue-500 text-sm font-medium"
              autoFocus
            />
            {error && <p className="text-rose-400 text-[11px] mt-1 font-medium">{error}</p>}
          </div>

          {/* Grade */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Qual série você estuda?</span>
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as GradeLevel)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-3 text-zinc-100 focus:outline-hidden focus:border-blue-500 text-xs font-semibold"
            >
              {(Object.keys(GRADE_LABELS) as GradeLevel[]).map((g) => (
                <option key={g} value={g}>
                  {GRADE_LABELS[g].full} ({GRADE_LABELS[g].stage})
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
          >
            <span>Iniciar Aventura</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
