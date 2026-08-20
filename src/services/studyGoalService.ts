export interface DailyGoalData {
  targetMinutes: number;
  todaySeconds: number;
  lastActiveDate: string; // 'YYYY-MM-DD'
  claimedBonusDate: string | null;
  streakDays: number;
  completedSubjectsByGrade: Record<string, string[]>; // { '1_fund': ['matematica', 'portugues', ...] }
}

const STORAGE_KEY = 'estudahud_daily_goal_data_v1';

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const studyGoalService = {
  getData(): DailyGoalData {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const today = getTodayString();

      if (saved) {
        const parsed: DailyGoalData = JSON.parse(saved);

        // If today is a new day, reset todaySeconds and check streak
        if (parsed.lastActiveDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

          let newStreak = parsed.streakDays || 0;
          // If the student didn't study yesterday and today is more than 1 day later, reset streak
          if (parsed.lastActiveDate !== yStr && parsed.todaySeconds < (parsed.targetMinutes * 60)) {
            newStreak = 0;
          }

          const resetData: DailyGoalData = {
            ...parsed,
            todaySeconds: 0,
            lastActiveDate: today,
            claimedBonusDate: null,
            streakDays: newStreak,
            completedSubjectsByGrade: parsed.completedSubjectsByGrade || {},
          };
          this.saveData(resetData);
          return resetData;
        }

        return {
          targetMinutes: parsed.targetMinutes || 15,
          todaySeconds: parsed.todaySeconds || 0,
          lastActiveDate: today,
          claimedBonusDate: parsed.claimedBonusDate || null,
          streakDays: parsed.streakDays || 0,
          completedSubjectsByGrade: parsed.completedSubjectsByGrade || {},
        };
      }
    } catch {}

    const initial: DailyGoalData = {
      targetMinutes: 15,
      todaySeconds: 0,
      lastActiveDate: getTodayString(),
      claimedBonusDate: null,
      streakDays: 0,
      completedSubjectsByGrade: {},
    };
    this.saveData(initial);
    return initial;
  },

  saveData(data: DailyGoalData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  },

  addStudySeconds(seconds: number): DailyGoalData {
    const data = this.getData();
    const updatedSeconds = data.todaySeconds + seconds;
    const targetSeconds = data.targetMinutes * 60;

    let updatedStreak = data.streakDays;
    // If just reached the target for the first time today
    if (data.todaySeconds < targetSeconds && updatedSeconds >= targetSeconds) {
      updatedStreak = (data.streakDays || 0) + 1;
    }

    const updated: DailyGoalData = {
      ...data,
      todaySeconds: updatedSeconds,
      streakDays: updatedStreak,
      lastActiveDate: getTodayString(),
    };
    this.saveData(updated);
    return updated;
  },

  setTargetMinutes(minutes: number): DailyGoalData {
    const data = this.getData();
    const updated: DailyGoalData = {
      ...data,
      targetMinutes: Math.max(5, Math.min(180, minutes)),
    };
    this.saveData(updated);
    return updated;
  },

  claimBonus(): { success: boolean; points: number; data: DailyGoalData } {
    const data = this.getData();
    const today = getTodayString();
    const targetSeconds = data.targetMinutes * 60;

    if (data.todaySeconds < targetSeconds) {
      return { success: false, points: 0, data };
    }

    if (data.claimedBonusDate === today) {
      return { success: false, points: 0, data };
    }

    const pointsBonus = 100;
    const updated: DailyGoalData = {
      ...data,
      claimedBonusDate: today,
    };
    this.saveData(updated);
    return { success: true, points: pointsBonus, data: updated };
  },

  markSubjectCompleted(grade: string, subjectId: string): { gradeCompleted: boolean; totalInGrade: number; completedCount: number } {
    const data = this.getData();
    const currentList = data.completedSubjectsByGrade[grade] || [];

    if (!currentList.includes(subjectId)) {
      currentList.push(subjectId);
    }

    data.completedSubjectsByGrade[grade] = currentList;
    this.saveData(data);

    // Default required subjects per grade level
    const isHighSchool = grade.includes('medio') || grade === 'enem';
    const requiredTotal = isHighSchool ? 7 : 5; // Math, Port, Science, Hist, Geo (+ Bio/Chem/Phys for EM)
    const gradeCompleted = currentList.length >= requiredTotal;

    return {
      gradeCompleted,
      totalInGrade: requiredTotal,
      completedCount: currentList.length,
    };
  },

  getCompletedSubjects(grade: string): string[] {
    const data = this.getData();
    return data.completedSubjectsByGrade[grade] || [];
  },
};
