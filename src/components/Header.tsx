import React from 'react';
import { UserProfile } from '../types';
import { GRADE_LABELS } from '../data/curriculumData';
import { soundEffects } from '../services/soundEffects';
import { Pencil, Volume2, VolumeX, Headphones, Bell, Calendar, Mic } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  onEditProfile: () => void;
  onOpenIntroAudio: () => void;
  onOpenReminders?: () => void;
  onOpenCalendar?: () => void;
  onOpenPermissions?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onEditProfile,
  onOpenIntroAudio,
  onOpenReminders,
  onOpenCalendar,
  onOpenPermissions,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        {/* Left Side: Avatar, Name, Grade & Pencil Edit Button */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/30 flex items-center justify-center text-lg shrink-0 shadow-xs text-white">
            {user.avatar || '🎓'}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800 text-sm truncate max-w-[110px] sm:max-w-[140px]">
                {user.name || 'Estudante'}
              </span>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onEditProfile();
                }}
                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition"
                title="Editar Nome e Série"
                aria-label="Editar Perfil"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-blue-600 font-semibold block truncate">
                {GRADE_LABELS[user.grade]?.short || '6º Ano'}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Let's Study
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Calendar, Reminders, Audio Guide & Sound Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Permissions / Mic & Push Button */}
          {onOpenPermissions && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenPermissions();
              }}
              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-700 transition active:scale-95 shadow-xs"
              title="Permissões de Voz e Notificações"
              aria-label="Permissões"
            >
              <Mic className="w-4 h-4 text-emerald-600" />
            </button>
          )}

          {/* Calendar & Provas Button */}
          {onOpenCalendar && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenCalendar();
              }}
              className="p-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-amber-700 transition active:scale-95 shadow-xs"
              title="Calendário de Provas (Lembrar 1 dia antes às 12h)"
              aria-label="Calendário de Provas"
            >
              <Calendar className="w-4 h-4 text-amber-600" />
            </button>
          )}

          {/* Reminders Button */}
          {onOpenReminders && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenReminders();
              }}
              className="p-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-700 transition active:scale-95 shadow-xs"
              title="Lembretes & Cronograma de Estudos"
              aria-label="Lembretes"
            >
              <Bell className="w-4 h-4 text-blue-600" />
            </button>
          )}



          {/* Small Audio Guide Button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenIntroAudio();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-700 text-xs font-bold transition active:scale-95 shadow-xs"
            title="Ouvir explicação do aplicativo (28s)"
          >
            <Headphones className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] hidden sm:inline">Guia (28s)</span>
          </button>

          {/* Mute toggle button */}
          <button
            onClick={onToggleMute}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
            title={isMuted ? 'Ativar Sons' : 'Silenciar Sons'}
            aria-label="Som"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
