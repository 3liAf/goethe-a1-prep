export type ModuleType = 'hoeren' | 'lesen' | 'schreiben' | 'sprechen';

export type MistakeCategoryKey =
  | 'zahlen_uhrzeiten'
  | 'negation_traps'
  | 'distraktor_hoeren'
  | 'anzeigen_matching'
  | 'formular_genauigkeit'
  | 'email_struktur_anrede'
  | 'wortschatz_luecke'
  | 'grammatik_akkusativ_dativ'
  | 'fragewoerter';

export interface MistakeCategoryInfo {
  key: MistakeCategoryKey;
  nameDe: string;
  nameEn: string;
  descriptionDe: string;
  descriptionEn: string;
  hackTipDe: string;
  hackTipEn: string;
}

// Hören Question
export interface HoerenQuestion {
  id: string; // e.g. "h-t1-q1"
  teil: 1 | 2 | 3;
  number: number;
  question: string;
  type: 'mcq' | 'richtig_falsch';
  options: {
    id: string; // "a" | "b" | "c" or "richtig" | "falsch"
    text: string;
    subtext?: string;
    badge?: string;
  }[];
  correctAnswer: string;
  audioScript: string;
  speakerInfo?: string;
  playLimit: 1 | 2; // Teil 1 & 3: 2 plays, Teil 2: 1 play
  explanationDe: string;
  explanationEn: string;
  mistakeCategory: MistakeCategoryKey;
  hackTip: string;
}

// Lesen Question
export interface LesenQuestion {
  id: string;
  teil: 1 | 2 | 3;
  number: number;
  statement: string;
  type: 'richtig_falsch' | 'mcq_websites';
  textContext?: {
    title: string;
    sender?: string;
    recipient?: string;
    date?: string;
    body: string;
    subNote?: string;
  };
  websiteOptions?: {
    id: string; // "a" | "b" | "none"
    title: string;
    url: string;
    snippet: string;
    details: string[];
  }[];
  options?: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
  explanationDe: string;
  explanationEn: string;
  mistakeCategory: MistakeCategoryKey;
  hackTip: string;
}

// Schreiben
export interface FormField {
  fieldNumber: number; // 1 to 5
  label: string;
  exampleValue?: string;
  correctAnswers: string[]; // accepted variations e.g. ["4", "vier", "4 Personen"]
  placeholder: string;
  type: 'text' | 'select' | 'radio';
  selectOptions?: string[];
  explanationDe: string;
  explanationEn: string;
  mistakeCategory: MistakeCategoryKey;
  hackTip: string;
}

export interface SchreibenTeil1Form {
  scenarioText: string;
  formTitle: string;
  staticFields: { label: string; value: string }[];
  fieldsToFill: FormField[];
}

export interface SchreibenTeil2Task {
  situationText: string;
  leitpunkte: [string, string, string]; // Exactly 3 bullet points
  minWords: number;
  targetWords: number;
  suggestedAnrede: string[];
  suggestedGruss: string[];
  sampleSolution: string;
  grammarFocus: string[];
  hacks: string[];
  leitpunkteRules?: {
    keywords: string[];
    tip: string;
  }[];
}

// Sprechen
export interface SprechenTeil1Prompt {
  keywords: string[]; // Name, Alter, Land, Wohnort, Sprachen, Beruf, Hobby
  sampleSelfIntro: {
    keyword: string;
    germanPhrase: string;
    englishMeaning: string;
  }[];
  followUpQuestions: {
    question: string;
    sampleAnswer: string;
    tip: string;
  }[];
}

export interface SprechenCard {
  id: string;
  teil: 2 | 3;
  topic?: string; // for Teil 2, e.g. "Essen und Trinken", "Einkaufen"
  keyword: string;
  iconName: string;
  sampleQuestion: string;
  sampleAnswer: string;
  politeForm: string;
  hackTip: string;
}

export interface SprechenModuleData {
  teil1: SprechenTeil1Prompt;
  teil2Cards: SprechenCard[];
  teil3Cards: SprechenCard[];
}

export interface MockExam {
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'Standard (Goethe A1 Format)' | 'Exam Simulator';
  hoeren: {
    instructions: string;
    questions: HoerenQuestion[];
  };
  lesen: {
    instructions: string;
    questions: LesenQuestion[];
  };
  schreiben: {
    teil1: SchreibenTeil1Form;
    teil2: SchreibenTeil2Task;
  };
  sprechen: SprechenModuleData;
}

export interface QuestionMistake {
  examId: string;
  module: ModuleType;
  questionId: string;
  questionNumber: number;
  questionPrompt: string;
  userAnswer: string;
  correctAnswer: string;
  category: MistakeCategoryKey;
  explanation: string;
  hackTip: string;
  timestamp: string;
}

export interface ExamAttemptRecord {
  id: string;
  examId: string;
  examTitle: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  scores: {
    hoeren: { raw: number; max: 15; scaled: number };
    lesen: { raw: number; max: 15; scaled: number };
    schreiben: { raw: number; max: 15; scaled: number };
    sprechen: { raw: number; max: 15; scaled: number };
    totalScaled: number; // 0 to 100
  };
  passed: boolean; // >= 60 points
  cefrGrade: 'Sehr gut (1)' | 'Gut (2)' | 'Befriedigend (3)' | 'Ausreichend (4)' | 'Nicht bestanden (5)';
  answers: Record<string, string>;
  schreibenTeil2Text?: string;
  mistakes: QuestionMistake[];
}
