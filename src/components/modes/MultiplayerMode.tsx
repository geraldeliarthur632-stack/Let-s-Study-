import React, { useState, useEffect, useRef } from 'react';
import { GradeLevel, MultiplayerRoom, Question, UserProfile } from '../../types';
import {
  GRADE_LABELS,
  getQuestionsForMatch,
  getTiebreakerQuestions,
} from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { VictoryCelebration } from '../VictoryCelebration';
import { VoiceAnswerController } from '../VoiceAnswerController';
import {
  ArrowLeft,
  Globe2,
  Users,
  Copy,
  Check,
  Play,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  Crown,
  ChevronRight,
} from 'lucide-react';

interface MultiplayerModeProps {
  user: UserProfile;
  onBack: () => void;
  onAnswerCorrect: () => void;
  onMatchFinished: (winnerIsUser: boolean, correctCount: number) => void;
}

export const MultiplayerMode: React.FC<MultiplayerModeProps> = ({
  user,
  onBack,
  onAnswerCorrect,
  onMatchFinished,
}) => {
  const [view, setView] = useState<'lobby_choice' | 'room_waiting' | 'in_match' | 'tiebreaker' | 'winner'>('lobby_choice');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Question answering state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  // Tiebreaker index
  const [tiebreakerIndex, setTiebreakerIndex] = useState(0);

  const pollIntervalRef = useRef<number | null>(null);

  // Polling room status
  useEffect(() => {
    if (room?.code && view !== 'lobby_choice' && view !== 'winner') {
      pollIntervalRef.current = window.setInterval(async () => {
        try {
          const res = await fetch(`/api/rooms/${room.code}`);
          if (res.ok) {
            const data = await res.json();
            setRoom(data.room);

            if (data.room.status === 'in_progress' && view === 'room_waiting') {
              setView('in_match');
              setCurrentQuestionIndex(0);
              setSelectedOption(null);
              setIsAnswerSubmitted(false);
            } else if (data.room.status === 'tiebreaker' && view === 'in_match') {
              setView('tiebreaker');
              setSelectedOption(null);
              setIsAnswerSubmitted(false);
            } else if (data.room.status === 'finished') {
              setView('winner');
              const isWinner = data.room.winnerId === myPlayerId;
              const myPlayer = data.room.players.find((p: any) => p.id === myPlayerId);
              onMatchFinished(isWinner, myPlayer?.score || 0);
            }
          }
        } catch {
          // Silent polling retry
        }
      }, 1500);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [room?.code, view, myPlayerId]);

  // Create Room
  const handleCreateRoom = async () => {
    soundEffects.playClick();
    setIsLoading(true);
    setErrorMessage(null);

    const questions = getQuestionsForMatch(user.grade, 10);
    const tiebreakers = getTiebreakerQuestions(user.grade);

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: user.name || 'Jogador 1',
          hostGrade: user.grade,
          hostAvatar: user.avatar || '🎓',
          grade: user.grade,
          questions,
          tiebreakerQuestions: tiebreakers,
        }),
      });

      if (!res.ok) throw new Error('Erro ao criar sala');

      const data = await res.json();
      setRoom(data.room);
      setMyPlayerId(data.playerId);
      setView('room_waiting');
    } catch {
      // Offline simulated room fallback
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
      const code = `SALA-${randomCode}`;
      const simRoom: MultiplayerRoom = {
        code,
        grade: user.grade,
        gameType: 'general',
        status: 'waiting',
        hostId: 'me',
        players: [
          {
            id: 'me',
            name: user.name || 'Eu (Anfitrião)',
            avatar: user.avatar || '🎓',
            grade: user.grade,
            score: 0,
            errors: 0,
            currentQuestionIndex: 0,
            isReady: true,
            connected: true,
          },
          {
            id: 'bot_1',
            name: 'Lucas Estudante',
            avatar: '🚀',
            grade: user.grade,
            score: 0,
            errors: 0,
            currentQuestionIndex: 0,
            isReady: true,
            connected: true,
          },
        ],
        questions,
        tiebreakerQuestions: tiebreakers,
        currentQuestionIndex: 0,
        maxPlayers: 3,
        createdAt: Date.now(),
      };
      setRoom(simRoom);
      setMyPlayerId('me');
      setView('room_waiting');
    } finally {
      setIsLoading(false);
    }
  };

  // Join Room
  const handleJoinRoom = async () => {
    if (!joinCodeInput.trim()) {
      setErrorMessage('Digite o código da sala (ex: SALA-1234).');
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
          playerName: user.name || 'Estudante',
          playerGrade: user.grade,
          playerAvatar: user.avatar || '⭐',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao entrar na sala');
      }

      setRoom(data.room);
      setMyPlayerId(data.playerId);
      setView('room_waiting');
    } catch (err: any) {
      soundEffects.playError();
      setErrorMessage(err.message || 'Sala não encontrada. Verifique o código e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Host starts match
  const handleStartMatch = async () => {
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
        setView('in_match');
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
      }
    } catch {
      // Local fallback
      setRoom({ ...room, status: 'in_progress' });
      setView('in_match');
    }
  };

  // Copy room code to clipboard
  const handleCopyCode = () => {
    if (!room?.code) return;
    soundEffects.playClick();
    navigator.clipboard.writeText(room.code).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Submit Answer in match
  const handleSubmitAnswer = async () => {
    if (selectedOption === null || isAnswerSubmitted || !room) return;

    const currentQ = room.questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQ.correctIndex;

    setIsAnswerSubmitted(true);

    if (isCorrect) {
      soundEffects.playCorrect(user.equippedSound);
      onAnswerCorrect();
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
          questionIndex: currentQuestionIndex,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
      }
    } catch {
      // Local update
      setRoom((prev) => {
        if (!prev) return null;
        const copy = { ...prev };
        const p = copy.players.find((pl) => pl.id === myPlayerId);
        if (p) {
          if (isCorrect) p.score += 1;
          else p.errors += 1;
          p.currentQuestionIndex = currentQuestionIndex + 1;
        }
        return copy;
      });
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    soundEffects.playClick();
    if (!room) return;

    if (currentQuestionIndex + 1 < (room.questions.length || 10)) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finished 10 questions! Check status
      const scores = room.players.map((p) => p.score);
      const maxScore = Math.max(...scores);
      const top = room.players.filter((p) => p.score === maxScore);

      if (top.length === 1) {
        setView('winner');
        const isWinner = top[0].id === myPlayerId;
        onMatchFinished(isWinner, top[0].score);
      } else {
        // Tiebreaker triggered!
        setView('tiebreaker');
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
      }
    }
  };

  // Tiebreaker Submit
  const handleTiebreakerSubmit = async () => {
    if (selectedOption === null || isAnswerSubmitted || !room) return;

    const tbQuestions = room.tiebreakerQuestions?.length
      ? room.tiebreakerQuestions
      : getTiebreakerQuestions(room.grade);
    const currentQ = tbQuestions[tiebreakerIndex % tbQuestions.length];
    const isCorrect = selectedOption === currentQ.correctIndex;

    setIsAnswerSubmitted(true);

    if (isCorrect) {
      soundEffects.playCorrect(user.equippedSound);
      onAnswerCorrect();
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
          questionIndex: tiebreakerIndex,
          isTiebreaker: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
      }
    } catch {
      // Local tiebreaker update
      setRoom((prev) => {
        if (!prev) return null;
        const copy = { ...prev };
        const p = copy.players.find((pl) => pl.id === myPlayerId);
        if (p && isCorrect) p.score += 1;
        return copy;
      });
    }
  };

  const handleTiebreakerNext = () => {
    soundEffects.playClick();
    if (!room) return;

    const scores = room.players.map((p) => p.score);
    const maxScore = Math.max(...scores);
    const top = room.players.filter((p) => p.score === maxScore);

    if (top.length === 1) {
      setView('winner');
      onMatchFinished(top[0].id === myPlayerId, top[0].score);
    } else {
      setTiebreakerIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    }
  };

  const isHost = room?.hostId === myPlayerId;
  const currentQ = room?.questions?.[currentQuestionIndex];
  const tbQuestions = room?.tiebreakerQuestions?.length
    ? room.tiebreakerQuestions
    : room
    ? getTiebreakerQuestions(room.grade)
    : [];
  const currentTbQ = tbQuestions[tiebreakerIndex % tbQuestions.length];

  return (
    <div className="flex-1 flex flex-col p-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            soundEffects.playClick();
            if (view === 'lobby_choice') onBack();
            else setView('lobby_choice');
          }}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{view === 'lobby_choice' ? 'Menu Principal' : 'Sair da Sala'}</span>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-semibold">
          <Globe2 className="w-3.5 h-3.5" />
          <span>Competição Multiplayer Online</span>
        </div>
      </div>

      {/* VIEW 1: LOBBY CHOICE (CREATE OR JOIN) */}
      {view === 'lobby_choice' && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 mb-1">Batalha Multiplayer Online</h2>
              <p className="text-xs text-zinc-400">
                Dispute com até 3 pessoas em tempo real! 10 perguntas da sua série ({GRADE_LABELS[user.grade].short}). Quem acertar mais e errar menos vence!
              </p>
            </div>

            {/* Create Room Box */}
            <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-200 text-xs">Criar uma Nova Sala</h3>
                  <p className="text-[10px] text-zinc-400">Gera um código para seus amigos entrarem</p>
                </div>
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>Criar Sala de Até 3 Jogadores</span>
              </button>
            </div>

            {/* Join Room Box */}
            <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-200 text-xs">Entrar em uma Sala Existente</h3>
                  <p className="text-[10px] text-zinc-400">Digite o código compartilhado pelo anfitrião</p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => {
                    setJoinCodeInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Ex: SALA-1234"
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-100 uppercase placeholder:text-zinc-600 focus:outline-hidden focus:border-cyan-500"
                />

                <button
                  onClick={handleJoinRoom}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center transition disabled:opacity-50 shrink-0"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Entrar</span>}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-950/40 border border-rose-600/50 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: ROOM WAITING LOBBY */}
      {view === 'room_waiting' && room && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Room Code Card */}
            <div className="bg-gradient-to-r from-cyan-950/40 to-blue-950/30 border border-cyan-500/40 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                Código de Entrada da Sala
              </span>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-black font-mono tracking-widest text-zinc-100">
                  {room.code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition"
                  title="Copiar Código"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-400">
                Passe este código para até 2 amigos entrarem na disputa!
              </p>
            </div>

            {/* Players in Lobby */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-zinc-200">
                  Jogadores na Sala ({room.players.length}/3)
                </span>
                <span className="text-zinc-400 text-[11px]">Série: {GRADE_LABELS[room.grade].short}</span>
              </div>

              <div className="space-y-2">
                {room.players.map((p, idx) => (
                  <div
                    key={p.id}
                    className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{p.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-100 text-xs">{p.name}</span>
                          {p.id === room.hostId && (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-400 text-[9px] font-bold border border-amber-500/30 flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5" /> Anfitrião
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400">{GRADE_LABELS[p.grade]?.short || '6º Ano'}</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Conectado</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          {isHost ? (
            <button
              onClick={handleStartMatch}
              className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Começar Batalha de 10 Perguntas</span>
            </button>
          ) : (
            <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-2xl text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Aguardando o anfitrião iniciar a partida...</span>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: IN MATCH (10 QUESTIONS) */}
      {view === 'in_match' && room && currentQ && (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Live Scoreboard Header */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-2.5 mb-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-cyan-400">
                  Questão {currentQuestionIndex + 1} de 10
                </span>
                <span className="text-[10px] text-zinc-400">10 perguntas por jogador</span>
              </div>

              {/* Mini player scores */}
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

            {/* Question Card */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 mb-2">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                {currentQ.topic}
              </span>
              <h3 className="text-sm font-bold text-zinc-100 leading-snug">{currentQ.question}</h3>
            </div>

            {/* Voice Answering Control */}
            <VoiceAnswerController
              options={currentQ.options || []}
              selectedOption={selectedOption}
              isAnswerSubmitted={isAnswerSubmitted}
              onSelectOption={(idx) => {
                soundEffects.playClick();
                setSelectedOption(idx);
              }}
              onSubmitAnswer={handleSubmitAnswer}
              onNextQuestion={handleNextQuestion}
            />

            {/* Options */}
            <div className="space-y-2 text-xs">
              {(currentQ.options || []).map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let optionStyles = 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700';

                if (isAnswerSubmitted) {
                  if (isCorrect) optionStyles = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-bold';
                  else if (isSelected && !isCorrect) optionStyles = 'bg-rose-950/50 border-rose-500 text-rose-200';
                  else optionStyles = 'bg-zinc-950/30 border-zinc-900 text-zinc-500';
                } else if (isSelected) {
                  optionStyles = 'bg-cyan-950/60 border-cyan-500 text-cyan-100 font-medium';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => {
                      if (!isAnswerSubmitted) {
                        soundEffects.playClick();
                        setSelectedOption(idx);
                      }
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition ${optionStyles}`}
                  >
                    <span>{opt}</span>
                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswerSubmitted && (
              <div className="mt-3 p-3 bg-zinc-900/90 border border-zinc-700 rounded-xl text-xs">
                <span className="font-bold text-zinc-200 block mb-0.5">Explicação:</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}
          </div>

          <div className="mt-3">
            {!isAnswerSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs transition disabled:opacity-40 shadow-md"
              >
                Confirmar Resposta
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <span>
                  {currentQuestionIndex + 1 < (room.questions.length || 10)
                    ? 'Próxima Questão'
                    : 'Ver Placar Final'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: TIEBREAKER SUDDEN DEATH */}
      {view === 'tiebreaker' && room && currentTbQ && (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="bg-amber-950/40 border border-amber-500/60 rounded-2xl p-3 mb-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-black text-xs uppercase mb-0.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Empate! Morte Súbita Multiplayer</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                Respondendo perguntas leves da série anterior até desempatar!
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 mb-3">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Desempate Rápido
              </span>
              <h3 className="text-sm font-bold text-zinc-100">{currentTbQ.question}</h3>
            </div>

            <div className="space-y-2 text-xs">
              {(currentTbQ.options || []).map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentTbQ.correctIndex;
                let optionStyles = 'bg-zinc-950/60 border-zinc-800 text-zinc-300';

                if (isAnswerSubmitted) {
                  if (isCorrect) optionStyles = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-bold';
                  else if (isSelected && !isCorrect) optionStyles = 'bg-rose-950/50 border-rose-500 text-rose-200';
                  else optionStyles = 'bg-zinc-950/30 border-zinc-900 text-zinc-500';
                } else if (isSelected) {
                  optionStyles = 'bg-amber-950/60 border-amber-500 text-amber-100 font-medium';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => {
                      if (!isAnswerSubmitted) {
                        soundEffects.playClick();
                        setSelectedOption(idx);
                      }
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition ${optionStyles}`}
                  >
                    <span>{opt}</span>
                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3">
            {!isAnswerSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleTiebreakerSubmit}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs transition disabled:opacity-40"
              >
                Confirmar Desempate
              </button>
            ) : (
              <button
                onClick={handleTiebreakerNext}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Avançar Desempate</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW 5: WINNER */}
      {view === 'winner' && room && (
        <VictoryCelebration
          winnerName={
            room.players.find((p) => p.id === room.winnerId)?.name ||
            room.players[0]?.name ||
            'Vencedor'
          }
          winnerAvatar={
            room.players.find((p) => p.id === room.winnerId)?.avatar ||
            room.players[0]?.avatar ||
            '👑'
          }
          scoreText="Competição online finalizada com sucesso! Parabéns a todos os participantes!"
          modeTitle="Multiplayer Geral Online"
          onPlayAgain={() => {
            setView('lobby_choice');
          }}
          onHome={onBack}
        />
      )}
    </div>
  );
};
