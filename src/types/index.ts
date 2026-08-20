export type GradeLevel =
  | '1_fund'
  | '2_fund'
  | '3_fund'
  | '4_fund'
  | '5_fund'
  | '6_fund'
  | '7_fund'
  | '8_fund'
  | '9_fund'
  | '1_medio'
  | '2_medio'
  | '3_medio'
  | 'enem';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface UserProfile {
  name: string;
  grade: GradeLevel;
  avatar: string;
  isFirstTime?: boolean;
  hasSeenIntro?: boolean;
  totalPoints: number;
  completedChallenges: number;
}

export type SubjectId =
  | 'matematica'
  | 'portugues'
  | 'ciencias'
  | 'historia'
  | 'geografia'
  | 'fisica'
  | 'quimica'
  | 'biologia'
  | 'ingles';

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Question {
  id: string;
  subject: SubjectId | string;
  grade: GradeLevel;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isTiebreaker?: boolean;
  gradeOriginLabel?: string; // e.g. "Revisão (1º Ano)" ou "Atual (2º Ano)"
}

export interface TopicLesson {
  id: string;
  subject: SubjectId;
  grade: GradeLevel;
  title: string;
  // Phase 1: Revision explanation for the first 5 questions
  revisionTitle?: string;
  revisionSummary?: string;
  revisionKeyPoints?: string[];
  revisionExample?: string;
  // Phase 2: Current grade explanation for the next 5 questions
  summary: string;
  keyPoints: string[];
  example: string;
  practiceQuestions: Question[];
}

export interface LocalPlayer {
  id: string;
  name: string;
  grade: GradeLevel;
  avatar: string;
  score: number;
  errors: number;
  answeredCount: number;
  answers: boolean[];
}

export interface MultiplayerPlayer {
  id: string;
  name: string;
  avatar: string;
  grade: GradeLevel;
  score: number;
  errors: number;
  currentQuestionIndex: number;
  isReady: boolean;
  connected: boolean;
}

export type GameRoomType = 'general' | 'chess' | 'math';

export interface ChessGameState {
  fen: string;
  turn: 'w' | 'b';
  history: string[];
  lastMove: { from: string; to: string } | null;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  capturedByWhite: string[];
  capturedByBlack: string[];
  whitePlayerId: string;
  blackPlayerId: string;
}

export interface MultiplayerRoom {
  code: string;
  grade: GradeLevel;
  gameType: GameRoomType;
  status: 'waiting' | 'in_progress' | 'tiebreaker' | 'finished';
  hostId: string;
  players: MultiplayerPlayer[];
  questions: Question[];
  tiebreakerQuestions: Question[];
  currentQuestionIndex: number;
  maxPlayers: number;
  createdAt: number;
  winnerId?: string;
  chessState?: ChessGameState;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb

export interface StudyReminder {
  id: string;
  subjectId: SubjectId | 'all';
  subjectName: string;
  time: string; // "HH:MM" 24h format, e.g. "14:30"
  daysOfWeek: DayOfWeek[];
  enabled: boolean;
  notes?: string;
  soundAlert?: boolean;
  voiceAlert?: boolean;
}

export interface ExamEntry {
  id: string;
  subjectId: SubjectId;
  subjectName: string;
  title: string;
  date: string; // "YYYY-MM-DD" e.g. "2026-08-25"
  time?: string; // "HH:MM" e.g. "08:00"
  reminderDayBeforeAtNoon: boolean; // 1 dia antes às 12:00
  reminderOnDayMorning?: boolean; // no dia às 07:00
  topicsCovered?: string;
  notes?: string;
  createdAt: number;
}

export interface Flashcard {
  id: string;
  subjectId: SubjectId;
  grade: GradeLevel;
  topic: string;
  question: string; // Frente do cartão (Pergunta / Conceito)
  answer: string; // Verso do cartão (Resposta / Definição)
  hint?: string; // Dica auxiliar
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string; // e.g. "Fórmula", "Definição", "Vocabulário", "Data"
  isCustom?: boolean;
}

export interface FlashcardDeck {
  id: string;
  subjectId: SubjectId;
  title: string;
  description: string;
  grade: GradeLevel;
  icon: string;
  cards: Flashcard[];
  isCustom?: boolean;
  color?: string;
}



