import { StudyReminder, DayOfWeek, SubjectId, ExamEntry } from '../types';
import { soundEffects } from './soundEffects';
import { speechNarrator } from './speechNarrator';

const REMINDERS_STORAGE_KEY = 'estudahud_study_reminders_v2';
const EXAMS_STORAGE_KEY = 'estudahud_school_exams_v2';

export const DAY_NAMES: { id: DayOfWeek; short: string; full: string }[] = [
  { id: 0, short: 'Dom', full: 'Domingo' },
  { id: 1, short: 'Seg', full: 'Segunda-feira' },
  { id: 2, short: 'Ter', full: 'Terça-feira' },
  { id: 3, short: 'Qua', full: 'Quarta-feira' },
  { id: 4, short: 'Qui', full: 'Quinta-feira' },
  { id: 5, short: 'Sex', full: 'Sexta-feira' },
  { id: 6, short: 'Sáb', full: 'Sábado' },
];

export const DEFAULT_REMINDERS: StudyReminder[] = [
  {
    id: 'rem_math_default',
    subjectId: 'matematica',
    subjectName: 'Matemática',
    time: '14:00',
    daysOfWeek: [1, 2, 3, 4, 5], // Seg a Sex
    enabled: true,
    notes: 'Resolver 10 exercícios e praticar cálculo mental',
    soundAlert: true,
    voiceAlert: true,
  },
  {
    id: 'rem_port_default',
    subjectId: 'portugues',
    subjectName: 'Língua Portuguesa',
    time: '16:00',
    daysOfWeek: [1, 2, 3, 4, 5], // Seg a Sex
    enabled: true,
    notes: 'Revisar gramática, interpretação de texto e vocabulário',
    soundAlert: true,
    voiceAlert: true,
  },
  {
    id: 'rem_ciencias_default',
    subjectId: 'ciencias',
    subjectName: 'Ciências Naturais',
    time: '18:00',
    daysOfWeek: [2, 4], // Ter e Qui
    enabled: true,
    notes: 'Estudar conceitos de física, química e biologia',
    soundAlert: true,
    voiceAlert: true,
  },
];

type ReminderListener = (reminder: StudyReminder) => void;
type ExamReminderListener = (exam: ExamEntry, type: 'day_before' | 'day_of') => void;

class NotificationService {
  private reminders: StudyReminder[] = [];
  private exams: ExamEntry[] = [];
  private listeners: ReminderListener[] = [];
  private examListeners: ExamReminderListener[] = [];
  private intervalId: number | null = null;
  private lastTriggered: Record<string, boolean> = {};

  constructor() {
    this.loadReminders();
    this.loadExams();
    this.startBackgroundMonitor();
  }

