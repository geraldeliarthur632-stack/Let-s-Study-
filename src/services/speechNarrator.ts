export interface NarrationSegment {
  text: string;
  charStart?: number;
  charEnd?: number;
}

export const APP_INTRO_SEGMENTS: { text: string }[] = [
  {
    text: "Olá estudante! Bem-vindo ao Let's Study, seu aplicativo inteligente de estudos escolares e desafios do conhecimento!",
  },
  {
    text: "A IA interna explica cada matéria com texto e voz clara antes de você responder às perguntas de fixação.",
  },
  {
    text: "Pratique com 10 questões perfeitas: 5 questões de revisão da série anterior e 5 questões da sua série atual.",
  },
  {
    text: "Explore Flashcards interativos e a Central de Jogos com Caça-Palavras, Palavras Cruzadas, Quebra-Cabeça e Xadrez!",
  },
];

export const APP_INTRO_TEXT = APP_INTRO_SEGMENTS.map(s => s.text).join(' ');

class SpeechNarratorService {
  private utterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        this.loadVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    } catch {
      // Ignored for iframe sandbox
    }
  }

  private loadVoices() {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        this.voices = window.speechSynthesis.getVoices() || [];
      }
    } catch {
      this.voices = [];
    }
  }

  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onBoundary?: (charIndex: number) => void
  ) {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) {
        onStart?.();
        setTimeout(() => onEnd?.(), 10000);
        return;
      }

      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      this.utterance = utterance;

      const ptVoices = this.voices.filter((v) => v.lang && (v.lang.startsWith('pt-BR') || v.lang.startsWith('pt')));
      if (ptVoices.length > 0) {
        const bestVoice =
          ptVoices.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Luciana')) ||
          ptVoices[0];
        utterance.voice = bestVoice;
      }

      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        onEnd?.();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        onEnd?.();
      };

      if (onBoundary) {
        utterance.onboundary = (event) => {
          onBoundary(event.charIndex);
        };
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      this.isSpeaking = false;
      onEnd?.();
    }
  }

  // English speech pronunciation helper
  public speakEnglish(text: string) {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) return;
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      const enVoices = this.voices.filter((v) => v.lang && (v.lang.startsWith('en-US') || v.lang.startsWith('en')));
      if (enVoices.length > 0) {
        utterance.voice = enVoices[0];
      }
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignored
    }
  }

  public stop() {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        this.isSpeaking = false;
      }
    } catch {
      this.isSpeaking = false;
    }
  }

  public pause() {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.pause();
      }
    } catch {}
  }

  public resume() {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.resume();
      }
    } catch {}
  }

  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechNarrator = new SpeechNarratorService();
