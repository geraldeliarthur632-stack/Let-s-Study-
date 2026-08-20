import React, { useState, useEffect, useMemo } from 'react';
import { Flashcard, FlashcardDeck, GradeLevel, SubjectId, UserProfile } from '../../types';
import { SUBJECTS, GRADE_LABELS, getSubjectsForGrade } from '../../data/curriculumData';
import {
  loadAllDecks,
  saveCustomDeck,
  deleteCustomDeck,
  loadFlashcardProgress,
  updateCardProgress,
  UserFlashcardProgress,
} from '../../data/flashcardsData';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import {
  ArrowLeft,
  Sparkles,
  Plus,
  RotateCw,
  Volume2,
  VolumeX,
  Lightbulb,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Shuffle,
  Trash2,
  Layers,
  Award,
  BookOpen,
  ChevronRight,
  Search,
  Filter,
  Check,
  Flame,
} from 'lucide-react';

export const SUBJECT_EMOJIS: Record<SubjectId, { name: string; icon: string }> = {
  matematica: { name: 'Matemática', icon: '🔢' },
  portugues: { name: 'Português', icon: '📚' },
  ciencias: { name: 'Ciências', icon: '🔬' },
  historia: { name: 'História', icon: '🏛️' },
  geografia: { name: 'Geografia', icon: '🌍' },
  fisica: { name: 'Física', icon: '⚡' },
  quimica: { name: 'Química', icon: '🧪' },
  biologia: { name: 'Biologia', icon: '🧬' },
  ingles: { name: 'Inglês', icon: '🇬🇧' },
};

interface FlashcardsModeProps {
  user: UserProfile;
  onBack: () => void;
  onEarnPoints: (points: number, isChallengeCompleted?: boolean) => void;
}

