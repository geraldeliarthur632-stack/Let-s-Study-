import React, { useState, useEffect, useRef } from 'react';
import { speechNarrator, APP_INTRO_TEXT, APP_INTRO_SEGMENTS } from '../services/speechNarrator';
import { soundEffects } from '../services/soundEffects';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles, CheckCircle2, Headphones } from 'lucide-react';

interface IntroNarratorModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const IntroNarratorModal: React.FC<IntroNarratorModalProps> = ({ isOpen, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSec, setCurrentSec] = useState<number>(0);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Auto-start audio narration when opened
      startNarration();
    } else {
      stopNarration();
    }
    return () => {
      stopNarration();
    };
  }, [isOpen]);

  const startNarration = () => {
    stopNarration();
    setIsPlaying(true);
    setCurrentSec(0);
    setActiveSegmentIndex(0);

    // Compute character boundaries for segments
    let runningCharIndex = 0;
    const segmentBounds = APP_INTRO_SEGMENTS.map((seg) => {
      const start = runningCharIndex;
      runningCharIndex += seg.text.length + 1;
      return { start, end: runningCharIndex };
    });

    speechNarrator.speak(
      APP_INTRO_TEXT,
      () => {
        setIsPlaying(true);
        // Only start timer when speech audio actually starts playing
        const startTime = Date.now();
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setCurrentSec(elapsed);
        }, 300);
      },
      () => {
        setIsPlaying(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      },
      (charIndex: number) => {
        // Find segment precisely matching spoken character index
        const idx = segmentBounds.findIndex(
          (b) => charIndex >= b.start && charIndex < b.end
        );
        if (idx !== -1) {
          setActiveSegmentIndex(idx);
        }
      }
    );
  };

  const togglePlayPause = () => {
    soundEffects.playClick();
    if (isPlaying) {
      speechNarrator.stop();
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      startNarration();
    }
  };

  const stopNarration = () => {
    speechNarrator.stop();
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleFinish = () => {
    stopNarration();
    soundEffects.playClick();
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-xs font-semibold">
            <Headphones className="w-3.5 h-3.5" />
            <span>Guia de Boas-Vindas em Áudio (28s)</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            0:{currentSec.toString().padStart(2, '0')} / 0:28
          </span>
        </div>

        {/* Audio Waveform Player Bar */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3.5 mb-4 flex items-center justify-between gap-3 shadow-inner">
          <button
            onClick={togglePlayPause}
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-white transition shadow-md shrink-0 ${
              isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'
            }`}
            title={isPlaying ? 'Pausar Áudio' : 'Ouvir Narração'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
          </button>

          {/* Sound wave visualizer */}
          <div className="flex-1 flex items-center justify-center gap-1.5 h-8 px-2 bg-zinc-900/90 rounded-lg border border-zinc-800/80">
            {isPlaying ? (
              <>
                <div className="w-1.5 bg-blue-400 rounded-full audio-bar-1" />
                <div className="w-1.5 bg-blue-300 rounded-full audio-bar-2" />
                <div className="w-1.5 bg-blue-500 rounded-full audio-bar-3" />
                <div className="w-1.5 bg-indigo-400 rounded-full audio-bar-4" />
                <div className="w-1.5 bg-purple-400 rounded-full audio-bar-5" />
                <div className="w-1.5 bg-blue-400 rounded-full audio-bar-2" />
                <div className="w-1.5 bg-cyan-400 rounded-full audio-bar-1" />
              </>
            ) : (
              <div className="flex items-center gap-1">
                <Volume2 className="w-4 h-4 text-zinc-500" />
                <span className="text-[11px] text-zinc-500">Clique para reproduzir a narração</span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              startNarration();
            }}
            className="p-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition"
            title="Reiniciar Narração"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Synchronized Transcription Box */}
        <div className="flex-1 overflow-y-auto bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 mb-4 space-y-2.5 text-xs text-zinc-300">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Transcrição Oficial do Áudio</span>
          </div>

          {APP_INTRO_SEGMENTS.map((segment, index) => {
            const isActive = isPlaying && activeSegmentIndex === index;
            return (
              <div
                key={index}
                className={`p-2.5 rounded-xl transition duration-200 border ${
                  isActive
                    ? 'bg-blue-950/50 border-blue-500/50 text-blue-100 font-medium'
                    : 'bg-zinc-900/40 border-transparent text-zinc-400'
                }`}
              >
                <p className="leading-relaxed">{segment.text}</p>
              </div>
            );
          })}
        </div>

        {/* Start Button */}
        <button
          onClick={handleFinish}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Começar a Estudar & Jogar</span>
        </button>
      </div>
    </div>
  );
};
