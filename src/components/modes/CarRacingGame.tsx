import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile, DifficultyLevel } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import { ArrowLeft, RotateCcw, Play, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CarRacingGameProps {
  user: UserProfile;
  onBack: () => void;
  onEarnPoints: (points: number, isChallengeCompleted?: boolean) => void;
  selectedDifficulty: DifficultyLevel;
}

interface ObstacleCar {
  id: number;
  x: number; // 0, 1, 2 (lanes)
  y: number; // percentage from top (0 - 100)
  speed: number;
  color: string;
  type: 'sedan' | 'sport' | 'truck';
}

export const CarRacingGame: React.FC<CarRacingGameProps> = ({
  user,
  onBack,
  onEarnPoints,
  selectedDifficulty,
}) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover' | 'victory'>('menu');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(5);
  const [carLane, setCarLane] = useState<number>(1); // 0: Left, 1: Center, 2: Right
  const [obstacles, setObstacles] = useState<ObstacleCar[]>([]);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('estudahud_car_highscore');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Refs for tracking mutable game loop state cleanly without stale closures or impure setState reducers
  const gameStateRef = useRef<'menu' | 'playing' | 'gameover' | 'victory'>('menu');
  const carLaneRef = useRef<number>(1);
  const distanceRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const speedRef = useRef<number>(5);
  const obstaclesRef = useRef<ObstacleCar[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  // Difficulty settings
  const speedMultiplier = selectedDifficulty === 'easy' ? 0.8 : selectedDifficulty === 'hard' ? 1.4 : 1.0;
  const targetDistanceToWin = 1000; // meters to win

  // Keep refs in sync
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    carLaneRef.current = carLane;
  }, [carLane]);

  const handleGameOver = useCallback((finalScore: number, finalDistance: number) => {
    setGameState('gameover');
    gameStateRef.current = 'gameover';
    soundEffects.playError();

    const totalCalculatedScore = finalScore + Math.floor(finalDistance);
    if (totalCalculatedScore > highScore) {
      setHighScore(totalCalculatedScore);
      try {
        localStorage.setItem('estudahud_car_highscore', totalCalculatedScore.toString());
      } catch {}
    }

    const earnedPoints = Math.floor(totalCalculatedScore / 25);
    if (earnedPoints > 0) {
      onEarnPoints(earnedPoints, false);
    }
  }, [highScore, onEarnPoints]);

  const handleVictory = useCallback(() => {
    setGameState('victory');
    gameStateRef.current = 'victory';
    soundEffects.playCorrect('bonus');
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

    const earned = selectedDifficulty === 'hard' ? 100 : selectedDifficulty === 'medium' ? 75 : 50;
    onEarnPoints(earned, true);
  }, [selectedDifficulty, onEarnPoints]);

  const startGame = () => {
    soundEffects.playClick();
    const initialSpeed = 6 * speedMultiplier;
    
    distanceRef.current = 0;
    scoreRef.current = 0;
    speedRef.current = initialSpeed;
    carLaneRef.current = 1;
    obstaclesRef.current = [];
    lastSpawnRef.current = Date.now();

    setDistance(0);
    setScore(0);
    setSpeed(initialSpeed);
    setCarLane(1);
    setObstacles([]);
    setGameState('playing');
    gameStateRef.current = 'playing';
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        soundEffects.playClick();
        setCarLane((prev) => {
          const next = Math.max(0, prev - 1);
          carLaneRef.current = next;
          return next;
        });
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        soundEffects.playClick();
        setCarLane((prev) => {
          const next = Math.min(2, prev + 1);
          carLaneRef.current = next;
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main game physics loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let isRunning = true;

    const gameTick = () => {
      if (!isRunning || gameStateRef.current !== 'playing') return;

      // 1. Advance distance & score
      const currentSpeed = speedRef.current;
      distanceRef.current += currentSpeed * 0.25;
      scoreRef.current += Math.floor(currentSpeed);
      speedRef.current = Math.min(14, currentSpeed + 0.002);

      // Check victory condition
      if (distanceRef.current >= targetDistanceToWin) {
        distanceRef.current = targetDistanceToWin;
        setDistance(targetDistanceToWin);
        setScore(scoreRef.current);
        handleVictory();
        return;
      }

      // 2. Spawn obstacle cars
      const now = Date.now();
      const spawnInterval = Math.max(600, 1500 - currentSpeed * 80);
      if (now - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = now;
        const randomLane = Math.floor(Math.random() * 3);
        const colors = ['bg-rose-500', 'bg-indigo-500', 'bg-amber-500', 'bg-purple-500', 'bg-teal-500'];
        const types: ('sedan' | 'sport' | 'truck')[] = ['sedan', 'sport', 'truck'];
        const newObs: ObstacleCar = {
          id: Date.now() + Math.random(),
          x: randomLane,
          y: -20,
          speed: (4 + Math.random() * 3) * speedMultiplier,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: types[Math.floor(Math.random() * types.length)],
        };
        obstaclesRef.current.push(newObs);
      }

      // 3. Move obstacles & detect collisions
      const currentLane = carLaneRef.current;
      const updatedObstacles: ObstacleCar[] = [];
      let collisionDetected = false;

      for (const obs of obstaclesRef.current) {
        const nextY = obs.y + currentSpeed * 0.8;
        // Collision detection window: player is around bottom (y ~ 70 to 88)
        if (nextY >= 70 && nextY <= 88 && obs.x === currentLane) {
          collisionDetected = true;
          break;
        }

        if (nextY < 110) {
          updatedObstacles.push({ ...obs, y: nextY });
        }
      }

      if (collisionDetected) {
        obstaclesRef.current = [];
        setObstacles([]);
        handleGameOver(scoreRef.current, distanceRef.current);
        return;
      }

      obstaclesRef.current = updatedObstacles;

      // Update React state for rendering
      setDistance(distanceRef.current);
      setScore(scoreRef.current);
      setSpeed(speedRef.current);
      setObstacles([...updatedObstacles]);

      requestRef.current = requestAnimationFrame(gameTick);
    };

    requestRef.current = requestAnimationFrame(gameTick);

    return () => {
      isRunning = false;
      cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, speedMultiplier, targetDistanceToWin, handleVictory, handleGameOver]);

  const lanePercentages = ['18%', '50%', '82%'];

  return (
    <div className="flex-1 flex flex-col p-4 space-y-3 bg-slate-900 text-white max-w-lg mx-auto w-full select-none overflow-hidden rounded-3xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-bold">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Corrida Educativa 2D</span>
        </div>

        <div className="text-xs text-slate-400 font-semibold">
          Recorde: <span className="text-amber-400 font-bold">{highScore}</span>
        </div>
      </div>

      {/* Main Container / Game Stage */}
      {gameState === 'menu' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-slate-700">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-4xl shadow-lg shadow-rose-500/30 animate-bounce">
            🏎️
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-wide">Corrida de Desvio 2D</h2>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              Desvie dos carros rivais na pista usando as setas ou botões laterais. Chegue a {targetDistanceToWin}m para vencer o Grande Prêmio!
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1">
            <div className="font-bold text-amber-400 mb-1">🎮 Como Jogar:</div>
            <div>• Use as setas ⬅️ ➡️ ou botões na tela</div>
            <div>• Desvie dos carros coloridos na sua pista</div>
            <div>• Dificuldade: <span className="uppercase font-bold text-cyan-400">{selectedDifficulty}</span></div>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-sm shadow-lg shadow-orange-600/40 hover:scale-105 active:scale-95 transition flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>ACELERAR E CORRER!</span>
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex-1 flex flex-col relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner min-h-[420px]">
          {/* HUD Status Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs z-20 font-bold">
            <div className="text-amber-400">Distância: {Math.floor(distance)} / {targetDistanceToWin}m</div>
            <div className="text-cyan-400">Velocidade: {Math.floor(speed * 15)} km/h</div>
            <div className="text-emerald-400">Pontos: {score}</div>
          </div>

          {/* Road Stage */}
          <div className="flex-1 relative overflow-hidden bg-slate-900">
            {/* Road Lanes lines */}
            <div className="absolute inset-y-0 left-1/3 w-1 bg-dashed border-r-2 border-dashed border-slate-700/60" />
            <div className="absolute inset-y-0 left-2/3 w-1 bg-dashed border-r-2 border-dashed border-slate-700/60" />

            {/* Obstacle Cars */}
            {obstacles.map((obs) => {
              const leftPos = obs.x === 0 ? '18%' : obs.x === 1 ? '50%' : '82%';
              return (
                <div
                  key={obs.id}
                  className="absolute transition-all duration-75 flex flex-col items-center transform -translate-x-1/2"
                  style={{ left: leftPos, top: `${obs.y}%` }}
                >
                  <div className={`w-12 h-20 rounded-xl ${obs.color} shadow-lg border border-white/20 flex flex-col items-center justify-between p-1`}>
                    <div className="w-8 h-3 bg-black/60 rounded-sm mt-1" />
                    <div className="text-[10px] font-bold text-white uppercase">{obs.type}</div>
                    <div className="w-8 h-3 bg-black/60 rounded-sm mb-1" />
                  </div>
                </div>
              );
            })}

            {/* Player Car */}
            <div
              className="absolute bottom-8 transition-all duration-100 transform -translate-x-1/2 flex flex-col items-center z-10"
              style={{ left: lanePercentages[carLane] }}
            >
              <div className="w-14 h-22 rounded-2xl bg-gradient-to-t from-blue-600 to-cyan-500 shadow-xl shadow-cyan-500/50 border-2 border-white/40 flex flex-col items-center justify-between p-1 animate-pulse">
                <div className="w-9 h-3 bg-yellow-300 rounded-sm mt-1 shadow-sm" />
                <div className="text-xs font-black text-white">{user.avatar || '🏎️'}</div>
                <div className="w-9 h-3 bg-rose-600 rounded-sm mb-1 shadow-sm" />
              </div>
            </div>
          </div>

          {/* On-screen touch steering controls for mobile/tablet */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/90 border-t border-slate-800 z-20">
            <button
              onClick={() => {
                soundEffects.playClick();
                setCarLane((prev) => {
                  const next = Math.max(0, prev - 1);
                  carLaneRef.current = next;
                  return next;
                });
              }}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-cyan-400" />
              <span>ESQUERDA</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setCarLane((prev) => {
                  const next = Math.min(2, prev + 1);
                  carLaneRef.current = next;
                  return next;
                });
              }}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
            >
              <span>DIREITA</span>
              <ChevronRight className="w-5 h-5 text-cyan-400" />
            </button>
          </div>
        </div>
      )}

      {(gameState === 'gameover' || gameState === 'victory') && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-slate-700">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-lg ${gameState === 'victory' ? 'bg-amber-500 text-white shadow-amber-500/40 animate-bounce' : 'bg-rose-600 text-white shadow-rose-600/40'}`}>
            {gameState === 'victory' ? '🏆' : '💥'}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">
              {gameState === 'victory' ? 'Vitória na Corrida!' : 'Fim de Corrida!'}
            </h2>
            <p className="text-xs text-slate-300">
              {gameState === 'victory' ? 'Parabéns! Você completou o circuito com sucesso.' : 'Você bateu em um carro rival. Tente novamente!'}
            </p>
          </div>

          <div className="w-full max-w-xs p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Distância Percorrida:</span>
              <span className="font-bold text-white">{Math.floor(distance)}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pontuação Final:</span>
              <span className="font-bold text-amber-400">{score + Math.floor(distance)} pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recorde Pessoal:</span>
              <span className="font-bold text-cyan-400">{highScore} pts</span>
            </div>
          </div>

          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={startGame}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-600/30 hover:scale-105 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jogar de Novo</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                onBack();
              }}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