export const FlashcardsMode: React.FC<FlashcardsModeProps> = ({
  user,
  onBack,
  onEarnPoints,
}) => {
  // Decks & Progress State
  const [decks, setDecks] = useState<FlashcardDeck[]>(() => loadAllDecks());
  const [progress, setProgress] = useState<UserFlashcardProgress>(() => loadFlashcardProgress());
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [filterGrade, setFilterGrade] = useState<GradeLevel | 'all'>(user.grade || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Study Session State
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [sessionScore, setSessionScore] = useState<{ mastered: string[]; review: string[] }>({
    mastered: [],
    review: [],
  });
  const [isSessionFinished, setIsSessionFinished] = useState<boolean>(false);
  const [earnedXpInSession, setEarnedXpInSession] = useState<number>(0);

  // AI Modal & Custom Deck Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiSubject, setAiSubject] = useState<SubjectId>('matematica');
  const [aiCount, setAiCount] = useState<number>(6);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Manual Deck Form State
  const [manualTitle, setManualTitle] = useState('');
  const [manualSubject, setManualSubject] = useState<SubjectId>('matematica');
  const [manualDescription, setManualDescription] = useState('');
  const [manualCards, setManualCards] = useState<
    Array<{ question: string; answer: string; hint: string; category: string }>
  >([{ question: '', answer: '', hint: '', category: 'Conceito' }]);

  // Refresh decks from storage
  const reloadDecks = () => {
    setDecks(loadAllDecks());
    setProgress(loadFlashcardProgress());
  };

  const allowedSubjects = useMemo(() => {
    return getSubjectsForGrade(user.grade || '6_fund');
  }, [user.grade]);

  // Filtered Decks List
  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      const matchSubject = selectedSubject === 'all' || deck.subjectId === selectedSubject;
      const matchGrade = filterGrade === 'all' || deck.grade === filterGrade;
      const matchSearch =
        searchQuery.trim() === '' ||
        deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchGrade && matchSearch;
    });
  }, [decks, selectedSubject, filterGrade, searchQuery]);

  // Start studying a deck
  const handleStartDeck = (deck: FlashcardDeck) => {
    soundEffects.playClick();
    setActiveDeck(deck);
    setSessionCards([...deck.cards]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setSessionScore({ mastered: [], review: [] });
    setIsSessionFinished(false);
    setEarnedXpInSession(0);
  };

  // Shuffle current deck
  const handleShuffle = () => {
    soundEffects.playClick();
    const shuffled = [...sessionCards].sort(() => Math.random() - 0.5);
    setSessionCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  // Flip card
  const handleFlipCard = () => {
    soundEffects.playClick();
    setIsFlipped(!isFlipped);
  };

  // Speak text with speech narrator
  const handleSpeak = (text: string) => {
    soundEffects.playClick();
    speechNarrator.speak(text);
  };

  // Mark card result
  const handleCardResult = (status: 'mastered' | 'learning') => {
    const currentCard = sessionCards[currentIndex];
    if (!currentCard) return;

    if (status === 'mastered') {
      soundEffects.playCorrect();
      updateCardProgress(currentCard.id, true);
      setSessionScore((prev) => ({
        ...prev,
        mastered: [...prev.mastered.filter((id) => id !== currentCard.id), currentCard.id],
      }));
      setEarnedXpInSession((prev) => prev + 5);
      onEarnPoints(5);
    } else {
      soundEffects.playError();
      updateCardProgress(currentCard.id, false);
      setSessionScore((prev) => ({
        ...prev,
        review: [...prev.review.filter((id) => id !== currentCard.id), currentCard.id],
      }));
    }

    // Advance to next card or finish
    if (currentIndex + 1 < sessionCards.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    } else {
      soundEffects.playVictory();
      setIsSessionFinished(true);
      onEarnPoints(20, true); // Bonus completion XP
      setEarnedXpInSession((prev) => prev + 20);
      setProgress(loadFlashcardProgress());
    }
  };

  // Restart reviewing only missed cards
  const handleReviewMistakes = () => {
    soundEffects.playClick();
    const mistakesCards = sessionCards.filter((card) =>
      sessionScore.review.includes(card.id)
    );
    if (mistakesCards.length > 0) {
      setSessionCards(mistakesCards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setShowHint(false);
      setSessionScore({ mastered: [], review: [] });
      setIsSessionFinished(false);
    }
  };

  // Delete custom deck
  const handleDeleteDeck = (e: React.MouseEvent, deckId: string) => {
    e.stopPropagation();
    soundEffects.playClick();
    if (window.confirm('Deseja excluir este baralho personalizado?')) {
      deleteCustomDeck(deckId);
      reloadDecks();
    }
  };

  // Generate Deck with AI
  const handleGenerateAiDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) {
      setAiError('Digite o tema que deseja estudar.');
      soundEffects.playError();
      return;
    }

    setIsGeneratingAi(true);
    setAiError(null);
    soundEffects.playClick();

    try {
      const response = await fetch('/api/ai/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: user.grade || '6_fund',
          subject: aiSubject,
          topic: aiTopic.trim(),
          count: aiCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar flashcards com IA');
      }

      const data = await response.json();
      if (!data.cards || !Array.isArray(data.cards) || data.cards.length === 0) {
        throw new Error('Formato de resposta inválido');
      }

      const newDeck: FlashcardDeck = {
        id: `ai_deck_${Date.now()}`,
        subjectId: aiSubject,
        grade: user.grade || '6_fund',
        title: data.title || `Flashcards de ${aiTopic.trim()}`,
        description: data.description || `Baralho gerado por IA sobre ${aiTopic.trim()}`,
        icon: SUBJECT_EMOJIS[aiSubject]?.icon || '✨',
        cards: (Array.isArray(data.cards) ? data.cards : []).map((c: any, index: number) => ({
          id: `ai_card_${Date.now()}_${index}`,
          subjectId: aiSubject,
          grade: user.grade || '6_fund',
          topic: c.topic || aiTopic.trim(),
          question: c.question,
          answer: c.answer,
          hint: c.hint,
          category: c.category || 'Conceito-Chave',
          isCustom: true,
        })),
        isCustom: true,
        color: 'from-purple-600 to-indigo-700',
      };

      saveCustomDeck(newDeck);
      reloadDecks();
      setIsAiModalOpen(false);
      setAiTopic('');
      soundEffects.playVictory();
      handleStartDeck(newDeck);
    } catch (err: any) {
      console.error(err);
      setAiError('Não foi possível gerar no momento. Tente outro tema ou crie manualmente.');
      soundEffects.playError();
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Save manual deck
  const handleSaveManualDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) {
      alert('Digite o título do baralho.');
      return;
    }

    const validCards = manualCards.filter((c) => c.question.trim() && c.answer.trim());
    if (validCards.length === 0) {
      alert('Adicione pelo menos 1 cartão com pergunta e resposta.');
      return;
    }

    const newDeck: FlashcardDeck = {
      id: `custom_deck_${Date.now()}`,
      subjectId: manualSubject,
      grade: user.grade || '6_fund',
      title: manualTitle.trim(),
      description: manualDescription.trim() || 'Baralho personalizado de estudos.',
      icon: SUBJECT_EMOJIS[manualSubject]?.icon || '🗂️',
      cards: validCards.map((c, idx) => ({
        id: `manual_card_${Date.now()}_${idx}`,
        subjectId: manualSubject,
        grade: user.grade || '6_fund',
        topic: manualTitle.trim(),
        question: c.question.trim(),
        answer: c.answer.trim(),
        hint: c.hint.trim() || undefined,
        category: c.category.trim() || 'Geral',
        isCustom: true,
      })),
      isCustom: true,
      color: 'from-blue-600 to-indigo-700',
    };

    saveCustomDeck(newDeck);
    reloadDecks();
    setIsManualModalOpen(false);
    setManualTitle('');
    setManualDescription('');
    setManualCards([{ question: '', answer: '', hint: '', category: 'Conceito' }]);
    soundEffects.playVictory();
    handleStartDeck(newDeck);
  };

  // ================= VIEW: ACTIVE STUDYING SESSION =================
  if (activeDeck) {
    const currentCard = sessionCards[currentIndex];
    const progressPercent = Math.round(((currentIndex + 1) / sessionCards.length) * 100);

    return (
      <div className="flex-1 flex flex-col bg-slate-900 text-white select-none">
        {/* Top Study Bar */}
        <header className="bg-slate-950/80 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-2 sticky top-0 z-20 backdrop-blur-md">
          <button
            onClick={() => {
              soundEffects.playClick();
              speechNarrator.stop();
              setActiveDeck(null);
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sair</span>
          </button>

          <div className="text-center min-w-0 flex-1">
            <h3 className="text-xs font-black text-white truncate">{activeDeck.title}</h3>
            <span className="text-[10px] text-blue-400 font-bold">
              Cartão {currentIndex + 1} de {sessionCards.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShuffle}
              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
              title="Embaralhar Cartões"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-400 text-xs font-bold">
              <Flame className="w-3.5 h-3.5" />
              <span>+{earnedXpInSession} XP</span>
            </div>
          </div>
        </header>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Study Content Body */}
        <div className="flex-1 flex flex-col justify-between p-4 max-w-md mx-auto w-full">
          {!isSessionFinished ? (
            <>
              {/* THE 3D FLIP CARD */}
              <div className="flex-1 flex flex-col justify-center my-2">
                <div
                  onClick={handleFlipCard}
                  className={`cursor-pointer w-full min-h-[300px] sm:min-h-[340px] rounded-3xl p-6 transition-all duration-500 shadow-2xl flex flex-col justify-between relative border ${
                    isFlipped
                      ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border-indigo-500/60 shadow-indigo-500/10'
                      : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-700 shadow-black/40'
                  } active:scale-[0.99]`}
                >
                  {/* Card Header Tag & Category */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isFlipped
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}
                      >
                        {isFlipped ? '✨ Resposta' : '❓ Pergunta'}
                      </span>
                      {currentCard?.category && (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                          {currentCard.category}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(isFlipped ? currentCard.answer : currentCard.question);
                      }}
                      className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white transition"
                      title="Ouvir em Voz Alta"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Body: Question or Answer */}
                  <div className="my-auto py-4 text-center">
                    {!isFlipped ? (
                      <div>
                        <span className="text-xs text-blue-400 font-bold block mb-2">
                          {currentCard?.topic}
                        </span>
                        <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                          {currentCard?.question}
                        </h2>
                      </div>
                    ) : (
                      <div className="animate-in fade-in zoom-in-95 duration-200">
                        <span className="text-xs text-emerald-400 font-bold block mb-2">
                          Explicação Resumida:
                        </span>
                        <p className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed whitespace-pre-line">
                          {currentCard?.answer}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Hint & Flip Prompt */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/60">
                    {currentCard?.hint && !isFlipped && (
                      <div>
                        {showHint ? (
                          <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-xs text-left animate-in fade-in">
                            <span className="font-bold block mb-0.5">💡 Dica:</span>
                            {currentCard.hint}
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              soundEffects.playClick();
                              setShowHint(true);
                            }}
                            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1 mx-auto py-1"
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>Ver dica</span>
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                      <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                      <span>Toque no cartão para virar</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Feedback Buttons */}
              <div className="space-y-2 pt-2">
                {!isFlipped ? (
                  <button
                    onClick={handleFlipCard}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition active:scale-95"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Virar Cartão para Ver Resposta</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleCardResult('learning')}
                      className="py-3 px-3 bg-rose-950/60 hover:bg-rose-900 border border-rose-600/60 text-rose-200 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Preciso Rever</span>
                    </button>

                    <button
                      onClick={() => handleCardResult('mastered')}
                      className="py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-emerald-600/30"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Dominado! (+5 XP)</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // ================= SESSION COMPLETED SCREEN =================
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-5 animate-in zoom-in-95">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/30 animate-bounce">
                🏆
              </div>

              <div>
                <h2 className="text-xl font-black text-white">Baralho Concluído!</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Excelente revisão de {activeDeck.title}
                </p>
              </div>

              {/* Stats Box */}
              <div className="w-full bg-slate-950/70 border border-slate-800 rounded-3xl p-4 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-900 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Total Cards
                  </span>
                  <span className="text-lg font-black text-white">{sessionCards.length}</span>
                </div>
                <div className="p-2 bg-emerald-950/50 border border-emerald-500/30 rounded-2xl">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                    Dominados
                  </span>
                  <span className="text-lg font-black text-emerald-400">
                    {sessionScore.mastered.length}
                  </span>
                </div>
                <div className="p-2 bg-amber-950/50 border border-amber-500/30 rounded-2xl">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block">
                    XP Ganho
                  </span>
                  <span className="text-lg font-black text-amber-400">
                    +{earnedXpInSession}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-2">
                {sessionScore.review.length > 0 && (
                  <button
                    onClick={handleReviewMistakes}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Revisar {sessionScore.review.length} Cartões com Dúvida</span>
                  </button>
                )}

                <button
                  onClick={() => handleStartDeck(activeDeck)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Reiniciar Baralho Completo</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveDeck(null);
                  }}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition active:scale-95"
                >
                  Voltar para Lista de Baralhos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= VIEW: DECK SELECTION & EXPLORER =================
  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-2 sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              soundEffects.playClick();
              onBack();
            }}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            aria-label="Voltar para a tela principal"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Flashcards de Estudo</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                Revisão Ativa
              </span>
            </h1>
            <p className="text-[10px] text-slate-500">
              Cartões rápidos de pergunta e resposta com voz
            </p>
          </div>
        </div>

        {/* Action Buttons: AI Deck & Manual Deck */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsAiModalOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gerar com IA</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 p-4 space-y-3.5 max-w-md mx-auto w-full">
        {/* Search and Filters */}
        <div className="space-y-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tema ou palavra-chave..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
            />
          </div>

          {/* Grade & Subject Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => {
                soundEffects.playClick();
                setSelectedSubject('all');
              }}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition text-[11px] ${
                selectedSubject === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Todas Matérias
            </button>
            {allowedSubjects.map((subj) => {
              const info = SUBJECT_EMOJIS[subj.id] || { name: subj.name, icon: '📖' };
              return (
                <button
                  key={subj.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedSubject(subj.id);
                  }}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1 text-[11px] ${
                    selectedSubject === subj.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{info.icon}</span>
                  <span>{info.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Add Custom Deck Banner */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shrink-0">
              🗂️
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-900 truncate">
                Crie seus Próprios Flashcards
              </h4>
              <p className="text-[10px] text-slate-600 line-clamp-1">
                Adicione perguntas de provas ou temas do seu caderno
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsManualModalOpen(true);
            }}
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 transition active:scale-95 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar</span>
          </button>
        </div>

        {/* Decks Grid List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700">
              Baralhos Disponíveis ({filteredDecks.length})
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              Série: {GRADE_LABELS[user.grade]?.short || 'Geral'}
            </span>
          </div>

          {filteredDecks.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-xs">
              <span className="text-3xl block">🔍</span>
              <h4 className="text-xs font-bold text-slate-800">
                Nenhum baralho encontrado com esses filtros
              </h4>
              <p className="text-[11px] text-slate-500">
                Experimente gerar um baralho novinho usando a IA!
              </p>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl mx-auto"
              >
                Gerar com IA
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {filteredDecks.map((deck) => {
                // Calculate deck mastery stats
                const totalCards = deck.cards.length;
                const masteredCount = deck.cards.filter(
                  (c) => progress[c.id]?.status === 'mastered' || progress[c.id]?.status === 'known'
                ).length;
                const percent = Math.round((masteredCount / (totalCards || 1)) * 100);

                return (
                  <div
                    key={deck.id}
                    onClick={() => handleStartDeck(deck)}
                    className="p-3.5 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-blue-300 rounded-2xl transition cursor-pointer shadow-xs group active:scale-[0.99] flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl shrink-0 shadow-xs group-hover:scale-105 transition">
                          {deck.icon || '🗂️'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-extrabold text-xs text-slate-900 truncate">
                              {deck.title}
                            </span>
                            {deck.isCustom && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                                Criado
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {deck.description}
                          </p>
                        </div>
                      </div>

                      {deck.isCustom && (
                        <button
                          onClick={(e) => handleDeleteDeck(e, deck.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          title="Excluir Baralho"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Progress bar and card count */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 text-[10px]">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-600 shrink-0">{percent}%</span>
                      </div>

                      <div className="flex items-center gap-1 text-blue-600 font-bold shrink-0">
                        <Layers className="w-3 h-3" />
                        <span>{totalCards} cartões</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL: GERAR COM IA ================= */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Gerar Baralho com IA</h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleGenerateAiDeck} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Matéria Escolar</label>
                <select
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value as SubjectId)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-purple-500"
                >
                  {allowedSubjects.map((subj) => {
                    const info = SUBJECT_EMOJIS[subj.id] || { name: subj.name, icon: '📖' };
                    return (
                      <option key={subj.id} value={subj.id}>
                        {info.icon} {info.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Tema ou Conteúdo Desejado
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ex: Equações de 1º grau, Reino Animal, Verbos..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Quantidade de Cartões</label>
                <div className="grid grid-cols-3 gap-2">
                  {[4, 6, 8].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setAiCount(count)}
                      className={`py-1.5 rounded-xl font-bold transition ${
                        aiCount === count
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {count} Cards
                    </button>
                  ))}
                </div>
              </div>

              {aiError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px]">
                  {aiError}
                </div>
              )}

              <button
                type="submit"
                disabled={isGeneratingAi}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Criando Baralho com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Gerar Baralho Agora</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CRIAR MANUALMENTE ================= */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-sm text-slate-900">Novo Baralho Manual</h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSaveManualDeck} className="space-y-3 text-xs overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Título do Baralho</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Ex: Minhas fórmulas de Física"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Matéria</label>
                <select
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value as SubjectId)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {allowedSubjects.map((subj) => {
                    const info = SUBJECT_EMOJIS[subj.id] || { name: subj.name, icon: '📖' };
                    return (
                      <option key={subj.id} value={subj.id}>
                        {info.icon} {info.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Dynamic cards list */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800">
                    Cartões ({manualCards.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setManualCards((prev) => [
                        ...prev,
                        { question: '', answer: '', hint: '', category: 'Conceito' },
                      ])
                    }
                    className="text-blue-600 font-bold text-[11px] flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar Card</span>
                  </button>
                </div>

                {manualCards.map((card, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-slate-700">Card #{idx + 1}</span>
                      {manualCards.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setManualCards((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={card.question}
                      onChange={(e) => {
                        const updated = [...manualCards];
                        updated[idx].question = e.target.value;
                        setManualCards(updated);
                      }}
                      placeholder="Pergunta (Frente)"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      required
                    />
                    <textarea
                      value={card.answer}
                      onChange={(e) => {
                        const updated = [...manualCards];
                        updated[idx].answer = e.target.value;
                        setManualCards(updated);
                      }}
                      placeholder="Resposta (Verso)"
                      rows={2}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs resize-none"
                      required
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl shadow-lg transition active:scale-95 shrink-0"
              >
                Salvar Baralho
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
