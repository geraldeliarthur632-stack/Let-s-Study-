import React, { useState, useEffect } from 'react';
import { DifficultyLevel, GradeLevel, StudyReminder, ExamEntry, UserProfile } from './types';
import { GRADE_LABELS } from './data/curriculumData';
import { soundEffects } from './services/soundEffects';
import { notificationService } from './services/notificationService';

// Components
import { PortraitContainer, DisplayMode } from './components/PortraitContainer';
import { Header } from './components/Header';
import { ProgressDashboard } from './components/ProgressDashboard';
import { OnboardingModal } from './components/OnboardingModal';
import { IntroNarratorModal } from './components/IntroNarratorModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { StudyRemindersModal } from './components/StudyRemindersModal';
import { CalendarModal } from './components/CalendarModal';
import { PermissionsOnboardingModal } from './components/PermissionsOnboardingModal';

// Modes
import { JourneyMode } from './components/modes/JourneyMode';
import { AITutorChatMode } from './components/modes/AITutorChatMode';
import { PassAndPlayMode } from './components/modes/PassAndPlayMode';
import { MultiplayerMode } from './components/modes/MultiplayerMode';
import { ChessMode } from './components/modes/ChessMode';
import { MathChallengeMode } from './components/modes/MathChallengeMode';
import { ChallengesHub } from './components/modes/ChallengesHub';
import { WordSearchGame } from './components/modes/WordSearchGame';
import { CrosswordGame } from './components/modes/CrosswordGame';
import { SlidingPuzzleGame } from './components/modes/SlidingPuzzleGame';
import { FlashcardsMode } from './components/modes/FlashcardsMode';
import { CarRacingGame } from './components/modes/CarRacingGame';

// Icons
import {
  BookOpen,
  Sparkles,
  Swords,
  ChevronRight,
  Bell,
  Clock,
  Calendar as CalendarIcon,
  X,
  Layers,
} from 'lucide-react';

const STORAGE_KEY = 'estudahud_user_profile_v3';

