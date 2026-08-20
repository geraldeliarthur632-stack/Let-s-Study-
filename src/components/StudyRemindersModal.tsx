import React, { useState, useEffect } from 'react';
import { StudyReminder, DayOfWeek, GradeLevel, SubjectId } from '../types';
import { SUBJECTS, getSubjectsForGrade } from '../data/curriculumData';
import { notificationService, DAY_NAMES } from '../services/notificationService';
import { soundEffects } from '../services/soundEffects';
import {
  Bell,
  BellRing,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Check,
  X,
  Volume2,
  Mic,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Play,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface StudyRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSubjectToStudy?: (subjectId: SubjectId) => void;
  userGrade?: GradeLevel;
}

export const StudyRemindersModal: React.FC<StudyRemindersModalProps> = ({
  isOpen,
  onClose,
  onSelectSubjectToStudy,
  userGrade = '6_fund',
}) => {
  const [reminders, setReminders] = useState<StudyReminder[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Reminder Form States
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId | 'all'>('matematica');
  const [reminderTime, setReminderTime] = useState('15:00');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([1, 2, 3, 4, 5]); // Seg a Sex
  const [reminderNotes, setReminderNotes] = useState('');
  const [enableSound, setEnableSound] = useState(true);
  const [enableVoice, setEnableVoice] = useState(true);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReminders(notificationService.getReminders());
      setPermissionStatus(notificationService.getPermissionStatus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    soundEffects.playClick();
    const granted = await notificationService.requestNotificationPermission();
    setPermissionStatus(notificationService.getPermissionStatus());
    if (granted) {
      soundEffects.playVictory();
    }
  };

  const handleSendTestNotification = () => {
    soundEffects.playClick();
    const subjName =
      selectedSubjectId === 'all'
        ? 'Todas as Matérias'
        : SUBJECTS.find((s) => s.id === selectedSubjectId)?.name || 'Matemática';

    notificationService.sendTestNotification(subjName);
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3000);
  };

  const handleToggleReminder = (id: string) => {
    soundEffects.playClick();
    notificationService.toggleReminder(id);
    setReminders(notificationService.getReminders());
  };

  const handleDeleteReminder = (id: string) => {
    soundEffects.playClick();
    notificationService.deleteReminder(id);
    setReminders(notificationService.getReminders());
  };

  const handleToggleDaySelection = (day: DayOfWeek) => {
    soundEffects.playClick();
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleSelectDayPreset = (preset: 'weekdays' | 'weekend' | 'all') => {
    soundEffects.playClick();
    if (preset === 'weekdays') setSelectedDays([1, 2, 3, 4, 5]);
    if (preset === 'weekend') setSelectedDays([0, 6]);
    if (preset === 'all') setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const handleAddReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playClick();

    const subjectName =
      selectedSubjectId === 'all'
        ? 'Geral (Todas as Matérias)'
        : SUBJECTS.find((s) => s.id === selectedSubjectId)?.name || 'Estudos';

    notificationService.addReminder({
      subjectId: selectedSubjectId,
      subjectName,
      time: reminderTime,
      daysOfWeek: selectedDays,
      enabled: true,
      notes: reminderNotes.trim() || `Estudar ${subjectName} e praticar 10 exercícios`,
      soundAlert: enableSound,
      voiceAlert: enableVoice,
    });

    setReminders(notificationService.getReminders());
    setShowAddForm(false);
    setReminderNotes('');
  };

  const handleApplyPresetRoutine = (presetType: 'bncc' | 'daily') => {
    soundEffects.playClick();
    if (presetType === 'bncc') {
      const bnccReminders: StudyReminder[] = [
        {
          id: `rem_math_${Date.now()}`,
          subjectId: 'matematica',
          subjectName: 'Matemática',
          time: '14:00',
          daysOfWeek: [1, 3, 5], // Seg, Qua, Sex
          enabled: true,
          notes: 'Resolver 10 questões e cálculos práticos',
          soundAlert: true,
          voiceAlert: true,
        },
        {
          id: `rem_port_${Date.now() + 1}`,
          subjectId: 'portugues',
          subjectName: 'Língua Portuguesa',
          time: '15:30',
          daysOfWeek: [1, 3, 5],
          enabled: true,
          notes: 'Interpretação e gramática com IA',
          soundAlert: true,
          voiceAlert: true,
        },
        {
          id: `rem_ciencias_${Date.now() + 2}`,
          subjectId: 'ciencias',
          subjectName: 'Ciências Naturais',
          time: '17:00',
          daysOfWeek: [2, 4], // Ter e Qui
          enabled: true,
          notes: 'Conceitos científicos e experimentos',
          soundAlert: true,
          voiceAlert: true,
        },
      ];
      notificationService.saveReminders(bnccReminders);
      setReminders(bnccReminders);
    } else {
      const dailyReminders: StudyReminder[] = [
        {
          id: `rem_daily_${Date.now()}`,
          subjectId: 'all',
          subjectName: 'Todas as Matérias',
          time: '18:00',
          daysOfWeek: [1, 2, 3, 4, 5],
          enabled: true,
          notes: 'Meta diária: 10 questões para manter a ofensiva!',
          soundAlert: true,
          voiceAlert: true,
        },
      ];
      notificationService.saveReminders(dailyReminders);
      setReminders(dailyReminders);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Lembretes & Notificações
              </h3>
              <p className="text-[11px] text-slate-500">
                Horários de estudo programados no seu celular
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Permission & Test Notification Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🔔</span>
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    Notificações no Dispositivo
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {permissionStatus === 'granted'
                      ? 'Notificações ativadas com sucesso ✅'
                      : permissionStatus === 'denied'
                      ? 'Notificações bloqueadas nas configurações do navegador ⚠️'
                      : 'Ative para receber avisos nos horários marcados'}
                  </span>
                </div>
              </div>

              {permissionStatus !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs transition active:scale-95 shrink-0"
                >
                  Permitir
                </button>
              )}
            </div>

            {/* Test Notification Button */}
            <div className="flex items-center justify-between pt-1 border-t border-blue-200/60">
              <span className="text-[10px] text-slate-500">
                Som do alarme e voz da IA no alerta
              </span>
              <button
                onClick={handleSendTestNotification}
                className="px-2.5 py-1 rounded-lg bg-white border border-blue-300 hover:bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center gap-1 transition shadow-xs active:scale-95"
              >
                {testNotificationSent ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Disparado!</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-blue-600" />
                    <span>Testar Alerta Agora</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Routines Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Rotinas Escolares Prontas
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleApplyPresetRoutine('bncc')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition shadow-xs group"
              >
                <span className="font-bold text-slate-900 text-xs block group-hover:text-blue-600">
                  📚 Rotina BNCC
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Matemática, Português e Ciências
                </span>
              </button>

              <button
                onClick={() => handleApplyPresetRoutine('daily')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition shadow-xs group"
              >
                <span className="font-bold text-slate-900 text-xs block group-hover:text-blue-600">
                  ⚡ Meta Diária (18h)
                </span>
                <span className="text-[10px] text-slate-500 block">
                  10 exercícios todo fim de tarde
                </span>
              </button>
            </div>
          </div>

          {/* Scheduled Reminders List Header */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Seus Horários de Estudos ({reminders.length})</span>
            </span>

            {!showAddForm && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setShowAddForm(true);
                }}
                className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Horário</span>
              </button>
            )}
          </div>

          {/* ADD REMINDER FORM */}
          {showAddForm && (
            <form
              onSubmit={handleAddReminderSubmit}
              className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-300 space-y-3 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">
                  Novo Horário de Estudo
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Subject Selector */}
              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Matéria
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value as SubjectId | 'all')}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="all">🌟 Geral (Todas as Matérias)</option>
                  {getSubjectsForGrade(userGrade).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time input */}
              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Horário do Alarme / Lembrete
                </label>
                <input
                  type="time"
                  required
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Days of week selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 text-[11px]">
                    Dias da Semana
                  </label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleSelectDayPreset('weekdays')}
                      className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                    >
                      Seg-Sex
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDayPreset('all')}
                      className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                    >
                      Todos
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {DAY_NAMES.map((day) => {
                    const isSelected = selectedDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleToggleDaySelection(day.id)}
                        className={`py-1.5 rounded-lg font-bold text-[10px] transition border ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {day.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Meta de Estudo (Opcional)
                </label>
                <input
                  type="text"
                  value={reminderNotes}
                  onChange={(e) => setReminderNotes(e.target.value)}
                  placeholder="Ex: Fazer 10 exercícios da série e revisar teoria"
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
              </div>

              {/* Audio & Voice toggles */}
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableSound}
                    onChange={(e) => setEnableSound(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Tocar Som 🔔</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableVoice}
                    onChange={(e) => setEnableVoice(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Falar com IA 🎙️</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                >
                  Salvar Horário
                </button>
              </div>
            </form>
          )}

          {/* List of active reminders */}
          {reminders.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-3xl">⏰</span>
              <p className="font-bold text-slate-800 text-xs">
                Nenhum horário de estudo cadastrado
              </p>
              <p className="text-[11px] text-slate-500">
                Adicione seus horários acima para ser lembrado de praticar suas matérias!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reminders.map((rem) => {
                return (
                  <div
                    key={rem.id}
                    className={`p-3.5 rounded-2xl border transition shadow-xs ${
                      rem.enabled
                        ? 'bg-white border-slate-200 hover:border-blue-300'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                            rem.enabled
                              ? 'bg-blue-100 text-blue-900 border-blue-200'
                              : 'bg-slate-200 text-slate-500 border-slate-300'
                          }`}
                        >
                          ⏰
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                              {rem.subjectName}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-200 shrink-0">
                              {rem.time}
                            </span>
                          </div>

                          {rem.notes && (
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {rem.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Toggle switch & Delete button */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleReminder(rem.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            rem.enabled ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                          title={rem.enabled ? 'Desativar Lembrete' : 'Ativar Lembrete'}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              rem.enabled ? 'translate-x-4.5' : 'translate-x-1'
                            }`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteReminder(rem.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Excluir Horário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Days badges and direct study shortcut */}
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[10px]">
                      <div className="flex items-center gap-1">
                        {DAY_NAMES.map((day) => {
                          const isActiveDay = rem.daysOfWeek.includes(day.id);
                          return (
                            <span
                              key={day.id}
                              className={`px-1 py-0.2 rounded font-bold ${
                                isActiveDay
                                  ? rem.enabled
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-200 text-slate-600'
                                  : 'text-slate-300'
                              }`}
                            >
                              {day.short}
                            </span>
                          );
                        })}
                      </div>

                      {rem.subjectId !== 'all' && onSelectSubjectToStudy && (
                        <button
                          onClick={() => {
                            soundEffects.playClick();
                            onClose();
                            onSelectSubjectToStudy(rem.subjectId as SubjectId);
                          }}
                          className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Estudar Agora</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            Salvo automaticamente no seu aparelho
          </span>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
