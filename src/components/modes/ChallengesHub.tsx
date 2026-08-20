import React from 'react';
import { DifficultyLevel, UserProfile } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import {
  ArrowLeft,
  Users,
  Swords,
  ChevronRight,
  Sparkles,
  Sliders,
  Search,
  Grid,
  Puzzle,
  Gamepad2,
  Brain,
  Award,
} from 'lucide-react';

interface ChallengesHubProps {
  user: UserProfile;
  onBack: () => void;
  selectedDifficulty: DifficultyLevel;
  onSelectDifficulty: (d: DifficultyLevel) => void;
  onSelectChallenge: (
    mode: 'chess' | 'math' | 'competition' | 'multiplayer' | 'wordsearch' | 'crossword' | 'puzzle' | 'car_racing'
  ) => void;
}

export const ChallengesHub: React.FC<ChallengesHubProps> = ({
  user,
  onBack,
  selectedDifficulty,
  onSelectDifficulty,
  onSelectChallenge,
}) => {
  const difficulties: {
    id: DifficultyLevel;
    label: string;
    badge: string;
    colorClasses: string;
    activeClasses: string;
    description: string;
    pointsBonus: string;
  }[] = [
    {
      id: 'easy',
      label: 'Fácil',
      badge: '🟢',
      colorClasses: 'border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100',
      activeClasses: 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold',
      description: 'Conceitos diretos e objetivos • Perguntas acessíveis • Robô iniciante',
      pointsBonus: '+10 pts / acerto',
    },
    {
      id: 'medium',
      label: 'Médio',
      badge: '🟡',
      colorClasses: 'border-blue-200 text-blue-800 bg-blue-50 hover:bg-blue-100',
      activeClasses: 'bg-blue-600 text-white border-blue-600 shadow-md font-bold',
      description: 'Aplicação padrão BNCC • Raciocínio em etapas • Robô equilibrado',
      pointsBonus: '+15 pts / acerto',
    },
    {
      id: 'hard',
      label: 'Difícil',
      badge: '🔴',
      colorClasses: 'border-rose-200 text-rose-800 bg-rose-50 hover:bg-rose-100',
      activeClasses: 'bg-rose-600 text-white border-rose-600 shadow-md font-bold',
      description: 'Problemas complexos • Análise crítica e lógica aprofundada • Robô mestre',
      pointsBonus: '+25 pts / acerto',
    },
  ];

  const currentDiff = difficulties.find((d) => d.id === selectedDifficulty) || difficulties[1];

  return (
    <div className="flex-1 flex flex-col p-4 space-y-3.5 bg-slate-50 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-200 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Início</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-amber-900 text-xs font-bold shadow-xs">
          <Gamepad2 className="w-3.5 h-3.5 text-amber-700" />
          <span>Central de Desafios & Jogos</span>
        </div>
      </div>

      {/* Intro */}
      <div>
        <h2 className="text-lg font-black text-slate-900">Desafios, Jogos & Batalhas</h2>
        <p className="text-xs text-slate-600 leading-snug">
          Jogos que exercitam o cérebro, estimulam o raciocínio e salvam automaticamente seu progresso!
        </p>
      </div>

      {/* ================= SEÇÃO: JOGOS QUE FAZEM BEM AO CÉREBRO ================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-wide">
            <Brain className="w-4 h-4 text-emerald-600" />
            <span>Jogos Cognitivos & Educativos</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Salva Onde Parou 💾
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* 1. Caça-Palavras */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onSelectChallenge('wordsearch');
            }}
            className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition group active:scale-[0.99] shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold shadow-xs shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Caça-Palavras Educativo</h3>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                      5 Níveis
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">
                    Sistema Solar, Ecologia, Matemática, Português e História
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-0.5 transition shrink-0" />
            </div>
          </button>

          {/* 2. Palavras Cruzadas */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onSelectChallenge('crossword');
            }}
            className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 hover:border-purple-400 hover:shadow-md transition group active:scale-[0.99] shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl font-bold shadow-xs shrink-0">
                  <Grid className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Palavras Cruzadas</h3>
                    <span className="px-1.5 py-0.2 rounded bg-purple-200 text-purple-900 text-[10px] font-bold">
                      5 Níveis
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">
                    Pistas inteligentes de Ciências, Geografia, História e Lógica
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-purple-600 group-hover:translate-x-0.5 transition shrink-0" />
            </div>
          </button>

          {/* 3. Quebra-Cabeça Deslizante */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onSelectChallenge('puzzle');
            }}
            className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-r from-cyan-50 to-sky-50 border border-cyan-200 hover:border-cyan-400 hover:shadow-md transition group active:scale-[0.99] shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-cyan-600 text-white flex items-center justify-center text-xl font-bold shadow-xs shrink-0">
                  <Puzzle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Quebra-Cabeça Deslizante</h3>
                    <span className="px-1.5 py-0.2 rounded bg-cyan-200 text-cyan-900 text-[10px] font-bold">
                      3x3 & 4x4
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">
                    Exercite a coordenação, estratégia e raciocínio sequencial
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-cyan-600 group-hover:translate-x-0.5 transition shrink-0" />
            </div>
          </button>

          {/* 4. Corrida de Carros 2D */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onSelectChallenge('car_racing');
            }}
            className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-400 hover:shadow-md transition group active:scale-[0.99] shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center text-xl font-bold shadow-xs shrink-0">
                  🏎️
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Corrida de Carros 2D</h3>
                    <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[10px] font-bold">
                      Ação & Reflexo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">
                    Desvie dos carros rivais na pista usando as setas ou botões de direção
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-0.5 transition shrink-0" />
            </div>
          </button>
        </div>
      </div>

      {/* SELETOR DE DIFICULDADE (FÁCIL, MÉDIO, DIFÍCIL) */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
              Dificuldade das Batalhas
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            {currentDiff.pointsBonus}
          </span>
        </div>

        {/* 3 Difficulty Segment Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {difficulties.map((diff) => {
            const isSelected = selectedDifficulty === diff.id;
            return (
              <button
                key={diff.id}
                onClick={() => {
                  soundEffects.playClick();
                  onSelectDifficulty(diff.id);
                }}
                className={`py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition border ${
                  isSelected
                    ? diff.activeClasses
                    : `${diff.colorClasses} font-semibold`
                }`}
              >
                <span>{diff.badge}</span>
                <span className="truncate">{diff.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Challenge Cards Grid */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-wide">
          <Swords className="w-4 h-4 text-amber-600" />
          <span>Desafios Escolares & Batalhas</span>
        </div>

        {/* 1. Xadrez (Normal & Multiplayer) */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onSelectChallenge('chess');
          }}
          className="w-full text-left p-3 rounded-2xl bg-white border border-amber-300 hover:border-amber-500 hover:shadow-md transition group relative overflow-hidden active:scale-[0.99] shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-xl font-bold border border-amber-300 shrink-0">
                ♟️
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Desafio de Xadrez</h3>
                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                    Solo & Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Xadrez vs Robô ({currentDiff.label}) e Multiplayer
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition shrink-0" />
          </div>
        </button>

        {/* 2. Matemática (Normal & Multiplayer) */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onSelectChallenge('math');
          }}
          className="w-full text-left p-3 rounded-2xl bg-white border border-cyan-300 hover:border-cyan-500 hover:shadow-md transition group relative overflow-hidden active:scale-[0.99] shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-900 flex items-center justify-center text-xl font-bold border border-cyan-300 shrink-0">
                ➗
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Desafio de Matemática</h3>
                  <span className="px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 text-[10px] font-bold border border-cyan-200">
                    Solo & Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Contas rápidas e Batalhas de Velocidade
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition shrink-0" />
          </div>
        </button>

        {/* 3. Competições Gerais de Todas as Matérias */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Users className="w-4 h-4 text-rose-600" />
            <span>Competições Gerais de Todas as Matérias</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundEffects.playClick();
                onSelectChallenge('competition');
              }}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-left transition shadow-xs"
            >
              <span className="text-xs font-bold text-slate-900 block mb-0.5">Local (1-5 Pessoas)</span>
              <span className="text-[10px] text-slate-500 block">Mesmo celular</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                onSelectChallenge('multiplayer');
              }}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-left transition shadow-xs"
            >
              <span className="text-xs font-bold text-slate-900 block mb-0.5">Multiplayer Geral</span>
              <span className="text-[10px] text-slate-500 block">Salas online</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