  // ===== STUDY REMINDERS =====
  public loadReminders(): StudyReminder[] {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(REMINDERS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.reminders = parsed;
            return this.reminders;
          }
        }
      }
    } catch {}

    this.reminders = [...DEFAULT_REMINDERS];
    this.saveReminders(this.reminders);
    return this.reminders;
  }

  public saveReminders(reminders: StudyReminder[]): void {
    this.reminders = reminders;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
      }
    } catch {}
  }

  public getReminders(): StudyReminder[] {
    return [...this.reminders];
  }

  public addReminder(reminder: Omit<StudyReminder, 'id'>): StudyReminder {
    const newReminder: StudyReminder = {
      ...reminder,
      id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    const updated = [newReminder, ...this.reminders];
    this.saveReminders(updated);
    return newReminder;
  }

  public updateReminder(updatedReminder: StudyReminder): void {
    const updated = this.reminders.map((r) =>
      r.id === updatedReminder.id ? updatedReminder : r
    );
    this.saveReminders(updated);
  }

  public toggleReminder(id: string): boolean {
    let newState = false;
    const updated = this.reminders.map((r) => {
      if (r.id === id) {
        newState = !r.enabled;
        return { ...r, enabled: newState };
      }
      return r;
    });
    this.saveReminders(updated);
    return newState;
  }

  public deleteReminder(id: string): void {
    const updated = this.reminders.filter((r) => r.id !== id);
    this.saveReminders(updated);
  }

  // ===== EXAMS & PROVAS =====
  public loadExams(): ExamEntry[] {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(EXAMS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            this.exams = parsed;
            return this.exams;
          }
        }
      }
    } catch {}
    return this.exams;
  }

  public saveExams(exams: ExamEntry[]): void {
    this.exams = exams;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
      }
    } catch {}
  }

  public getExams(): ExamEntry[] {
    return [...this.exams].sort((a, b) => a.date.localeCompare(b.date));
  }

  public addExam(exam: Omit<ExamEntry, 'id' | 'createdAt'>): ExamEntry {
    const newExam: ExamEntry = {
      ...exam,
      id: `exam_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    const updated = [...this.exams, newExam];
    this.saveExams(updated);
    return newExam;
  }

  public updateExam(updatedExam: ExamEntry): void {
    const updated = this.exams.map((e) =>
      e.id === updatedExam.id ? updatedExam : e
    );
    this.saveExams(updated);
  }

  public deleteExam(id: string): void {
    const updated = this.exams.filter((e) => e.id !== id);
    this.saveExams(updated);
  }

  // ===== NOTIFICATION PERMISSIONS =====
  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        return Notification.permission;
      }
    } catch {}
    return 'unsupported';
  }

  public async requestNotificationPermission(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    } catch {}
    return false;
  }

  // Subscriptions
  public subscribe(callback: ReminderListener): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  public subscribeToExamReminders(callback: ExamReminderListener): () => void {
    this.examListeners.push(callback);
    return () => {
      this.examListeners = this.examListeners.filter((l) => l !== callback);
    };
  }

  // Background monitor
  private startBackgroundMonitor() {
    if (typeof window === 'undefined') return;

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }

    this.intervalId = window.setInterval(() => {
      this.checkAndTriggerReminders();
      this.checkAndTriggerExamReminders();
    }, 15000);
  }

  // Check regular study reminders
  private checkAndTriggerReminders() {
    const now = new Date();
    const currentDay = now.getDay() as DayOfWeek;
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;
    const todayDateStr = now.toDateString();

    for (const rem of this.reminders) {
      if (!rem.enabled) continue;

      if (rem.daysOfWeek.includes(currentDay) && rem.time === currentTimeStr) {
        const triggerKey = `${rem.id}_${todayDateStr}_${currentTimeStr}`;
        if (!this.lastTriggered[triggerKey]) {
          this.lastTriggered[triggerKey] = true;
          this.triggerReminderNotification(rem);
        }
      }
    }
  }

  // Check 1-day before exam at 12:00 or day of exam
  private checkAndTriggerExamReminders() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    // Current date format YYYY-MM-DD
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

    // Tomorrow date format YYYY-MM-DD
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomYear = tomorrow.getFullYear();
    const tomMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tomDay = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowStr = `${tomYear}-${tomMonth}-${tomDay}`;

    for (const exam of this.exams) {
      // 1. Check: 1 day before exam at 12:00
      if (exam.reminderDayBeforeAtNoon && exam.date === tomorrowStr && currentTimeStr === '12:00') {
        const triggerKey = `exam_day_before_${exam.id}_${todayStr}`;
        if (!this.lastTriggered[triggerKey]) {
          this.lastTriggered[triggerKey] = true;
          this.triggerExamNotification(exam, 'day_before');
        }
      }

      // 2. Check: Day of exam at 07:00 or exam time
      const checkTime = exam.time || '07:00';
      if (exam.date === todayStr && currentTimeStr === checkTime) {
        const triggerKey = `exam_day_of_${exam.id}_${todayStr}_${currentTimeStr}`;
        if (!this.lastTriggered[triggerKey]) {
          this.lastTriggered[triggerKey] = true;
          this.triggerExamNotification(exam, 'day_of');
        }
      }
    }
  }

  // Trigger Study Reminder Notification
  public triggerReminderNotification(reminder: StudyReminder, isTest = false) {
    const title = isTest
      ? `🔔 Teste de Notificação: ${reminder.subjectName}`
      : `⏰ Hora de Estudar: ${reminder.subjectName}!`;

    const body = reminder.notes
      ? `${reminder.notes} • Horário: ${reminder.time}`
      : `Seu horário de estudo de ${reminder.subjectName} começou. Abra para praticar 10 questões!`;

    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `study_${reminder.id}_${Date.now()}`,
          requireInteraction: true,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      }
    } catch {}

    if (reminder.soundAlert !== false) {
      try {
        soundEffects.playVictory();
      } catch {}
    }

    if (reminder.voiceAlert !== false) {
      const voiceText = isTest
        ? `Atenção estudante! O seu sistema de notificações de estudos está funcionando perfeitamente para a matéria de ${reminder.subjectName}.`
        : `Atenção estudante! Está na hora do seu horário agendado de estudos de ${reminder.subjectName}. Abra o aplicativo agora para garantir seus troféus e fazer seus 10 exercícios!`;

      speechNarrator.speak(voiceText);
    }

    this.listeners.forEach((listener) => {
      try {
        listener(reminder);
      } catch {}
    });
  }

  // Trigger Exam Notification (1 day before at 12:00 or day of exam)
  public triggerExamNotification(exam: ExamEntry, type: 'day_before' | 'day_of', isTest = false) {
    const isDayBefore = type === 'day_before';

    const title = isTest
      ? `📝 Teste de Lembrete de Prova: ${exam.subjectName}`
      : isDayBefore
      ? `⚠️ Prova Amanhã: ${exam.subjectName} (${exam.title})`
      : `🎯 Hoje é dia de Prova: ${exam.subjectName}!`;

    const body = isDayBefore
      ? `Lembrete das 12:00: Sua prova de ${exam.subjectName} (${exam.title}) é amanhã${exam.time ? ' às ' + exam.time : ''}! Abra para revisar os conteúdos.`
      : `Sua prova de ${exam.subjectName} (${exam.title}) é hoje${exam.time ? ' às ' + exam.time : ''}. Boa sorte e confie no seu potencial!`;

    // 1. Browser Push
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `exam_${exam.id}_${type}_${Date.now()}`,
          requireInteraction: true,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      }
    } catch {}

    // 2. Sound
    try {
      soundEffects.playAlarm();
    } catch {}

    // 3. Voice Narrator
    const voiceText = isTest
      ? `Atenção estudante! Este é um teste do lembrete de prova para ${exam.subjectName}. O alarme e as notificações das 12 horas do dia anterior estão configurados.`
      : isDayBefore
      ? `Atenção estudante! Lembrete do meio dia: a sua prova de ${exam.subjectName} é amanhã! Abra o Let's Study para fazer sua revisão e praticar 10 exercícios agora.`
      : `Atenção estudante! Hoje é o dia da sua prova de ${exam.subjectName}! Respira fundo, revise suas anotações e tenha uma excelente prova!`;

    speechNarrator.speak(voiceText);

    // 4. In-App Exam Listeners
    this.examListeners.forEach((listener) => {
      try {
        listener(exam, type);
      } catch {}
    });
  }

  // Immediate Test for Exam Reminder
  public sendTestExamNotification(subjectName = 'Matemática', title = 'Prova Bimestral') {
    const testExam: ExamEntry = {
      id: 'test_exam',
      subjectId: 'matematica',
      subjectName,
      title,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '08:00',
      reminderDayBeforeAtNoon: true,
      notes: 'Conteúdo: Capítulos 1 a 4 e exercícios de fixação',
      createdAt: Date.now(),
    };

    this.triggerExamNotification(testExam, 'day_before', true);
  }

  public sendTestNotification(subjectName = 'Matemática') {
    const testReminder: StudyReminder = {
      id: 'test_reminder',
      subjectId: 'matematica',
      subjectName,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      enabled: true,
      notes: 'Notificação de teste com som e voz da IA!',
      soundAlert: true,
      voiceAlert: true,
    };

    this.triggerReminderNotification(testReminder, true);
  }
}

export const notificationService = new NotificationService();
