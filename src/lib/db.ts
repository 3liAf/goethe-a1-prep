import { ExamAttemptRecord, MistakeCategoryKey, QuestionMistake } from '@/types/exam';
import { MISTAKE_CATEGORIES } from '@/data/hacks-and-tips';

const DB_STORAGE_KEY = 'goethe_a1_exam_attempts_v1';

export interface CategoryMistakeStat {
  category: MistakeCategoryKey;
  nameDe: string;
  nameEn: string;
  count: number;
  percentageOfMistakes: number;
  hackTipDe: string;
  hackTipEn: string;
  examples: QuestionMistake[];
}

export interface MistakeAnalyticsSummary {
  totalAttempts: number;
  passedAttempts: number;
  passRate: number; // e.g. 75 (%)
  averageScore: number; // e.g. 72.4 (out of 100)
  moduleAverages: {
    hoeren: number; // 0 - 25
    lesen: number; // 0 - 25
    schreiben: number; // 0 - 25
    sprechen: number; // 0 - 25
  };
  totalMistakesCount: number;
  categoryStats: CategoryMistakeStat[];
  topWeakness: CategoryMistakeStat | null;
  recommendedFocus: string[];
  recentMistakes: QuestionMistake[];
}

// Safely get all attempts from browser storage
export function getExamAttempts(): ExamAttemptRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.error('Error loading exam attempts from storage:', error);
    return [];
  }
}

// Save an attempt
export function saveExamAttempt(attempt: ExamAttemptRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getExamAttempts();
    // Add new attempt at the beginning
    const updated = [attempt, ...current.filter((a) => a.id !== attempt.id)];
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving exam attempt to storage:', error);
  }
}

// Get single attempt by ID
export function getAttemptById(id: string): ExamAttemptRecord | null {
  const attempts = getExamAttempts();
  return attempts.find((a) => a.id === id) || null;
}

// Delete attempt
export function deleteAttempt(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getExamAttempts();
    const updated = current.filter((a) => a.id !== id);
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting exam attempt:', error);
  }
}

// Clear all attempts
export function clearAllAttempts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DB_STORAGE_KEY);
}

