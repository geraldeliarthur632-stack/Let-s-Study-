import React, { useState, useEffect, useRef } from 'react';
import { GradeLevel, Question, SubjectId, TopicLesson, UserProfile } from '../../types';
import {
  GRADE_LABELS,
  SUBJECTS,
  getSubjectsForGrade,
  getFallbackLesson,
  getGradeAndRevisionQuestions,
  shuffleQuestionOptions,
} from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import { VoiceAnswerController } from '../VoiceAnswerController';
import { AudioRecommendationModal } from '../AudioRecommendationModal';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight,
  Calculator,
  Atom,
  Hourglass,
  Globe,
  Award,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Bot,
  Zap,
  FlaskConical,
  Dna,
  Loader2,
  BrainCircuit,
  Search,
  Languages,
  Target,
  Compass,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface JourneyModeProps {
  user: UserProfile;
  onBack: () => void;
  onAnswerCorrect: () => void;
  onFinishLesson: (correctCount: number) => void;
  onSelectRecommendation?: (subjectId: SubjectId, mode?: 'journey' | 'flashcards') => void;
}

type JourneyFlowStep =
  | 'subject_select'
  | 'revision_intro'
  | 'quiz_revision'
  | 'grade_intro'
  | 'quiz_grade'
  | 'summary';

interface StudyRecommendation {
  type: 'reinforce' | 'advance';
  targetSubject: SubjectId;
  headline: string;
  advice: string;
  actionType: 'flashcards' | 'new_subject';
}