export function App() {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          totalPoints: typeof parsed.totalPoints === 'number' ? parsed.totalPoints : 0,
          completedChallenges: typeof parsed.completedChallenges === 'number' ? parsed.completedChallenges : 0,
        };
      }
    } catch {}
    return {
      name: '',
      grade: '6_fund',
      avatar: '🎓',
      isFirstTime: true,
      totalPoints: 0,
      completedChallenges: 0,
    };
  });

  const [currentMode, setCurrentMode] = useState<
    | 'home'
    | 'journey'
    | 'custom'
    | 'flashcards'
    | 'challenges'
    | 'chess'
    | 'math'
    | 'competition'
    | 'multiplayer'
    | 'wordsearch'
    | 'crossword'
    | 'puzzle'
    | 'car_racing'
  >('home');

  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');

  // Modals state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [activeReminderToast, setActiveReminderToast] = useState<StudyReminder | null>(null);
  const [activeExamToast, setActiveExamToast] = useState<{ exam: ExamEntry; type: 'day_before' | 'day_of' } | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Responsive device view mode (phone / tablet / desktop)
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    try {
      const saved = localStorage.getItem('estudahud_display_mode');
      if (saved === 'tablet' || saved === 'desktop' || saved === 'phone') return saved;
    } catch {}
    return 'phone';
  });

  // Check permissions on start and show explanation with AI voice if missing
  useEffect(() => {
    const checkPermissions = async () => {
      let needsNotif = true;
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          needsNotif = false;
        }
      }

      let needsMic = true;
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const micQuery = await navigator.permissions.query({ name: 'microphone' as any });
          if (micQuery.state === 'granted') {
            needsMic = false;
          }
        } catch {}
      }

      // If permissions are not granted and not already in initial first-time onboarding
      if (needsNotif || needsMic) {
        const timer = setTimeout(() => {
          setIsPermissionsModalOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    };

    checkPermissions();
  }, []);

  // Subscribe to live notification reminders & exams
  useEffect(() => {
    const unsubscribeReminders = notificationService.subscribe((reminder) => {
      setActiveReminderToast(reminder);
    });

    const unsubscribeExams = notificationService.subscribeToExamReminders((exam, type) => {
      setActiveExamToast({ exam, type });
    });

    return () => {
      unsubscribeReminders();
      unsubscribeExams();
    };
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (user.name) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch {}
    }
  }, [user]);

  // First time onboarding prompt
  useEffect(() => {
    if (!user.name || user.isFirstTime) {
      setIsOnboardingOpen(true);
    }
  }, [user.name, user.isFirstTime]);

  const handleOnboardingComplete = (profile: { name: string; grade: GradeLevel; avatar: string }) => {
    setUser((prev) => ({
      ...prev,
      name: profile.name,
      grade: profile.grade,
      avatar: profile.avatar,
      isFirstTime: false,
    }));
    setIsOnboardingOpen(false);
    // Immediately open the 28s Audio guide on first onboarding completion
    setIsIntroOpen(true);
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const handleEarnPoints = (points: number, isChallengeCompleted: boolean = false) => {
    setUser((prev) => ({
      ...prev,
      totalPoints: (prev.totalPoints || 0) + points,
      completedChallenges: (prev.completedChallenges || 0) + (isChallengeCompleted ? 1 : 0),
    }));
  };

  const toggleMute = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
  };

  return (
    <PortraitContainer
      displayMode={displayMode}
      onToggleDisplayMode={(mode) => {
        setDisplayMode(mode);
        try {
          localStorage.setItem('estudahud_display_mode', mode);
        } catch {}
      }}
    >
      {/* Active In-App Reminder Toast Banner */}
      {activeReminderToast && (
        <div className="fixed top-3 left-4 right-4 max-w-sm mx-auto z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-blue-500/50 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-base shrink-0 animate-bounce shadow-xs">
                ⏰
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-[10px] text-blue-300 block uppercase tracking-wider">
                  Lembrete de Estudo
                </span>
                <h4 className="font-extrabold text-xs text-white truncate">
                  {activeReminderToast.subjectName} ({activeReminderToast.time})
                </h4>
                <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                  {activeReminderToast.notes || 'Hora de praticar 10 exercícios da sua série!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveReminderToast(null);
                  setCurrentMode('journey');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-[11px] transition shadow-xs active:scale-95"
              >
                Estudar
              </button>
              <button
                onClick={() => setActiveReminderToast(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active In-App Exam Reminder Toast Banner */}
      {activeExamToast && (
        <div className="fixed top-3 left-4 right-4 max-w-sm mx-auto z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-amber-500/60 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-base shrink-0 animate-bounce shadow-xs">
                📝
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-[10px] text-amber-300 block uppercase tracking-wider">
                  {activeExamToast.type === 'day_before' ? '⚠️ Lembrete: Prova Amanhã!' : '🎯 Hoje é Dia de Prova!'}
                </span>
                <h4 className="font-extrabold text-xs text-white truncate">
                  {activeExamToast.exam.subjectName} ({activeExamToast.exam.title})
                </h4>
                <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                  {activeExamToast.type === 'day_before'
                    ? "Lembrete das 12:00: Hora de fazer sua revisão no Let's Study!"
                    : `Horário: ${activeExamToast.exam.time || '08:00'} • Boa sorte!`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveExamToast(null);
                  setCurrentMode('journey');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition shadow-xs active:scale-95"
              >
                Revisar
              </button>
              <button
                onClick={() => setActiveExamToast(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Mobile Header */}
      <Header
        user={user}
        onEditProfile={() => setIsProfileEditOpen(true)}
        onOpenIntroAudio={() => setIsIntroOpen(true)}
        onOpenReminders={() => setIsRemindersOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenPermissions={() => setIsPermissionsModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />

      {/* Main Screen Views */}
      <main className="flex-1 flex flex-col bg-slate-50 text-slate-900">
        {currentMode === 'home' && (
          <div className="flex-1 flex flex-col p-4 justify-between space-y-3.5">
            <div className="space-y-3">
              {/* Welcome Badge & Subtitle */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-base font-extrabold text-slate-900">
                    Olá, {user.name || 'Estudante'}!
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium">
                    O que vamos praticar e aprender hoje?
                  </p>
                </div>
                <div className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-xs font-bold shadow-xs">
                  {GRADE_LABELS[user.grade]?.short || '6º Ano'}
                </div>
              </div>

              {/* COMPONENTE: DASHBOARD DE PROGRESSO & DICA DO DIA COM IA */}
              <ProgressDashboard
                totalPoints={user.totalPoints || 0}
                completedChallenges={user.completedChallenges || 0}
                userGrade={user.grade}
                userName={user.name}
              />

              {/* CRONOGRAMA & PROVAS DUAL BUTTONS */}
              <div className="grid grid-cols-2 gap-2">
                {/* CALENDÁRIO DE PROVAS */}
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setIsCalendarOpen(true);
                  }}
                  className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 hover:border-amber-300 rounded-2xl flex flex-col justify-between text-left transition shadow-xs group active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base group-hover:scale-105 transition shadow-xs">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                      1 dia antes 12h
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      Anotar Provas 📅
                    </span>
                    <p className="text-[10px] text-slate-600 line-clamp-1 mt-0.5">
                      Calendário com alertas e revisão
                    </p>
                  </div>
                </button>

                {/* LEMBRETES DE ROTINA */}
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setIsRemindersOpen(true);
                  }}
                  className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 rounded-2xl flex flex-col justify-between text-left transition shadow-xs group active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base group-hover:scale-105 transition shadow-xs">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-200 text-blue-800">
                      Push + Voz IA
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      Horários de Estudo ⏰
                    </span>
                    <p className="text-[10px] text-slate-600 line-clamp-1 mt-0.5">
                      Alarmes por matéria
                    </p>
                  </div>
                </button>
              </div>

              {/* 1º BOTÃO: CONTINUAR JORNADA */}
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setCurrentMode('journey');
                }}
                className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 rounded-2xl flex items-center justify-between text-left transition shadow-xs group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition shadow-xs shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm font-extrabold text-slate-900">
                        Continuar Jornada
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-200 text-blue-800">
                        {GRADE_LABELS[user.grade]?.short || '6º Ano'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">
                      Explicação com IA falando + 10 exercícios da sua série
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition shrink-0" />
              </button>

              {/* 2º BOTÃO: TUTOR IA & FOTO-EXPLICA */}
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setCurrentMode('custom');
                }}
                className="w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 hover:border-purple-300 rounded-2xl flex items-center justify-between text-left transition shadow-xs group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center group-hover:scale-105 transition shadow-xs shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm font-extrabold text-slate-900">
                        Tutor IA & Foto-Explica
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-200 text-purple-800">
                        Chat com IA 📸
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">
                      Tire foto da matéria ou do dever de casa para a IA explicar passo a passo!
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition shrink-0" />
              </button>

              {/* 3º BOTÃO: FLASHCARDS DE REVISÃO */}
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setCurrentMode('flashcards');
                }}
                className="w-full p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 hover:from-emerald-100 hover:to-cyan-100 border border-emerald-200 hover:border-emerald-300 rounded-2xl flex items-center justify-between text-left transition shadow-xs group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition shadow-xs shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm font-extrabold text-slate-900">
                        Flashcards de Revisão
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-800">
                        Novo • Com Voz
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">
                      Cartões rápidos de pergunta e resposta para memorização ativa
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition shrink-0" />
              </button>

              {/* 4º BOTÃO: CENTRAL DE DESAFIOS */}
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setCurrentMode('challenges');
                }}
                className="w-full p-4 bg-gradient-to-r from-amber-50 to-rose-50 hover:from-amber-100 hover:to-rose-100 border border-amber-200 hover:border-amber-300 rounded-2xl flex items-center justify-between text-left transition shadow-xs group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center group-hover:scale-105 transition shadow-xs shrink-0">
                    <Swords className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm font-extrabold text-slate-900">
                        Central de Desafios
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                        {selectedDifficulty === 'easy' ? 'Fácil' : selectedDifficulty === 'hard' ? 'Difícil' : 'Médio'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">
                      Desafios de Xadrez, Matemática e Batalhas Escolares
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition shrink-0" />
              </button>

              {/* QUICK CHALLENGE SHORTCUTS */}
              <div className="pt-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                  Atalhos Rápidos de Desafios & Jogos
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {/* Word Search */}
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setCurrentMode('wordsearch');
                    }}
                    className="p-2.5 bg-white hover:bg-slate-50 border border-emerald-300 hover:border-emerald-400 rounded-2xl flex flex-col items-center justify-center text-center transition group active:scale-95 shadow-xs"
                  >
                    <span className="text-2xl mb-0.5 group-hover:scale-110 transition">🔍</span>
                    <span className="text-xs font-bold text-slate-900 block truncate">Caça-Palavras</span>
                    <span className="text-[9px] text-emerald-700 font-bold">5 Níveis • Salva</span>
                  </button>

                  {/* Crosswords */}
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setCurrentMode('crossword');
                    }}
                    className="p-2.5 bg-white hover:bg-slate-50 border border-purple-300 hover:border-purple-400 rounded-2xl flex flex-col items-center justify-center text-center transition group active:scale-95 shadow-xs"
                  >
                    <span className="text-2xl mb-0.5 group-hover:scale-110 transition">📝</span>
                    <span className="text-xs font-bold text-slate-900 block truncate">Cruzadinha</span>
                    <span className="text-[9px] text-purple-700 font-bold">5 Níveis • Salva</span>
                  </button>

                  {/* Sliding Puzzle */}
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setCurrentMode('puzzle');
                    }}
                    className="p-2.5 bg-white hover:bg-slate-50 border border-cyan-300 hover:border-cyan-400 rounded-2xl flex flex-col items-center justify-center text-center transition group active:scale-95 shadow-xs"
                  >
                    <span className="text-2xl mb-0.5 group-hover:scale-110 transition">🧩</span>
                    <span className="text-xs font-bold text-slate-900 block truncate">Quebra-Cabeça</span>
                    <span className="text-[9px] text-cyan-700 font-bold">3x3 e 4x4 • Salva</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. Journey Mode */}
        {currentMode === 'journey' && (
          <JourneyMode
            user={user}
            onBack={() => setCurrentMode('home')}
            onAnswerCorrect={() => handleEarnPoints(10)}
            onFinishLesson={(correctCount) => handleEarnPoints(correctCount * 10 + 20, true)}
            onSelectRecommendation={(_subjId, mode) => {
              if (mode === 'flashcards') {
                setCurrentMode('flashcards');
              } else {
                setCurrentMode('journey');
              }
            }}
          />
        )}

        {/* 2. Tutor IA & Foto-Explica (Chat Educacional com IA) */}
        {currentMode === 'custom' && (
          <AITutorChatMode
            user={user}
            onBack={() => setCurrentMode('home')}
            onEarnPoints={(pts) => handleEarnPoints(pts)}
          />
        )}

        {/* 3. Flashcards Mode */}
        {currentMode === 'flashcards' && (
          <FlashcardsMode
            user={user}
            onBack={() => setCurrentMode('home')}
            onEarnPoints={handleEarnPoints}
          />
        )}

        {/* 4. Challenges Hub */}
        {currentMode === 'challenges' && (
          <ChallengesHub
            user={user}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            onBack={() => setCurrentMode('home')}
            onSelectChallenge={(mode) => setCurrentMode(mode)}
          />
        )}

        {/* 4. Chess Mode (Normal & Multiplayer) */}
        {currentMode === 'chess' && (
          <ChessMode
            user={user}
            difficulty={selectedDifficulty}
            onBack={() => setCurrentMode('challenges')}
            onEarnPoints={handleEarnPoints}
          />
        )}

        {/* 5. Math Challenge Mode (Normal & Multiplayer) */}
        {currentMode === 'math' && (
          <MathChallengeMode
            user={user}
            difficulty={selectedDifficulty}
            onBack={() => setCurrentMode('challenges')}
            onEarnPoints={handleEarnPoints}
          />
        )}

        {/* 6. Pass and Play Local Mode (1-5 Players) */}
        {currentMode === 'competition' && (
          <PassAndPlayMode
            user={user}
            onBack={() => setCurrentMode('challenges')}
            onAnswerCorrect={() => handleEarnPoints(10)}
            onMatchFinished={(winnerIsUser, correctCount) =>
              handleEarnPoints((winnerIsUser ? 50 : 20) + correctCount * 10, true)
            }
          />
        )}

        {/* 7. General Multiplayer Online Mode */}
        {currentMode === 'multiplayer' && (
          <MultiplayerMode
            user={user}
            onBack={() => setCurrentMode('challenges')}
            onAnswerCorrect={() => handleEarnPoints(10)}
            onMatchFinished={(winnerIsUser, correctCount) =>
              handleEarnPoints((winnerIsUser ? 60 : 25) + correctCount * 10, true)
            }
          />
        )}

        {/* 8. Caça-Palavras Educativo */}
        {currentMode === 'wordsearch' && (
          <WordSearchGame
            grade={user.grade}
            onBack={() => setCurrentMode('challenges')}
            onEarnPoints={handleEarnPoints}
          />
        )}

        {/* 9. Palavras Cruzadas */}
        {currentMode === 'crossword' && (
          <CrosswordGame
            grade={user.grade}
            onBack={() => setCurrentMode('challenges')}
            onEarnPoints={handleEarnPoints}
          />
        )}

        {/* 10. Quebra-Cabeça Deslizante */}
        {currentMode === 'puzzle' && (
          <SlidingPuzzleGame
            grade={user.grade}
            onBack={() => setCurrentMode('challenges')}
            onEarnPoints={handleEarnPoints}
          />
        )}

        {/* 11. Corrida de Carros 2D */}
        {currentMode === 'car_racing' && (
          <CarRacingGame
            user={user}
            onBack={() => setCurrentMode('challenges')}
            onEarnPoints={handleEarnPoints}
            selectedDifficulty={selectedDifficulty}
          />
        )}
      </main>

      {/* MODALS */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
      />

      <IntroNarratorModal
        isOpen={isIntroOpen}
        onComplete={() => setIsIntroOpen(false)}
      />

      <ProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        user={user}
        onSave={handleUpdateProfile}
      />

      <StudyRemindersModal
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        onSelectSubjectToStudy={() => setCurrentMode('journey')}
        userGrade={user.grade}
      />

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onSelectSubjectToStudy={() => setCurrentMode('journey')}
        userGrade={user.grade}
      />

      <PermissionsOnboardingModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
      />


    </PortraitContainer>
  );
}

export default App;

