import React, { useState, useEffect, useRef, useTransition } from 'react';
import { Chess, Square } from 'chess.js';
import { UserProfile, MultiplayerRoom, DifficultyLevel } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import { VictoryCelebration } from '../VictoryCelebration';
import {
  ArrowLeft,
  Users,
  Bot,
  Globe2,
  Copy,
  Check,
  RotateCcw,
  Flag,
  Loader2,
  ShieldAlert,
  Swords,
  Play,
} from 'lucide-react';

interface ChessModeProps {
  user: UserProfile;
  onBack: () => void;
  difficulty?: DifficultyLevel;
  onEarnPoints?: (points: number, isChallengeCompleted?: boolean) => void;
}

// Unicode Chess Pieces map
const PIECE_SYMBOLS: Record<string, string> = {
  p: '♟',
  r: '♜',
  n: '♞',
  b: '♝',
  q: '♛',
  k: '♚',
  P: '♙',
  R: '♖',
  N: '♘',
  B: '♗',
  Q: '♕',
  K: '♔',
};

export const ChessMode: React.FC<ChessModeProps> = ({ user, onBack, difficulty = 'medium', onEarnPoints }) => {
  const [subMode, setSubMode] = useState<'menu' | 'solo' | 'multiplayer'>('menu');
  const [soloType, setSoloType] = useState<'bot' | 'local'>('bot');
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>(difficulty);

  // Solo Chess Game State
  const [chessInstance, setChessInstance] = useState(() => new Chess());
  const [boardFen, setBoardFen] = useState(() => chessInstance.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [soloWinner, setSoloWinner] = useState<string | null>(null);
  const [soloGameOverReason, setSoloGameOverReason] = useState<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);

  // Multiplayer Chess Game State
  const [mpView, setMpView] = useState<'lobby' | 'waiting' | 'in_game' | 'finished'>('lobby');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [myPlayerId, setMyPlayerId] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pollIntervalRef = useRef<number | null>(null);

  // --- MULTIPLAYER POLLING ---
  useEffect(() => {
    if (subMode === 'multiplayer' && room?.code && mpView !== 'lobby') {
      pollIntervalRef.current = window.setInterval(async () => {
        try {
          const res = await fetch(`/api/rooms/${room.code}`);
          if (res.ok) {
            const data = await res.json();
            setRoom(data.room);

            if (data.room.status === 'in_progress' && mpView === 'waiting') {
              setMpView('in_game');
            } else if (data.room.status === 'finished' && mpView === 'in_game') {
              setMpView('finished');
            }
          }
        } catch {
          // Silent polling retry
        }
      }, 1200);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [subMode, room?.code, mpView]);

  // --- SOLO GAMEPLAY ---
  const handleResetSolo = () => {
    soundEffects.playClick();
    const newGame = new Chess();
    setChessInstance(newGame);
    setBoardFen(newGame.fen());
    setSelectedSquare(null);
    setPossibleMoves([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setSoloWinner(null);
    setSoloGameOverReason(null);
    setIsBotThinking(false);
  };

  const handleSquareClickSolo = (square: Square) => {
    if (soloWinner || isBotThinking) return;

    // If a piece is already selected, try to move
    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      // Check if move is legal
      try {
        const move = chessInstance.move({
          from: selectedSquare,
          to: square,
          promotion: 'q',
        });

        if (move) {
          if (move.captured) {
            soundEffects.playChessCapture();
            if (move.color === 'w') {
              setCapturedBlack((prev) => [...prev, move.captured!]);
            } else {
              setCapturedWhite((prev) => [...prev, move.captured!]);
            }
          } else {
            soundEffects.playChessMove();
          }

          if (chessInstance.inCheck()) {
            soundEffects.playChessCheck();
          }

          setBoardFen(chessInstance.fen());
          setSelectedSquare(null);
          setPossibleMoves([]);

          // Check game over
          if (chessInstance.isCheckmate()) {
            const winner = move.color === 'w' ? 'Brancas' : 'Pretas';
            setSoloWinner(winner);
            setSoloGameOverReason('Xeque-mate!');
            if (move.color === 'w') {
              onEarnPoints?.(60, true);
            } else {
              onEarnPoints?.(20, true);
            }
            return;
          } else if (chessInstance.isDraw()) {
            setSoloWinner('Empate');
            setSoloGameOverReason('Empate no tabuleiro!');
            onEarnPoints?.(25, true);
            return;
          }

          // If playing vs Bot and it's Black's turn
          if (soloType === 'bot' && chessInstance.turn() === 'b') {
            setIsBotThinking(true);
            setTimeout(() => {
              makeBotMove();
            }, 600);
          }
          return;
        }
      } catch {
        // Not a legal move to that square, select new piece if own color
      }
    }

    // Select piece
    const piece = chessInstance.get(square);
    if (piece) {
      if (soloType === 'bot' && piece.color !== 'w') return; // Can only move white vs bot
      if (soloType === 'local' && piece.color !== chessInstance.turn()) return;

      setSelectedSquare(square);
      const moves = chessInstance.moves({ square, verbose: true });
      setPossibleMoves(moves.map((m) => m.to));
      soundEffects.playClick();
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const makeBotMove = () => {
    if (chessInstance.isGameOver()) return;

    const moves = chessInstance.moves({ verbose: true });
    if (moves.length === 0) return;

    let chosenMove = moves[0];

    if (botDifficulty === 'easy') {
      // Random move
      chosenMove = moves[Math.floor(Math.random() * moves.length)];
    } else if (botDifficulty === 'medium') {
      // Prioritize captures and checks
      const captureMoves = moves.filter((m) => m.captured);
      const checkMoves = moves.filter((m) => m.san.includes('+'));
      if (captureMoves.length > 0) {
        chosenMove = captureMoves[Math.floor(Math.random() * captureMoves.length)];
      } else if (checkMoves.length > 0) {
        chosenMove = checkMoves[Math.floor(Math.random() * checkMoves.length)];
      } else {
        chosenMove = moves[Math.floor(Math.random() * moves.length)];
      }
    } else {
      // Hard: Prefer high-value captures (Q > R > B/N > P)
      const pieceValues: Record<string, number> = { q: 9, r: 5, b: 3, n: 3, p: 1 };
      let bestScore = -100;
      for (const m of moves) {
        let score = 0;
        if (m.captured) score += (pieceValues[m.captured] || 1) * 10;
        if (m.san.includes('+')) score += 5;
        if (['d4', 'd5', 'e4', 'e5'].includes(m.to)) score += 2;
        if (score > bestScore) {
          bestScore = score;
          chosenMove = m;
        }
      }
    }

    try {
      const move = chessInstance.move(chosenMove);
      if (move) {
        if (move.captured) {
          soundEffects.playChessCapture();
          setCapturedWhite((prev) => [...prev, move.captured!]);
        } else {
          soundEffects.playChessMove();
        }

        if (chessInstance.inCheck()) {
          soundEffects.playChessCheck();
        }

        setBoardFen(chessInstance.fen());

        if (chessInstance.isCheckmate()) {
          setSoloWinner('Computador (Pretas)');
          setSoloGameOverReason('Xeque-mate do robô!');
        } else if (chessInstance.isDraw()) {
          setSoloWinner('Empate');
          setSoloGameOverReason('Empate por afogamento ou repetição.');
        }
      }
    } catch {
      // Move failed
    } finally {
      setIsBotThinking(false);
    }
  };

  // --- MULTIPLAYER GAMEPLAY ---
  const handleCreateMpRoom = async () => {
    soundEffects.playClick();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: user.name || 'Jogador 1',
          hostGrade: user.grade,
          hostAvatar: user.avatar || '♟️',
          gameType: 'chess',
        }),
      });

      if (!res.ok) throw new Error('Erro ao criar sala de xadrez');

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
      setErrorMessage('Digite o código da sala de xadrez (ex: XADREZ-1234).');
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
          playerAvatar: user.avatar || '♟️',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao entrar na sala.');

      setRoom(data.room);
      setMyPlayerId(data.playerId);
      setMpView('in_game');
    } catch (err: any) {
      soundEffects.playError();
      setErrorMessage(err.message || 'Sala não encontrada.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSquareClickMp = async (square: Square) => {
    if (!room || !room.chessState || room.status !== 'in_progress') return;

    const isWhite = room.chessState.whitePlayerId === myPlayerId;
    const myColor = isWhite ? 'w' : 'b';
    const isMyTurn = room.chessState.turn === myColor;

    if (!isMyTurn) return;

    const chess = new Chess(room.chessState.fen);

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      try {
        // Send move to server
        const res = await fetch(`/api/rooms/${room.code}/chess-move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: myPlayerId,
            from: selectedSquare,
            to: square,
            promotion: 'q',
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setRoom(data.room);
          setSelectedSquare(null);
          setPossibleMoves([]);

          if (data.move?.captured) {
            soundEffects.playChessCapture();
          } else {
            soundEffects.playChessMove();
          }

          if (data.room.chessState?.isCheck) {
            soundEffects.playChessCheck();
          }

          if (data.room.status === 'finished') {
            setMpView('finished');
          }
        } else {
          soundEffects.playError();
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      } catch {
        soundEffects.playError();
      }
      return;
    }

    const piece = chess.get(square);
    if (piece && piece.color === myColor) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setPossibleMoves(moves.map((m) => m.to));
      soundEffects.playClick();
    }
  };

  const handleRematchMp = async () => {
    if (!room) return;
    soundEffects.playClick();
    try {
      const res = await fetch(`/api/rooms/${room.code}/chess-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
        setMpView('in_game');
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } catch {}
  };

  // Render 8x8 Board
  const renderBoard = (
    fen: string,
    onSquareClick: (sq: Square) => void,
    interactiveTurn: string,
    isCheck: boolean,
    lastMove: { from: string; to: string } | null
  ) => {
    const chess = new Chess(fen);
    const board = chess.board();
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    return (
      <div className="w-full max-w-[340px] aspect-square mx-auto bg-zinc-950 p-1.5 rounded-2xl border-2 border-zinc-700 shadow-2xl flex flex-col justify-between">
        {board.map((row, rIdx) => {
          const rank = 8 - rIdx;
          return (
            <div key={rank} className="flex-1 flex">
              {row.map((piece, fIdx) => {
                const squareName = `${files[fIdx]}${rank}` as Square;
                const isLight = (rIdx + fIdx) % 2 === 0;
                const isSelected = selectedSquare === squareName;
                const isPossible = possibleMoves.includes(squareName);
                const isLastMoveSquare = lastMove && (lastMove.from === squareName || lastMove.to === squareName);
                const isKingInCheck = isCheck && piece?.type === 'k' && piece?.color === chess.turn();

                let bgClass = isLight ? 'bg-amber-100 text-zinc-900' : 'bg-amber-800 text-amber-50';

                if (isSelected) {
                  bgClass = 'bg-yellow-400 text-zinc-950 font-black ring-2 ring-yellow-300 z-10';
                } else if (isKingInCheck) {
                  bgClass = 'bg-rose-500 text-white animate-pulse ring-2 ring-rose-600 z-10';
                } else if (isLastMoveSquare) {
                  bgClass = isLight ? 'bg-yellow-200 text-zinc-900' : 'bg-amber-700 text-amber-50';
                }

                // Piece unicode
                let pieceChar = '';
                if (piece) {
                  const key = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
                  pieceChar = PIECE_SYMBOLS[key] || '';
                }

                return (
                  <button
                    key={squareName}
                    onClick={() => onSquareClick(squareName)}
                    className={`flex-1 aspect-square relative flex items-center justify-center transition select-none ${bgClass}`}
                    title={squareName}
                  >
                    {/* Rank / File coordinates indicator on edges */}
                    {fIdx === 0 && (
                      <span className="absolute top-0.5 left-0.5 text-[8px] font-bold opacity-60 leading-none">
                        {rank}
                      </span>
                    )}
                    {rIdx === 7 && (
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold opacity-60 leading-none">
                        {files[fIdx]}
                      </span>
                    )}

                    {/* Possible move dot or capture ring */}
                    {isPossible && (
                      <div
                        className={`absolute z-10 rounded-full ${
                          piece
                            ? 'w-full h-full border-4 border-emerald-500/80 bg-emerald-500/20'
                            : 'w-3 h-3 bg-emerald-600/80 ring-2 ring-white/60'
                        }`}
                      />
                    )}

                    {/* Piece Symbol */}
                    {pieceChar && (
                      <span
                        className={`text-2xl sm:text-3xl leading-none drop-shadow-sm font-serif ${
                          piece?.color === 'w' ? 'text-zinc-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]' : 'text-zinc-950'
                        }`}
                      >
                        {pieceChar}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

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
          <span>{subMode === 'menu' ? 'Desafios' : 'Menu de Xadrez'}</span>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-semibold">
          <span>♟️ Desafio de Xadrez</span>
        </div>
      </div>

      {/* --- MENU: CHOICE OF NORMAL OR MULTIPLAYER --- */}
      {subMode === 'menu' && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 mb-1">Xadrez Estratégico</h2>
              <p className="text-xs text-zinc-400">
                Desenvolva seu raciocínio lógico e visão de jogo com o clássico dos tabuleiros!
              </p>
            </div>

            {/* 1. Xadrez Normal (Solo / vs Robô / Local) */}
            <div className="bg-zinc-950/70 border border-amber-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/40">
                  ♔
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100 text-sm">Xadrez Normal (Solo / Bot / Local)</h3>
                  <p className="text-[11px] text-zinc-400">Jogue contra o computador ou com um amigo no mesmo celular</p>
                </div>
              </div>

              {/* Bot Difficulty Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] text-zinc-400">Dificuldade:</span>
                {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      soundEffects.playClick();
                      setBotDifficulty(lvl);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                      botDifficulty === lvl
                        ? 'bg-amber-500 text-zinc-950 font-black'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {lvl === 'easy' ? 'Fácil' : lvl === 'medium' ? 'Médio' : 'Difícil'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setSoloType('bot');
                    handleResetSolo();
                    setSubMode('solo');
                  }}
                  className="py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Bot className="w-4 h-4" />
                  <span>Vs Computador</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setSoloType('local');
                    handleResetSolo();
                    setSubMode('solo');
                  }}
                  className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Users className="w-4 h-4" />
                  <span>2 Jogadores Local</span>
                </button>
              </div>
            </div>

            {/* 2. Xadrez Multiplayer Online */}
            <div className="bg-zinc-950/70 border border-blue-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xl border border-blue-500/40">
                  ♚
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100 text-sm">Xadrez Multiplayer Online</h3>
                  <p className="text-[11px] text-zinc-400">Crie ou entre em uma sala com código para disputar em tempo real</p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setSubMode('multiplayer');
                  setMpView('lobby');
                }}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md"
              >
                <Globe2 className="w-4 h-4" />
                <span>Entrar no Xadrez Online</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBMODE 1: SOLO / BOT / LOCAL CHESS --- */}
      {subMode === 'solo' && (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Turn & Status Bar */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-2.5 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    chessInstance.turn() === 'w' ? 'bg-amber-200 ring-2 ring-amber-400' : 'bg-zinc-900 ring-2 ring-zinc-600'
                  }`}
                />
                <span className="text-xs font-bold text-zinc-200">
                  {soloType === 'bot'
                    ? chessInstance.turn() === 'w'
                      ? 'Sua Vez (Brancas)'
                      : isBotThinking
                      ? 'Robô Pensando...'
                      : 'Vez do Computador'
                    : `Vez das ${chessInstance.turn() === 'w' ? 'Brancas' : 'Pretas'}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {chessInstance.inCheck() && (
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-md text-[10px] font-bold animate-pulse">
                    XEQUE!
                  </span>
                )}
                <button
                  onClick={handleResetSolo}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition"
                  title="Reiniciar Tabuleiro"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Board */}
            {renderBoard(boardFen, handleSquareClickSolo, chessInstance.turn(), chessInstance.inCheck(), null)}

            {/* Captured Pieces Bar */}
            <div className="mt-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 min-h-[20px]">
                <span className="text-[10px] text-zinc-500 font-bold mr-1">Capturadas:</span>
                {capturedBlack.map((p, i) => (
                  <span key={i} className="text-base text-zinc-400">
                    {PIECE_SYMBOLS[p.toLowerCase()]}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 min-h-[20px]">
                {capturedWhite.map((p, i) => (
                  <span key={i} className="text-base text-amber-200">
                    {PIECE_SYMBOLS[p.toUpperCase()]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Game Over Modal in Solo */}
          {soloWinner && (
            <div className="mt-3 p-3 bg-amber-950/60 border border-amber-500/60 rounded-2xl text-center space-y-2">
              <span className="text-xs font-bold text-amber-300 block">
                Fim de Jogo: {soloGameOverReason}
              </span>
              <span className="text-sm font-black text-zinc-100 block">
                Vencedor: {soloWinner}
              </span>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleResetSolo}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition"
                >
                  Jogar Novamente
                </button>
                <button
                  onClick={() => setSubMode('menu')}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs transition"
                >
                  Menu
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- SUBMODE 2: MULTIPLAYER ONLINE CHESS --- */}
      {subMode === 'multiplayer' && (
        <div className="flex-1 flex flex-col justify-between">
          {/* LOBBY: CREATE OR JOIN */}
          {mpView === 'lobby' && (
            <div className="space-y-4">
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    ♔
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-200 text-xs">Criar Sala de Xadrez</h3>
                    <p className="text-[10px] text-zinc-400">Você jogará com as Brancas (♔)</p>
                  </div>
                </div>

                <button
                  onClick={handleCreateMpRoom}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>Criar Sala de Xadrez Online</span>
                </button>
              </div>

              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    ♚
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-200 text-xs">Entrar com Código</h3>
                    <p className="text-[10px] text-zinc-400">Você jogará com as Pretas (♚)</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    placeholder="Ex: XADREZ-1234"
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-100 uppercase placeholder:text-zinc-600 focus:outline-hidden focus:border-blue-500"
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

          {/* WAITING FOR OPPONENT */}
          {mpView === 'waiting' && room && (
            <div className="space-y-4 text-center">
              <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/30 border border-blue-500/40 rounded-2xl p-5">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                  Código da Sala de Xadrez
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
                <p className="text-xs text-zinc-400">
                  Envie este código para seu adversário. O jogo iniciará automaticamente quando ele entrar!
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span>Aguardando o segundo jogador entrar...</span>
              </div>
            </div>
          )}

          {/* IN GAME MULTIPLAYER */}
          {mpView === 'in_game' && room && room.chessState && (
            <div>
              {/* Opponent & Turn header */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-2.5 mb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 block">
                    {myPlayerId === room.chessState.whitePlayerId
                      ? 'Você: Brancas (♔)'
                      : 'Você: Pretas (♚)'}
                  </span>
                  <span className="text-xs font-bold text-zinc-100">
                    {room.chessState.turn === (myPlayerId === room.chessState.whitePlayerId ? 'w' : 'b')
                      ? '👉 Sua vez de jogar!'
                      : '⏳ Aguardando lance do adversário...'}
                  </span>
                </div>

                {room.chessState.isCheck && (
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-md text-[10px] font-bold animate-pulse">
                    XEQUE!
                  </span>
                )}
              </div>

              {/* Board */}
              {renderBoard(
                room.chessState.fen,
                handleSquareClickMp,
                room.chessState.turn,
                room.chessState.isCheck,
                room.chessState.lastMove
              )}

              {/* Captured info */}
              <div className="mt-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 min-h-[20px]">
                  <span className="text-[10px] text-zinc-500 font-bold mr-1">Capturadas:</span>
                  {room.chessState.capturedByWhite.map((p, i) => (
                    <span key={i} className="text-base text-zinc-400">
                      {PIECE_SYMBOLS[p.toLowerCase()]}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 min-h-[20px]">
                  {room.chessState.capturedByBlack.map((p, i) => (
                    <span key={i} className="text-base text-amber-200">
                      {PIECE_SYMBOLS[p.toUpperCase()]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FINISHED MULTIPLAYER */}
          {mpView === 'finished' && room && (
            <VictoryCelebration
              winnerName={
                room.winnerId === myPlayerId
                  ? user.name || 'Você'
                  : room.players.find((p) => p.id === room.winnerId)?.name || 'Adversário'
              }
              winnerAvatar="♟️"
              scoreText={
                room.winnerId === myPlayerId
                  ? 'Parabéns! Você venceu a partida de xadrez online por xeque-mate!'
                  : 'Fim de jogo no tabuleiro de xadrez online!'
              }
              modeTitle="Xadrez Online"
              onPlayAgain={handleRematchMp}
              onHome={onBack}
            />
          )}
        </div>
      )}
    </div>
  );
};
