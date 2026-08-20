import React, { useState, useEffect, useRef } from 'react';
import { DifficultyLevel, GradeLevel, MultiplayerRoom, Question, UserProfile } from '../../types';
import { GRADE_LABELS, getQuestionsForMatch, getTiebreakerQuestions } from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { VictoryCelebration } from '../VictoryCelebration';
import { VoiceAnswerController } from '../VoiceAnswerController';
import {
  ArrowLeft,
  Calculator,
  Globe2,
  Users,
  Play,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Loader2,
  ShieldAlert,
  ChevronRight,
  Zap,
  Timer,
  Crown,
} from 'lucide-react';

interface MathChallengeModeProps {
  user: UserProfile;
  onBack: () => void;
  difficulty?: DifficultyLevel;
  onEarnPoints?: (points: number, isChallengeCompleted?: boolean) => void;
}

export const MathChallengeMode: React.FC<MathChallengeModeProps> = ({
  user,
  onBack,
  difficulty = 'medium',
  onEarnPoints,
}) => {
  const [subMode, setSubMode] = useState<'menu' | 'solo' | 'multiplayer'>('menu');

  const pointsPerCorrect = difficulty === 'easy' ? 10 : difficulty === 'hard' ? 25 : 15;
  const initialTimer = difficulty === 'easy' ? 30 : difficulty === 'hard' ? 20 : 25;

  // --- SOLO STATE ---
  const [soloQuestions, setSoloQuestions] = useState<Question[]>([]);
  const [soloIndex, setSoloIndex] = useState(0);
  const [soloSelectedOption, setSoloSelectedOption] = useState<number | null>(null);
  const [soloSubmitted, setSoloSubmitted] = useState(false);
  const [soloScore, setSoloScore] = useState(0);
  const [soloStreak, setSoloStreak] = useState(0);
  const [soloTimer, setSoloTimer] = useState(initialTimer);
  const [isSoloFinished, setIsSoloFinished] = useState(false);
  const soloTimerRef = useRef<number | null>(null);

  // --- MULTIPLAYER STATE ---
  const [mpView, setMpView] = useState<'lobby' | 'waiting' | 'in_game' | 'tiebreaker' | 'finished'>('lobby');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [myPlayerId, setMyPlayerId] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mpCurrentIndex, setMpCurrentIndex] = useState(0);
  const [mpSelectedOption, setMpSelectedOption] = useState<number | null>(null);
  const [mpSubmitted, setMpSubmitted] = useState(false);
  const [mpTiebreakerIndex, setMpTiebreakerIndex] = useState(0);
  const pollIntervalRef = useRef<number | null>(null);

  // --- SOLO TIMER ---
  useEffect(() => {
    if (subMode === 'solo' && !soloSubmitted && !isSoloFinished && soloQuestions.length > 0) {
      soloTimerRef.current = window.setInterval(() => {
        setSoloTimer((prev) => {
          if (prev <= 1) {
            handleSoloSubmit(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (soloTimerRef.current) {
        clearInterval(soloTimerRef.current);
        soloTimerRef.current = null;
      }
    };
  }, [subMode, soloSubmitted, isSoloFinished, soloIndex, soloQuestions.length]);

  // --- MULTIPLAYER POLLING ---
  useEffect(() => {
    if (subMode === 'multiplayer' && room?.code && mpView !== 'lobby' && mpView !== 'finished') {
      pollIntervalRef.current = window.setInterval(async () => {
        try {
          const res = await fetch(`/api/rooms/${room.code}`);
          if (res.ok) {
            const data = await res.json();
            setRoom(data.room);

            if (data.room.status === 'in_progress' && mpView === 'waiting') {
              setMpView('in_game');
              setMpCurrentIndex(0);
              setMpSelectedOption(null);
              setMpSubmitted(false);
            } else if (data.room.status === 'tiebreaker' && mpView === 'in_game') {
              setMpView('tiebreaker');
              setMpSelectedOption(null);
              setMpSubmitted(false);
            } else if (data.room.status === 'finished') {
              setMpView('finished');
            }
          }
        } catch {}
      }, 1400);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [subMode, room?.code, mpView]);

  // Start Solo Math
  const startSoloMath = () => {
    soundEffects.playClick();
    const questions = getQuestionsForMatch(user.grade, 10, difficulty as DifficultyLevel, 'matematica');
    setSoloQuestions(questions);
    setSoloIndex(0);
    setSoloSelectedOption(null);
    setSoloSubmitted(false);
    setSoloScore(0);
    setSoloStreak(0);
    setSoloTimer(initialTimer);
    setIsSoloFinished(false);
    setSubMode('solo');
  };

  const handleSoloSubmit = (overrideOpt?: number | null) => {
    if (soloSubmitted) return;
    const choice = overrideOpt !== undefined ? overrideOpt : soloSelectedOption;
    const currentQ = soloQuestions[soloIndex];
    const isCorrect = choice === currentQ.correctIndex;

    setSoloSubmitted(true);
    if (isCorrect) {
      const nextStreak = soloStreak + 1;
      setSoloScore((s) => s + 1);
      setSoloStreak(nextStreak);
      
      // Play varied correct answer sound depending on streak
      if (nextStreak >= 3) {
        soundEffects.playCorrect('bonus');
      } else if (nextStreak === 2) {
        soundEffects.playCorrect('combo');
      } else {
        soundEffects.playCorrect('standard');
      }

      onEarnPoints?.(pointsPerCorrect);
    } else {
      soundEffects.playError();
      setSoloStreak(0);
    }
  };

  const handleSoloNext = () => {
    soundEffects.playClick();
    if (soloIndex + 1 < soloQuestions.length) {
      setSoloIndex((prev) => prev + 1);
      setSoloSelectedOption(null);
      setSoloSubmitted(false);
      setSoloTimer(initialTimer);
    } else {
      setIsSoloFinished(true);
      onEarnPoints?.(pointsPerCorrect * 3, true);
    }
  };

  // --- MULTIPLAYER ROOM CREATION & JOIN ---
  const handleCreateMpRoom = async () => {
    soundEffects.playClick();
    setIsLoading(true);
    setErrorMessage(null);

    const questions = getQuestionsForMatch(user.grade, 10, difficulty as DifficultyLevel, 'matematica');
    const tiebreakers = getTiebreakerQuestions(user.grade);

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: user.name || 'Matemático 1',
          hostGrade: user.grade,
          hostAvatar: user.avatar || '➗',
          grade: user.grade,
          gameType: 'math',
          questions,
          tiebreakerQuestions: tiebreakers,
        }),
      });

      if (!res.ok) throw new Error('Erro ao criar sala de matemática');

      const data = await res.json();
      setRoom(data.room);
      setMyPlayerId(data.playerId);
      setMpView('waiting');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMpRoom = async () => {
    if (!joinCodeInput.trim()) {
      setErrorMessage('Digite o código da sala (ex: MAT-1234).');
      soundEffects.playError();
      return;
    }

    soundEffects.playClick();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: joinCodeInput.trim().toUpperCase(),
          playerName: user.name || 'Desafiante',
          playerGrade: user.grade,
          playerAvatar: user.avatar || '➗',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao entrar na sala.');

      setRoom(data.room);
      setMyPlayerId(data.playerId);
      setMpView('waiting');
    } catch (err: any) {
      soundEffects.playError();
      setErrorMessage(err.message || 'Sala não encontrada.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMpMatch = async () => {
    if (!room) return;
    soundEffects.playClick();
    try {
      const res = await fetch(`/api/rooms/${room.code}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: myPlayerId }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
        setMpView('in_game');
        setMpCurrentIndex(0);
        setMpSelectedOption(null);
        setMpSubmitted(false);
      }
    } catch {}
  };

  const handleMpSubmitAnswer = async () => {
    if (mpSelectedOption === null || mpSubmitted || !room) return;
    const currentQ = room.questions[mpCurrentIndex];
    const isCorrect = mpSelectedOption === currentQ.correctIndex;

    setMpSubmitted(true);
    if (isCorrect) {
      soundEffects.playCorrect();
    } else {
      soundEffects.playError();
    }

    try {
      const res = await fetch(`/api/rooms/${room.code}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: myPlayerId,
          isCorrect,
          questionIndex: mpCurrentIndex,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
      }
    } catch {}
  };

  const handleMpNext = () => {
    soundEffects.playClick();
    if (!room) return;

    if (mpCurrentIndex + 1 < (room.questions.length || 10)) {
      setMpCurrentIndex((prev) => prev + 1);
      setMpSelectedOption(null);
      setMpSubmitted(false);
    } else {
      const scores = room.players.map((p) => p.score);
      const maxScore = Math.max(...scores);
      const top = room.players.filter((p) => p.score === maxScore);
      if (top.length === 1) {
        setMpView('finished');
      } else {
        setMpView('tiebreaker');
        setMpSelectedOption(null);
        setMpSubmitted(false);
      }
    }
  };

  const currentSoloQ = soloQuestions[soloIndex];
  const currentMpQ = room?.questions?.[mpCurrentIndex];
  const isHost = room?.hostId === myPlayerId;

  return (
    <div className="flex-1 flex flex-col p-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            soundEffects.playClick();
            if (subMode === 'menu') onBack();
            else setSubMode('menu');
          }}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{subMode === 'menu' ? 'Desafios' : 'Menu Matemática'}</span>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-semibold">
          <Calculator className="w-3.5 h-3.5" />
          <span>Desafio de Matemática</span>
        </div>
      </div>

      {/* --- MENU: CHOICE OF SOLO OR MULTIPLAYER --- */}
      {subMode === 'menu' && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 mb-1">Matemática Rápida & Batalhas</h2>
              <p className="text-xs text-zinc-400">
                10 questões de raciocínio, álgebra, frações e geometria da sua série escolar ({GRADE_LABELS[user.grade].short})!
              </p>
            </div>

            {/* 1. Matemática Normal (Solo) */}
            <div className="bg-zinc-950/70 border border-amber-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/40">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100 text-sm">Matemática Normal (Solo Contra o Tempo)</h3>
                  <p className="text-[11px] text-zinc-400">10 questões com cronômetro, combos e explicações detalhadas</p>
                </div>
              </div>

              <button
                onClick={startSoloMath}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Iniciar Desafio Solo de Matemática</span>
              </button>
            </div>

            {/* 2. Matemática Multiplayer Online */}
            <div className="bg-zinc-950/70 border border-cyan-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg border border-cyan-500/40">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100 text-sm">Matemática Multiplayer Online</h3>
                  <p className="text-[11px] text-zinc-400">Batalha simultânea em tempo real com até 3 jogadores via código</p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setSubMode('multiplayer');
                  setMpView('lobby');
                }}
                className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md"
              >
                <Users className="w-4 h-4" />
                <span>Entrar no Multiplayer de Matemática</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBMODE 1: SOLO MATH --- */}
      {subMode === 'solo' && !isSoloFinished && currentSoloQ && (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Header with Timer and Combo */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">
                  Questão {soloIndex + 1} de {soloQuestions.length}
                </span>
                {soloStreak > 1 && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-bold animate-pulse">
                    🔥 {soloStreak}x Combo!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-200 text-xs font-mono font-bold">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <span className={soloTimer <= 5 ? 'text-rose-400 animate-ping' : ''}>{soloTimer}s</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 mb-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                {currentSoloQ.topic || 'Matemática'}
              </span>
              <h3 className="text-sm font-bold text-zinc-100 leading-snug">{currentSoloQ.question}</h3>
            </div>

            {/* Voice Answering Control */}
            <VoiceAnswerController
              options={currentSoloQ.options || []}
              selectedOption={soloSelectedOption}
              isAnswerSubmitted={soloSubmitted}
              onSelectOption={(idx) => {
                soundEffects.playClick();
                setSoloSelectedOption(idx);
              }}
              onSubmitAnswer={() => handleSoloSubmit()}
              onNextQuestion={handleSoloNext}
            />

            {/* Options */}
            <div className="space-y-2 text-xs">
              {(currentSoloQ.options || []).map((opt, idx) => {
                const isSelected = soloSelectedOption === idx;
                const isCorrect = idx === currentSoloQ.correctIndex;

                let optionStyles = 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700';

                if (soloSubmitted) {
                  if (isCorrect) optionStyles = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-bold';
                  else if (isSelected && !isCorrect) optionStyles = 'bg-rose-950/50 border-rose-500 text-rose-200';
                  else optionStyles = 'bg-zinc-950/30 border-zinc-900 text-zinc-500';
                } else if (isSelected) {
                  optionStyles = 'bg-amber-950/60 border-amber-500 text-amber-100 font-medium';
                }

                return (
                  <button
                    key={idx}
                    disabled={soloSubmitted}
                    onClick={() => {
                      if (!soloSubmitted) {
                        soundEffects.playClick();
                        setSoloSelectedOption(idx);
                      }
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition ${optionStyles}`}
                  >
                    <span>{opt}</span>
                    {soloSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {soloSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {soloSubmitted && (
              <div className="mt-3 p-3 bg-zinc-900/90 border border-zinc-700 rounded-xl text-xs">
                <span className="font-bold text-zinc-200 block mb-0.5">Explicação Passo a Passo:</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{currentSoloQ.explanation}</p>
              </div>
            )}
          </div>

          <div className="mt-3">
            {!soloSubmitted ? (
              <button
                disabled={soloSelectedOption === null}
                onClick={() => handleSoloSubmit()}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs transition disabled:opacity-40 shadow-md"
              >
                Confirmar Resposta
              </button>
            ) : (
              <button
                onClick={handleSoloNext}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <span>{soloIndex + 1 < soloQuestions.length ? 'Próxima Questão' : 'Ver Resultado'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* SOLO FINISHED VICTORY */}
      {subMode === 'solo' && isSoloFinished && (
        <VictoryCelebration
          winnerName={user.name || 'Estudante'}
          winnerAvatar={user.avatar || '🎓'}
          scoreText={`Você acertou ${soloScore} de ${soloQuestions.length} questões de Matemática!`}
          modeTitle="Desafio Solo de Matemática"
          onPlayAgain={startSoloMath}
          onHome={onBack}
        />
      )}

      {/* --- SUBMODE 2: MULTIPLAYER MATH --- */}
      {subMode === 'multiplayer' && (
        <div className="flex-1 flex flex-col justify-between">
          {mpView === 'lobby' && (
            <div className="space-y-4">
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-200 text-xs">Criar Sala de Matemática</h3>
                    <p className="text-[10px] text-zinc-400">Gera um código para seus amigos entrarem</p>
                  </div>
                </div>

                <button
                  onClick={handleCreateMpRoom}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>Criar Sala de Matemática (Até 3)</span>
                </button>
              </div>

              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-200 text-xs">Entrar com Código</h3>
                    <p className="text-[10px] text-zinc-400">Digite o código gerado pelo anfitrião</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    placeholder="Ex: MAT-1234"
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-100 uppercase placeholder:text-zinc-600 focus:outline-hidden focus:border-cyan-500"
                  />

                  <button
                    onClick={handleJoinMpRoom}
                    disabled={isLoading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center transition disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Entrar</span>}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-950/40 border border-rose-600/50 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* WAITING LOBBY */}
          {mpView === 'waiting' && room && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-950/40 to-blue-950/30 border border-cyan-500/40 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Código da Sala de Matemática
                </span>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl font-black font-mono tracking-widest text-zinc-100">
                    {room.code}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(room.code).catch(() => {});
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition"
                    title="Copiar Código"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Compartilhe este código para até 2 amigos entrarem na partida!
                </p>
              </div>

              {/* Players */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-200">
                  Jogadores Conectados ({room.players.length}/3)
                </span>
                {room.players.map((p) => (
                  <div
                    key={p.id}
                    className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{p.avatar}</span>
                      <span className="text-xs font-bold text-zinc-200">{p.name}</span>
                      {p.id === room.hostId && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold border border-amber-500/30 flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" /> Anfitrião
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold">Pronto</span>
                  </div>
                ))}
              </div>

              {isHost ? (
                <button
                  onClick={handleStartMpMatch}
                  className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Iniciar Batalha de Matemática</span>
                </button>
              ) : (
                <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-2xl text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Aguardando o anfitrião iniciar...</span>
                </div>
              )}
            </div>
          )}

          {/* IN GAME MULTIPLAYER */}
          {mpView === 'in_game' && room && currentMpQ && (
            <div>
              {/* Scoreboard */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-2.5 mb-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-cyan-400">Questão {mpCurrentIndex + 1} de 10</span>
                  <span className="text-[10px] text-zinc-400">Matemática Online</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  {room.players.map((p) => (
                    <div
                      key={p.id}
                      className={`p-1.5 rounded-xl border text-center ${
                        p.id === myPlayerId
                          ? 'bg-cyan-950/40 border-cyan-500/50 font-bold text-cyan-200'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span className="truncate block">{p.name}</span>
                      <span className="text-amber-400 font-bold">{p.score} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 mb-3">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  {currentMpQ.topic || 'Matemática'}
                </span>
                <h3 className="text-sm font-bold text-zinc-100 leading-snug">{currentMpQ.question}</h3>
              </div>

              {/* Options */}
              <div className="space-y-2 text-xs">
                {(currentMpQ.options || []).map((opt, idx) => {
                  const isSelected = mpSelectedOption === idx;
                  const isCorrect = idx === currentMpQ.correctIndex;
                  let optionStyles = 'bg-zinc-950/60 border-zinc-800 text-zinc-300';

                  if (mpSubmitted) {
                    if (isCorrect) optionStyles = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-bold';
                    else if (isSelected && !isCorrect) optionStyles = 'bg-rose-950/50 border-rose-500 text-rose-200';
                    else optionStyles = 'bg-zinc-950/30 border-zinc-900 text-zinc-500';
                  } else if (isSelected) {
                    optionStyles = 'bg-cyan-950/60 border-cyan-500 text-cyan-100 font-medium';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={mpSubmitted}
                      onClick={() => {
                        if (!mpSubmitted) {
                          soundEffects.playClick();
                          setMpSelectedOption(idx);
                        }
                      }}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition ${optionStyles}`}
                    >
                      <span>{opt}</span>
                      {mpSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {mpSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {mpSubmitted && (
                <div className="mt-3 p-3 bg-zinc-900/90 border border-zinc-700 rounded-xl text-xs">
                  <span className="font-bold text-zinc-200 block mb-0.5">Explicação:</span>
                  <p className="text-zinc-400 text-[11px]">{currentMpQ.explanation}</p>
                </div>
              )}

              <div className="mt-3">
                {!mpSubmitted ? (
                  <button
                    disabled={mpSelectedOption === null}
                    onClick={handleMpSubmitAnswer}
                    className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs transition disabled:opacity-40 shadow-md"
                  >
                    Confirmar Resposta
                  </button>
                ) : (
                  <button
                    onClick={handleMpNext}
                    className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <span>{mpCurrentIndex + 1 < (room.questions.length || 10) ? 'Próxima Questão' : 'Ver Placar'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* FINISHED MULTIPLAYER */}
          {mpView === 'finished' && room && (
            <VictoryCelebration
              winnerName={
                room.players.find((p) => p.id === room.winnerId)?.name ||
                room.players[0]?.name ||
                'Vencedor'
              }
              winnerAvatar={room.players.find((p) => p.id === room.winnerId)?.avatar || '➗'}
              scoreText="Batalha matemática finalizada com grande domínio de cálculos e raciocínio!"
              modeTitle="Matemática Multiplayer Online"
              onPlayAgain={() => setMpView('lobby')}
              onHome={onBack}
            />
          )}
        </div>
      )}
    </div>
  );
};