// Calculate comprehensive analytics
export function getMistakeAnalytics(): MistakeAnalyticsSummary {
  const attempts = getExamAttempts();

  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      passedAttempts: 0,
      passRate: 0,
      averageScore: 0,
      moduleAverages: { hoeren: 0, lesen: 0, schreiben: 0, sprechen: 0 },
      totalMistakesCount: 0,
      categoryStats: [],
      topWeakness: null,
      recommendedFocus: [
        'Take your first full Goethe A1 Mock Exam to diagnose your baseline strengths and weaknesses.',
        'Review the A1 Hacks & Tips section before starting to avoid common traps like clock times and reversed numbers.',
      ],
      recentMistakes: [],
    };
  }

  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter((a) => a.passed).length;
  const passRate = Math.round((passedAttempts / totalAttempts) * 100);

  const totalScore = attempts.reduce((acc, curr) => acc + curr.scores.totalScaled, 0);
  const averageScore = Math.round((totalScore / totalAttempts) * 10) / 10;

  const totalHoeren = attempts.reduce((acc, curr) => acc + curr.scores.hoeren.scaled, 0);
  const totalLesen = attempts.reduce((acc, curr) => acc + curr.scores.lesen.scaled, 0);
  const totalSchreiben = attempts.reduce((acc, curr) => acc + curr.scores.schreiben.scaled, 0);
  const totalSprechen = attempts.reduce((acc, curr) => acc + curr.scores.sprechen.scaled, 0);

  const moduleAverages = {
    hoeren: Math.round((totalHoeren / totalAttempts) * 10) / 10,
    lesen: Math.round((totalLesen / totalAttempts) * 10) / 10,
    schreiben: Math.round((totalSchreiben / totalAttempts) * 10) / 10,
    sprechen: Math.round((totalSprechen / totalAttempts) * 10) / 10,
  };

  // Collect all mistakes
  const allMistakes: QuestionMistake[] = [];
  attempts.forEach((a) => {
    if (a.mistakes && Array.isArray(a.mistakes)) {
      allMistakes.push(...a.mistakes);
    }
  });

  const categoryCounts: Record<MistakeCategoryKey, { count: number; examples: QuestionMistake[] }> = {
    zahlen_uhrzeiten: { count: 0, examples: [] },
    negation_traps: { count: 0, examples: [] },
    distraktor_hoeren: { count: 0, examples: [] },
    anzeigen_matching: { count: 0, examples: [] },
    formular_genauigkeit: { count: 0, examples: [] },
    email_struktur_anrede: { count: 0, examples: [] },
    wortschatz_luecke: { count: 0, examples: [] },
    grammatik_akkusativ_dativ: { count: 0, examples: [] },
    fragewoerter: { count: 0, examples: [] },
  };

  allMistakes.forEach((m) => {
    if (categoryCounts[m.category]) {
      categoryCounts[m.category].count += 1;
      if (categoryCounts[m.category].examples.length < 5) {
        categoryCounts[m.category].examples.push(m);
      }
    }
  });

  const totalMistakesCount = allMistakes.length;

  const categoryStats: CategoryMistakeStat[] = (Object.keys(categoryCounts) as MistakeCategoryKey[])
    .map((key) => {
      const info = MISTAKE_CATEGORIES[key];
      const count = categoryCounts[key].count;
      const percentage = totalMistakesCount > 0 ? Math.round((count / totalMistakesCount) * 100) : 0;
      return {
        category: key,
        nameDe: info.nameDe,
        nameEn: info.nameEn,
        count,
        percentageOfMistakes: percentage,
        hackTipDe: info.hackTipDe,
        hackTipEn: info.hackTipEn,
        examples: categoryCounts[key].examples,
      };
    })
    .sort((a, b) => b.count - a.count);

  const topWeakness = categoryStats.length > 0 && categoryStats[0].count > 0 ? categoryStats[0] : null;

  // Generate personalized study recommendations
  const recommendedFocus: string[] = [];
  if (moduleAverages.hoeren < 15) {
    recommendedFocus.push('Priority 1: Hören (Listening) is currently below 60%. Practice Teil 2 (announcements heard only once) and study the Distraktor Hacks.');
  }
  if (moduleAverages.schreiben < 15) {
    recommendedFocus.push('Priority 2: Schreiben (Writing) needs attention. Memorize the 10/10 Email structure and avoid full sentences in Formular Teil 1.');
  }
  if (moduleAverages.lesen < 15) {
    recommendedFocus.push('Priority 3: Lesen (Reading) needs speed and precision. Underline constraints (opening times, budget, dates) before reading website choices.');
  }
  if (topWeakness && topWeakness.count > 0) {
    recommendedFocus.push(`Focus Trap: Your #1 mistake pattern is "${topWeakness.nameEn}" (${topWeakness.count} errors). Hack: ${topWeakness.hackTipEn}`);
  }
  if (recommendedFocus.length === 0) {
    recommendedFocus.push('Outstanding performance! Keep maintaining regular exam simulations under strict timed conditions to build exam-day stamina.');
  }

  return {
    totalAttempts,
    passedAttempts,
    passRate,
    averageScore,
    moduleAverages,
    totalMistakesCount,
    categoryStats,
    topWeakness,
    recommendedFocus,
    recentMistakes: allMistakes.slice(0, 10),
  };
}

// Export / Import helpers
export function exportDataAsJson(): string {
  const attempts = getExamAttempts();
  return JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      attempts,
    },
    null,
    2
  );
}

export function importDataFromJson(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && Array.isArray(parsed.attempts)) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(parsed.attempts));
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
}
