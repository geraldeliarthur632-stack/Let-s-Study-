import React, { useState } from 'react';
import { UserProfile, GradeLevel } from '../types';
import { GRADE_LABELS } from '../data/curriculumData';
import { soundEffects } from '../services/soundEffects';
import { X, Check, GraduationCap } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updated: Partial<UserProfile>) => void;
}

const AVATAR_OPTIONS = ['🎓', '🦁', '🚀', '⭐', '🦉', '⚡', '🦊', '👑', '🐉', '🎯', '🔥', '💎'];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [name, setName] = useState(user.name);
  const [grade, setGrade] = useState<GradeLevel>(user.grade);
  const [avatar, setAvatar] = useState(user.avatar);

  if (!isOpen) return null;

  const handleSave = () => {
    soundEffects.playClick();
    onSave({
      name: name.trim() || 'Estudante',
      grade,
      avatar,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-sm rounded-2xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">Editar Perfil</h3>
            <p className="text-xs text-zinc-400">Ajuste seu nome, série e avatar</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Avatar picker */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">Escolha seu Avatar</label>
            <div className="grid grid-cols-6 gap-2 p-2 bg-zinc-950/60 rounded-xl border border-zinc-800">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setAvatar(emoji);
                  }}
                  className={`h-10 text-xl rounded-lg flex items-center justify-center transition ${
                    avatar === emoji
                      ? 'bg-blue-600/30 border-2 border-blue-400 scale-105'
                      : 'hover:bg-zinc-800 border border-transparent'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">Seu Nome / Apelido</label>
            <input
              type="text"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Arthur, Maria..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-hidden focus:border-blue-500 text-sm"
            />
          </div>

          {/* Grade selection */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">Sua Série Escolar</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as GradeLevel)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-hidden focus:border-blue-500 text-xs font-medium"
            >
              {(Object.keys(GRADE_LABELS) as GradeLevel[]).map((g) => (
                <option key={g} value={g}>
                  {GRADE_LABELS[g].full} ({GRADE_LABELS[g].stage})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 font-medium text-xs transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Check className="w-4 h-4" />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};