export const JourneyMode: React.FC<JourneyModeProps> = ({
  user,
  onBack,
  onAnswerCorrect,
  onFinishLesson,
  onSelectRecommendation,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | null>(null);
  const [currentStep, setCurrentStep] = useState<JourneyFlowStep>('subject_select');
  const [activeLesson, setActiveLesson] = useState<TopicLesson | null>(null);
  
  // Question navigation
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  
  // Performance tracking
  const [sessionCorrectCount, setSessionCorrectCount] = useState<number>(0);
  const [revisionCorrectCount, setRevisionCorrectCount] = useState<number>(0);
  const [gradeCorrectCount, setGradeCorrectCount] = useState<number>(0);
  const [answersHistory, setAnswersHistory] = useState<{ isCorrect: boolean; question: Question; phase: 'revision' | 'grade' }[]>([]);

  // Fast AI generation states
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string>('');
  const [isAIGenerated, setIsAIGenerated] = useState<boolean>(false);

  // Speech narration states
  const [isSpeakingPhase, setIsSpeakingPhase] = useState<boolean>(false);
  const [autoSpeakQuestions, setAutoSpeakQuestions] = useState<boolean>(true);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState<boolean>(false);

  // Intelligent Recommendation
  const [recommendation, setRecommendation] = useState<StudyRecommendation | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState<boolean>(false);

  // Audio / Headphone recommendation modal
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);
  const [pendingSubjectId, setPendingSubjectId] = useState<SubjectId | null>(null);

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      speechNarrator.stop();
    };
  }, []);

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator':
        return <Calculator className="w-5 h-5 text-amber-500" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'Atom':
        return <Atom className="w-5 h-5 text-emerald-500" />;
      case 'Hourglass':
        return <Hourglass className="w-5 h-5 text-rose-500" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-cyan-500" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-violet-500" />;
      case 'FlaskConical':
        return <FlaskConical className="w-5 h-5 text-pink-500" />;
      case 'Dna':
        return <Dna className="w-5 h-5 text-teal-500" />;
      case 'Languages':
        return <Languages className="w-5 h-5 text-sky-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-blue-500" />;
    }
  };

  // Helper to generate local recommendation fast
  const computeLocalRecommendation = (
    subj: SubjectId,
    revCorrect: number,
    grdCorrect: number
  ): StudyRecommendation => {
    const totalCorrect = revCorrect + grdCorrect;
    const availableSubjects = getSubjectsForGrade(user.grade);

    // If student missed more than 1 in revision or 2 in grade, reinforce
    if (revCorrect <= 3 || grdCorrect <= 3) {
      const subjObj = SUBJECTS.find((s) => s.id === subj);
      const subjName = subjObj?.name || 'esta matéria';
      return {
        type: 'reinforce',
        targetSubject: subj,
        headline: `Reforço Recomendado em ${subjName}`,
        advice: `Percebemos algumas dúvidas nos exercícios. Recomendamos reforçar os conceitos de ${subjName} com os Flashcards interativos ou refazer a prática!`,
        actionType: 'flashcards',
      };
    }

    // Otherwise, recommend another subject from the allowed grade subjects
    const nextCandidates = availableSubjects.filter((s) => s.id !== subj).map((s) => s.id);
    const nextSubject = nextCandidates[Math.floor(Math.random() * nextCandidates.length)] || 'ingles';
    const nextSubjObj = SUBJECTS.find((s) => s.id === nextSubject);
    const nextSubjName = nextSubjObj?.name || 'Língua Inglesa';

    return {
      type: 'advance',
      targetSubject: nextSubject,
      headline: `Excelente! Recomendamos Estudar: ${nextSubjName}`,
      advice: `Você dominou a aula com ${totalCorrect}/10 acertos! Para manter seus estudos equilibrados na BNCC, que tal praticar ${nextSubjName} agora?`,
      actionType: 'new_subject',
    };
  };

  const handleTriggerSelectSubject = (subjectId: SubjectId) => {
    soundEffects.playClick();
    try {
      const isDismissed = localStorage.getItem('estudahud_audio_tip_dismissed') === 'true';
      if (isDismissed) {
        handleSelectSubject(subjectId);
        return;
      }
    } catch {}
    setPendingSubjectId(subjectId);
    setIsAudioModalOpen(true);
  };

  const handleSelectSubject = async (subjectId: SubjectId) => {
    soundEffects.playClick();
    speechNarrator.stop();
    setIsSpeakingPhase(false);
    setSelectedSubject(subjectId);

    const subjInfo = SUBJECTS.find((s) => s.id === subjectId);
    const subjectName = subjInfo?.name || 'Estudos';

    setIsLoadingAI(true);
    setAiStatusMessage(
      `A IA está preparando sua aula de ${subjectName} para o ${GRADE_LABELS[user.grade].short}...`
    );

    let generatedLesson: TopicLesson | null = null;

    // Fast AI fetch with 4.5s strict timeout to keep latency within 5-7 seconds
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch('/api/ai/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          grade: user.grade,
          subject: subjectName,
          userName: user.name,
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.title && Array.isArray(data.practiceQuestions) && data.practiceQuestions.length >= 10) {
          generatedLesson = {
            id: data.id || `ai_lesson_${subjectId}_${Date.now()}`,
            subject: subjectId,
            grade: user.grade,
            revisionTitle: data.revisionTitle || `Revisão: Fundamentos de ${subjectName}`,
            revisionSummary:
              data.revisionSummary ||
              `Vamos revisar os conceitos essenciais da série anterior para aquecer seu raciocínio antes das 5 perguntas de revisão.`,
            revisionKeyPoints: data.revisionKeyPoints || [
              'Conceitos fundamentais da base',
              'Operações e vocabulário chave',
              'Aquecimento com 5 questões de revisão',
            ],
            revisionExample: data.revisionExample || 'Relembrar a base facilita o aprendizado do novo conteúdo.',
            title: data.title,
            summary: data.summary,
            keyPoints: data.keyPoints || [],
            example: data.example || '',
            practiceQuestions: data.practiceQuestions.slice(0, 10).map((q: Question, idx: number) => ({
              ...q,
              id: q.id || `ai_q_${idx}`,
              subject: subjectId,
              grade: user.grade,
              gradeOriginLabel:
                q.gradeOriginLabel ||
                (idx < 5 ? 'Revisão da Base' : `Conteúdo: ${GRADE_LABELS[user.grade].short}`),
            })),
          };
          setIsAIGenerated(true);
        }
      }
    } catch (_err) {
      // Fallback is instant and BNCC aligned
    }

    // 2. If AI took > 4.5s or failed, use instant rich curated curriculum
    if (!generatedLesson) {
      generatedLesson = getFallbackLesson(user.grade, subjectId);
      setIsAIGenerated(false);
    }

    setIsLoadingAI(false);
    setActiveLesson(generatedLesson);
    setCurrentStep('revision_intro');

    // Automatically speak the revision phase explanation
    setTimeout(() => {
      speakRevisionPhase(generatedLesson!);
    }, 400);
  };

  // Speaks Phase 1: Revision explanation
  const speakRevisionPhase = (lesson: TopicLesson) => {
    const revTitle = lesson.revisionTitle || `Revisão dos Fundamentos de ${lesson.subject}`;
    const revSummary = lesson.revisionSummary || lesson.summary || '';
    const pointsArr = Array.isArray(lesson.revisionKeyPoints) && lesson.revisionKeyPoints.length > 0
      ? lesson.revisionKeyPoints
      : (Array.isArray(lesson.keyPoints) ? lesson.keyPoints : []);
    const revPoints = pointsArr.slice(0, 3).join('. ');
    const revEx = lesson.revisionExample || lesson.example || '';

    const speechText = `Fase 1: Revisão dos Conteúdos de Base. ${revTitle}. ${revSummary}. Pontos de revisão: ${revPoints}. Exemplo: ${revEx}. Toque no botão abaixo para responder às 5 questões de revisão.`;

    speechNarrator.speak(
      speechText,
      () => setIsSpeakingPhase(true),
      () => setIsSpeakingPhase(false)
    );
  };

  // Speaks Phase 2: Current Grade explanation
  const speakGradePhase = (lesson: TopicLesson) => {
    const gradeTitle = lesson.title || '';
    const gradeSummary = lesson.summary || '';
    const gradePointsArr = Array.isArray(lesson.keyPoints) ? lesson.keyPoints : [];
    const gradePoints = gradePointsArr.join('. ');
    const gradeEx = lesson.example || '';

    const speechText = `Fase 2: Conteúdo da Série Atual. ${gradeTitle}. ${gradeSummary}. Pontos principais: ${gradePoints}. Exemplo: ${gradeEx}. Toque no botão abaixo para responder às 5 questões da sua série.`;

    speechNarrator.speak(
      speechText,
      () => setIsSpeakingPhase(true),
      () => setIsSpeakingPhase(false)
    );
  };

  const togglePhaseSpeech = () => {
    if (!activeLesson) return;
    if (isSpeakingPhase) {
      speechNarrator.stop();
      setIsSpeakingPhase(false);
    } else {
      if (currentStep === 'revision_intro') {
        speakRevisionPhase(activeLesson);
      } else if (currentStep === 'grade_intro') {
        speakGradePhase(activeLesson);
      }
    }
  };

  // Start 5 Revision Questions
  const handleStartRevisionQuiz = () => {
    soundEffects.playClick();
    speechNarrator.stop();
    setIsSpeakingPhase(false);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setSessionCorrectCount(0);
    setRevisionCorrectCount(0);
    setGradeCorrectCount(0);
    setAnswersHistory([]);
    setCurrentStep('quiz_revision');

    if (activeLesson && Array.isArray(activeLesson.practiceQuestions) && activeLesson.practiceQuestions.length > 0) {
      setTimeout(() => {
        speakQuestionAt(activeLesson.practiceQuestions[0], 0, 'revisão');
      }, 400);
    }
  };

  // Start 5 Grade Questions
  const handleStartGradeQuiz = () => {
    soundEffects.playClick();
    speechNarrator.stop();
    setIsSpeakingPhase(false);
    setCurrentQuestionIndex(5);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setCurrentStep('quiz_grade');

    if (activeLesson && Array.isArray(activeLesson.practiceQuestions) && activeLesson.practiceQuestions.length > 5) {
      setTimeout(() => {
        speakQuestionAt(activeLesson.practiceQuestions[5], 5, 'série atual');
      }, 400);
    }
  };

  const speakQuestionAt = (q: Question, idx: number, phaseName: string) => {
    if (!autoSpeakQuestions || !q) return;
    const origin = q.gradeOriginLabel ? `${q.gradeOriginLabel}. ` : '';
    const letters = ['A', 'B', 'C', 'D'];
    const opts = Array.isArray(q.options) ? q.options : [];
    const optionsText = opts.map((opt, i) => `Alternativa ${letters[i] || i + 1}: ${opt}`).join('. ');
    const displayNum = (idx % 5) + 1;
    const speechText = `Questão ${displayNum} de 5 da ${phaseName}. ${origin}${q.question || ''}. ${optionsText}`;

    speechNarrator.speak(
      speechText,
      () => setIsSpeakingQuestion(true),
      () => setIsSpeakingQuestion(false)
    );
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    soundEffects.playClick();
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted || !activeLesson) return;
    speechNarrator.stop();
    setIsSpeakingQuestion(false);

    const currentQuestion = activeLesson.practiceQuestions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    const isRevision = currentQuestionIndex < 5;

    setIsAnswerSubmitted(true);

    if (isCorrect) {
      soundEffects.playCorrect(user.equippedSound);
      setSessionCorrectCount((prev) => prev + 1);
      if (isRevision) {
        setRevisionCorrectCount((prev) => prev + 1);
      } else {
        setGradeCorrectCount((prev) => prev + 1);
      }
      onAnswerCorrect();
    } else {
      soundEffects.playError();
    }

    setAnswersHistory((prev) => [
      ...prev,
      { isCorrect, question: currentQuestion, phase: isRevision ? 'revision' : 'grade' },
    ]);
  };

  const handleNextQuestion = async () => {
    soundEffects.playClick();
    speechNarrator.stop();
    setIsSpeakingQuestion(false);
    if (!activeLesson) return;

    // If finished 5th question of Revision (index 4), transition to Grade Intro explanation
    if (currentQuestionIndex === 4) {
      setCurrentStep('grade_intro');
      setTimeout(() => {
        speakGradePhase(activeLesson);
      }, 400);
      return;
    }

    // If finished 10th question (index 9), finish lesson and compute recommendation
    if (currentQuestionIndex >= 9 || currentQuestionIndex + 1 >= activeLesson.practiceQuestions.length) {
      setCurrentStep('summary');
      onFinishLesson(sessionCorrectCount);

      // Generate recommendation
      setIsLoadingRecommendation(true);
      const localRec = computeLocalRecommendation(
        activeLesson.subject,
        revisionCorrectCount,
        gradeCorrectCount
      );
      setRecommendation(localRec);

      try {
        const recRes = await fetch('/api/ai/study-recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grade: user.grade,
            currentSubject: activeLesson.subject,
            correctCount: sessionCorrectCount,
            totalCount: 10,
            revisionMistakes: 5 - revisionCorrectCount,
            currentMistakes: 5 - gradeCorrectCount,
            studiedSubjects: [activeLesson.subject],
          }),
        });
        if (recRes.ok) {
          const aiRec = await recRes.json();
          if (aiRec && aiRec.headline && aiRec.targetSubject) {
            setRecommendation(aiRec);
          }
        }
      } catch (_err) {
        // Keeps local recommendation
      } finally {
        setIsLoadingRecommendation(false);
      }
      return;
    }

    // Advance to next question in the current phase
    const nextIdx = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIdx);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);

    if (autoSpeakQuestions) {
      setTimeout(() => {
        speakQuestionAt(
          activeLesson.practiceQuestions[nextIdx],
          nextIdx,
          nextIdx < 5 ? 'revisão' : 'série atual'
        );
      }, 300);
    }
  };

  const currentQ = activeLesson?.practiceQuestions[currentQuestionIndex];

  return (
    <div className="flex-1 flex flex-col p-4 bg-slate-50 max-w-lg mx-auto w-full">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            soundEffects.playClick();
            speechNarrator.stop();
            if (currentStep === 'subject_select') {
              onBack();
            } else {
              setCurrentStep('subject_select');
            }
          }}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-200 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStep === 'subject_select' ? 'Menu Principal' : 'Mudar Matéria'}</span>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 border border-blue-300 rounded-full text-blue-900 text-xs font-bold shadow-xs">
          <BookOpen className="w-3.5 h-3.5 text-blue-700" />
          <span>Jornada BNCC • {GRADE_LABELS[user.grade].short}</span>
        </div>
      </div>

      {/* STEP 1: SUBJECT SELECT & FAST LOADING */}
      {currentStep === 'subject_select' && (
        <div className="flex-1 flex flex-col justify-between space-y-3">
          {isLoadingAI ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-white border border-blue-200 rounded-3xl shadow-sm animate-in fade-in duration-300 my-auto">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 animate-bounce">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-black text-slate-900 items-center justify-center">
                    ✨
                  </span>
                </span>
              </div>

              <div className="space-y-1.5 max-w-xs">
                <h3 className="text-sm font-black text-slate-900">
                  {aiStatusMessage || 'A Inteligência Artificial está preparando sua aula...'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Estruturando <strong>2 Fases Didáticas</strong>: Explicação e 5 questões de revisão + Explicação e 5 questões da série atual com áudio!
                </p>
                {user.grade === '1_fund' && (
                  <p className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-1 mt-2">
                    🎯 Conteúdo 100% calibrado para o 1º Ano (sem divisão nem multiplicação).
                  </p>
                )}
              </div>

              <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bot className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-black text-slate-900">Escolha a Matéria</h2>
              </div>
              <p className="text-xs text-slate-600 mb-3 leading-snug">
                Antes das perguntas, a <strong>IA explica o conteúdo em texto e voz</strong>. Primeiro 5 perguntas de revisão, depois a explicação da sua série com mais 5 perguntas!
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {getSubjectsForGrade(user.grade).map((subj) => (
                  <button
                    key={subj.id}
                    onClick={() => handleTriggerSelectSubject(subj.id)}
                    className="p-3 bg-white hover:bg-slate-100 border border-slate-200 hover:border-blue-400 rounded-2xl flex flex-col items-start text-left transition shadow-xs group active:scale-[0.98]"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-2 group-hover:scale-105 transition shrink-0">
                      {getSubjectIcon(subj.icon)}
                    </div>
                    <span className="font-bold text-slate-900 text-xs mb-0.5">{subj.name}</span>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                      {subj.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: PHASE 1 - REVISION CONTENT EXPLANATION WITH AI VOICE */}
      {currentStep === 'revision_intro' && activeLesson && (
        <div className="flex-1 flex flex-col justify-between space-y-3 overflow-y-auto pr-0.5">
          <div className="space-y-3">
            {/* Phase Badge */}
            <div className="flex items-center justify-between bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>FASE 1 DE 2: REVISÃO DOS FUNDAMENTOS</span>
              </span>
              <span className="text-[11px] bg-amber-200/80 px-2 py-0.5 rounded-md font-extrabold">
                5 Perguntas
              </span>
            </div>

            {/* AI Voice Control Banner */}
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    🎙️
                  </div>
                  <div>
                    <h4 className="text-xs font-black">A IA está Explicando a Revisão</h4>
                    <p className="text-[10px] text-amber-100">
                      {isSpeakingPhase ? 'Ouvindo narração da revisão...' : 'Toque para ouvir a explicação com voz'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={togglePhaseSpeech}
                  className="px-3 py-1.5 rounded-xl bg-white text-orange-950 font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-amber-50 transition active:scale-95"
                >
                  {isSpeakingPhase ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-orange-700" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-orange-700" />
                      <span>Ouvir IA</span>
                    </>
                  )}
                </button>
              </div>

              {/* Soundwave animation */}
              {isSpeakingPhase && (
                <div className="flex items-center gap-1 py-1 px-2 bg-black/20 rounded-lg">
                  <span className="w-1.5 h-3 bg-white rounded-full animate-bounce" />
                  <span className="w-1.5 h-5 bg-white rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-2 bg-white rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="w-1.5 h-4 bg-white rounded-full animate-bounce [animation-delay:0.45s]" />
                  <span className="text-[10px] font-bold text-white ml-1.5">IA Narrando Conteúdo de Revisão...</span>
                </div>
              )}
            </div>

            {/* Revision Theory Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Fundamentos da Base
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                {activeLesson.revisionTitle || `Revisão: Fundamentos de ${activeLesson.subject}`}
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activeLesson.revisionSummary || activeLesson.summary}
              </p>
            </div>

            {/* Revision Key Points */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <span>Pontos Importantes de Revisão</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {(Array.isArray(activeLesson.revisionKeyPoints) && activeLesson.revisionKeyPoints.length > 0
                  ? activeLesson.revisionKeyPoints
                  : Array.isArray(activeLesson.keyPoints)
                  ? activeLesson.keyPoints
                  : []
                ).map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Revision Example */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 text-xs shadow-xs">
              <span className="font-bold text-amber-900 block mb-1">Exemplo de Revisão:</span>
              <p className="text-amber-800 italic">
                "{activeLesson.revisionExample || activeLesson.example}"
              </p>
            </div>
          </div>

          {/* Start Revision Questions Button */}
          <button
            onClick={handleStartRevisionQuiz}
            className="w-full mt-3 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99]"
          >
            <span>Pronto! Iniciar 5 Questões de Revisão</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 3: PHASE 1 - 5 REVISION QUESTIONS */}
      {currentStep === 'quiz_revision' && activeLesson && currentQ && (
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* Top Bar */}
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  Revisão: Questão {currentQuestionIndex + 1} de 5
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-100 text-amber-900 border-amber-300">
                  Fase 1: Revisão
                </span>
              </div>

              {/* Audio repeat toggle */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    speakQuestionAt(currentQ, currentQuestionIndex, 'revisão');
                  }}
                  className={`p-1.5 rounded-lg border transition ${
                    isSpeakingQuestion
                      ? 'bg-amber-600 text-white border-amber-600 animate-pulse'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Ouvir Pergunta com Voz da IA"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setAutoSpeakQuestions(!autoSpeakQuestions);
                    if (autoSpeakQuestions) speechNarrator.stop();
                  }}
                  className={`p-1.5 rounded-lg border text-[10px] font-bold transition ${
                    autoSpeakQuestions
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {autoSpeakQuestions ? 'Voz ON' : 'Voz OFF'}
                </button>
              </div>
            </div>

            {/* Progress Bar (0 to 5) */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentQuestionIndex + 1) / 5) * 100}%`,
                }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-2 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  {currentQ.topic || 'Revisão da Base'}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Fase de Revisão
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Voice Answering Control */}
            <VoiceAnswerController
              options={currentQ.options || []}
              selectedOption={selectedOption}
              isAnswerSubmitted={isAnswerSubmitted}
              onSelectOption={handleSelectOption}
              onSubmitAnswer={handleSubmitAnswer}
              onNextQuestion={handleNextQuestion}
            />

            {/* Options */}
            <div className="space-y-2 text-xs">
              {(currentQ.options || []).map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;
                const letters = ['A', 'B', 'C', 'D'];

                let optionStyles =
                  'bg-white border-slate-200 text-slate-800 hover:border-amber-400 hover:bg-amber-50/50 shadow-xs';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optionStyles =
                      'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs';
                  } else if (isSelected && !isCorrect) {
                    optionStyles = 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs';
                  } else {
                    optionStyles = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  optionStyles =
                    'bg-amber-50 border-amber-600 text-amber-900 font-bold shadow-xs ring-1 ring-amber-600';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition active:scale-[0.99] ${optionStyles}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 border border-slate-200">
                        {letters[idx]}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </div>
                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation upon submit */}
            {isAnswerSubmitted && (
              <div className="mt-3 p-3.5 bg-slate-100 border border-slate-300 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-900 block text-xs">Explicação Didática:</span>
                <p className="text-slate-700 leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="mt-3">
            {!isAnswerSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs transition shadow-xs ${
                  selectedOption !== null
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Confirmar Resposta
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99]"
              >
                <span>
                  {currentQuestionIndex < 4
                    ? 'Próxima Questão de Revisão'
                    : 'Avançar para Explicação da Série Atual'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: PHASE 2 - CURRENT GRADE CONTENT EXPLANATION WITH AI VOICE */}
      {currentStep === 'grade_intro' && activeLesson && (
        <div className="flex-1 flex flex-col justify-between space-y-3 overflow-y-auto pr-0.5">
          <div className="space-y-3">
            {/* Revision Complete Callout */}
            <div className="bg-emerald-50 border border-emerald-300 px-3.5 py-2.5 rounded-2xl flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                ✓
              </span>
              <div>
                <span className="font-black text-xs text-emerald-950 block">
                  Revisão Concluída: {revisionCorrectCount}/5 Acertos!
                </span>
                <p className="text-[11px] text-emerald-700 leading-tight">
                  Muito bem! Agora vamos para o conteúdo principal do <strong>{GRADE_LABELS[user.grade].short}</strong>.
                </p>
              </div>
            </div>

            {/* Phase 2 Badge */}
            <div className="flex items-center justify-between bg-blue-100 border border-blue-300 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-900">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>FASE 2 DE 2: CONTEÚDO DO {GRADE_LABELS[user.grade].short.toUpperCase()}</span>
              </span>
              <span className="text-[11px] bg-blue-200/80 px-2 py-0.5 rounded-md font-extrabold">
                5 Perguntas
              </span>
            </div>

            {/* AI Voice Control Banner */}
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    🎙️
                  </div>
                  <div>
                    <h4 className="text-xs font-black">A IA está Explicando o Conteúdo da Série</h4>
                    <p className="text-[10px] text-blue-100">
                      {isSpeakingPhase ? 'Ouvindo narração da série...' : 'Toque para ouvir a explicação com voz'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={togglePhaseSpeech}
                  className="px-3 py-1.5 rounded-xl bg-white text-blue-900 font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-blue-50 transition active:scale-95"
                >
                  {isSpeakingPhase ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-blue-700" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-blue-700" />
                      <span>Ouvir IA</span>
                    </>
                  )}
                </button>
              </div>

              {/* Soundwave animation */}
              {isSpeakingPhase && (
                <div className="flex items-center gap-1 py-1 px-2 bg-black/20 rounded-lg">
                  <span className="w-1.5 h-3 bg-white rounded-full animate-bounce" />
                  <span className="w-1.5 h-5 bg-white rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-2 bg-white rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="w-1.5 h-4 bg-white rounded-full animate-bounce [animation-delay:0.45s]" />
                  <span className="text-[10px] font-bold text-white ml-1.5">IA Narrando Conteúdo da Série...</span>
                </div>
              )}
            </div>

            {/* Theory Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                Matéria Principal
              </span>
              <h2 className="text-base font-extrabold text-slate-900">{activeLesson.title}</h2>
              <p className="text-xs text-slate-700 leading-relaxed">{activeLesson.summary}</p>
            </div>

            {/* Key Points */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-600" />
                <span>Pontos Essenciais para Aprender</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {(Array.isArray(activeLesson.keyPoints) ? activeLesson.keyPoints : []).map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Example */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 text-xs shadow-xs">
              <span className="font-bold text-amber-900 block mb-1">Exemplo Prático:</span>
              <p className="text-amber-800 italic">"{activeLesson.example}"</p>
            </div>
          </div>

          {/* Start Grade Questions Button */}
          <button
            onClick={handleStartGradeQuiz}
            className="w-full mt-3 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99]"
          >
            <span>Entendido! Iniciar 5 Questões da Série Atual</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 5: PHASE 2 - 5 GRADE LEVEL QUESTIONS */}
      {currentStep === 'quiz_grade' && activeLesson && currentQ && (
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* Top Bar */}
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  Série Atual: Questão {currentQuestionIndex - 4} de 5
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-blue-100 text-blue-900 border-blue-300">
                  Fase 2: {GRADE_LABELS[user.grade].short}
                </span>
              </div>

              {/* Audio repeat toggle */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    speakQuestionAt(currentQ, currentQuestionIndex, 'série atual');
                  }}
                  className={`p-1.5 rounded-lg border transition ${
                    isSpeakingQuestion
                      ? 'bg-blue-600 text-white border-blue-600 animate-pulse'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Ouvir Pergunta com Voz da IA"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setAutoSpeakQuestions(!autoSpeakQuestions);
                    if (autoSpeakQuestions) speechNarrator.stop();
                  }}
                  className={`p-1.5 rounded-lg border text-[10px] font-bold transition ${
                    autoSpeakQuestions
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {autoSpeakQuestions ? 'Voz ON' : 'Voz OFF'}
                </button>
              </div>
            </div>

            {/* Progress Bar (5 to 10) */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentQuestionIndex - 4) / 5) * 100}%`,
                }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-2 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  {currentQ.topic || 'Conteúdo da Série'}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {GRADE_LABELS[user.grade].short}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Voice Answering Control */}
            <VoiceAnswerController
              options={currentQ.options || []}
              selectedOption={selectedOption}
              isAnswerSubmitted={isAnswerSubmitted}
              onSelectOption={handleSelectOption}
              onSubmitAnswer={handleSubmitAnswer}
              onNextQuestion={handleNextQuestion}
            />

            {/* Options */}
            <div className="space-y-2 text-xs">
              {(currentQ.options || []).map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;
                const letters = ['A', 'B', 'C', 'D'];

                let optionStyles =
                  'bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:bg-blue-50/50 shadow-xs';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optionStyles =
                      'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs';
                  } else if (isSelected && !isCorrect) {
                    optionStyles = 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs';
                  } else {
                    optionStyles = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  optionStyles =
                    'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs ring-1 ring-blue-600';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition active:scale-[0.99] ${optionStyles}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 border border-slate-200">
                        {letters[idx]}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </div>
                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation upon submit */}
            {isAnswerSubmitted && (
              <div className="mt-3 p-3.5 bg-slate-100 border border-slate-300 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-900 block text-xs">Explicação Didática:</span>
                <p className="text-slate-700 leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="mt-3">
            {!isAnswerSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs transition shadow-xs ${
                  selectedOption !== null
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Confirmar Resposta
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99]"
              >
                <span>
                  {currentQuestionIndex < 9 ? 'Próxima Questão' : 'Ver Resultados & Recomendação'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 6: SUMMARY & INTELLIGENT STUDY RECOMMENDATION */}
      {currentStep === 'summary' && activeLesson && (
        <div className="flex-1 flex flex-col justify-between p-1 overflow-y-auto">
          <div className="space-y-3">
            {/* Header Icon */}
            <div className="text-center pt-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 mx-auto flex items-center justify-center text-2xl mb-2 shadow-sm">
                {sessionCorrectCount >= 8 ? '🌟' : sessionCorrectCount >= 5 ? '👍' : '📚'}
              </div>
              <h2 className="text-base font-black text-slate-900">Lição Concluída com Sucesso!</h2>
              <p className="text-xs text-slate-600">
                Você completou as 2 fases pedagógicas de <strong>{activeLesson.title}</strong>.
              </p>
            </div>

            {/* Performance Breakdown Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Total de Acertos</span>
                <span className="text-sm font-black text-blue-600">
                  {sessionCorrectCount} / 10 ({sessionCorrectCount * 10}%)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-center">
                  <span className="text-[10px] text-amber-800 font-bold block">Fase 1: Revisão</span>
                  <span className="text-sm font-black text-amber-900">
                    {revisionCorrectCount} / 5
                  </span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-2 text-center">
                  <span className="text-[10px] text-blue-800 font-bold block">
                    Fase 2: {GRADE_LABELS[user.grade].short}
                  </span>
                  <span className="text-sm font-black text-blue-900">
                    {gradeCorrectCount} / 5
                  </span>
                </div>
              </div>
            </div>

            {/* SMART STUDY RECOMMENDATION MODULE */}
            {recommendation && (
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-4 shadow-sm space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      🧭
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900">
                      Recomendação de Estudo da IA
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      recommendation.type === 'reinforce'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {recommendation.type === 'reinforce' ? 'Reforço' : 'Novo Conteúdo'}
                  </span>
                </div>

                <h3 className="text-xs font-black text-slate-900">
                  {recommendation.headline}
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {recommendation.advice}
                </p>

                {/* Direct Action Button */}
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    speechNarrator.stop();
                    if (onSelectRecommendation) {
                      onSelectRecommendation(
                        recommendation.targetSubject,
                        recommendation.actionType === 'flashcards' ? 'flashcards' : 'journey'
                      );
                    } else {
                      handleSelectSubject(recommendation.targetSubject);
                    }
                  }}
                  className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99]"
                >
                  <span>
                    {recommendation.actionType === 'flashcards'
                      ? `Abrir Flashcards de ${
                          SUBJECTS.find((s) => s.id === recommendation.targetSubject)?.name ||
                          'Reforço'
                        }`
                      : `Estudar ${
                          SUBJECTS.find((s) => s.id === recommendation.targetSubject)?.name ||
                          'Nova Matéria'
                        }`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="space-y-2 mt-3 pt-2">
            <button
              onClick={() => {
                soundEffects.playClick();
                handleStartRevisionQuiz();
              }}
              className="w-full py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs transition"
            >
              Refazer Esta Lição (Revisão + Série)
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                speechNarrator.stop();
                setCurrentStep('subject_select');
              }}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition shadow-md"
            >
              Escolher Outra Matéria
            </button>
          </div>
        </div>
      )}

      {/* Audio & Headphone recommendation modal */}
      <AudioRecommendationModal
        isOpen={isAudioModalOpen}
        subjectName={
          pendingSubjectId
            ? SUBJECTS.find((s) => s.id === pendingSubjectId)?.name || 'Matéria'
            : 'Estudos'
        }
        onConfirm={() => {
          setIsAudioModalOpen(false);
          if (pendingSubjectId) {
            handleSelectSubject(pendingSubjectId);
          }
        }}
        onClose={() => {
          setIsAudioModalOpen(false);
          setPendingSubjectId(null);
        }}
      />
    </div>
  );
};
