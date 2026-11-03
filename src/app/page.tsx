'use client';

import React, { useState, useEffect } from 'react';
import { MOCK_EXAMS } from '@/data/mock-exams';
import { ModuleType, ExamAttemptRecord } from '@/types/exam';
import { calculateExamScore, EvaluationResult } from '@/lib/scoring';
import { saveExamAttempt } from '@/lib/db';
import { HeaderNav } from '@/components/HeaderNav';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { HoerenSection } from '@/components/HoerenSection';
import { LesenSection } from '@/components/LesenSection';
import { SchreibenSection } from '@/components/SchreibenSection';
import { SprechenSection } from '@/components/SprechenSection';
import { MistakeAnalyticsDashboard } from '@/components/MistakeAnalyticsDashboard';
import { HacksAndTipsSection } from '@/components/HacksAndTipsSection';
import { ResultsModal } from '@/components/ResultsModal';

export default function Home() {
  const [selectedExamId, setSelectedExamId] = useState<string>('modellsatz-1');
  const [currentModule, setCurrentModule] = useState<ModuleType | 'analytics' | 'hacks'>('hoeren');

  // Exam Answers State
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [schreibenTeil1Answers, setSchreibenTeil1Answers] = useState<Record<number, string>>({});
  const [schreibenTeil2Text, setSchreibenTeil2Text] = useState<string>('');
  const [sprechenScore, setSprechenScore] = useState<number>(12); // default realistic baseline

  // Timer State (80 minutes total exam duration = 4800s)
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(80 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [examStartedAt, setExamStartedAt] = useState<string>('');

  // Results & Review Mode
  const [showExplanations, setShowExplanations] = useState<boolean>(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<EvaluationResult | null>(null);

  // Active Exam
  const activeExam = MOCK_EXAMS.find((e) => e.id === selectedExamId) || MOCK_EXAMS[0];

  useEffect(() => {
    setExamStartedAt(new Date().toISOString());
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeRemainingSeconds > 0) {
      interval = setInterval(() => {
        setTimeRemainingSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemainingSeconds]);

  const handleSelectExam = (examId: string) => {
    setSelectedExamId(examId);
    setAnswers({});
    setSchreibenTeil1Answers({});
    setSchreibenTeil2Text('');
    setSprechenScore(12);
    setTimeRemainingSeconds(80 * 60);
    setShowExplanations(false);
    setIsResultsModalOpen(false);
    setLastResult(null);
  };

  const handleSelectAnswer = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleUpdateTeil1Answer = (fieldNumber: number, value: string) => {
    setSchreibenTeil1Answers((prev) => ({
      ...prev,
      [fieldNumber]: value,
    }));
  };

  const handleFinishExam = () => {
    const result = calculateExamScore(
      activeExam,
      answers,
      schreibenTeil1Answers,
      schreibenTeil2Text,
      sprechenScore
    );

    const completedAt = new Date().toISOString();
    const durationSeconds = Math.max(60, 80 * 60 - timeRemainingSeconds);

    const attemptRecord: ExamAttemptRecord = {
      id: `attempt-${Date.now()}`,
      examId: activeExam.id,
      examTitle: activeExam.title,
      startedAt: examStartedAt || completedAt,
      completedAt,
      durationSeconds,
      scores: result.scores,
      passed: result.passed,
      cefrGrade: result.cefrGrade,
      answers,
      schreibenTeil2Text,
      mistakes: result.mistakes,
    };

    // Save to Database!
    saveExamAttempt(attemptRecord);

    setLastResult(result);
    setIsResultsModalOpen(true);
  };

  const handleReviewAnswers = () => {
    setIsResultsModalOpen(false);
    setShowExplanations(true);
    setCurrentModule('hoeren');
  };

  const handleRestartExam = () => {
    handleSelectExam(selectedExamId);
  };

  // Calculate answered count
  const answeredHoerenCount = activeExam.hoeren.questions.filter((q) => !!answers[q.id]).length;
  const answeredLesenCount = activeExam.lesen.questions.filter((q) => !!answers[q.id]).length;
  const answeredSchreibenCount = Object.keys(schreibenTeil1Answers).length + (schreibenTeil2Text.trim() ? 1 : 0);
  const totalAnswered = answeredHoerenCount + answeredLesenCount + answeredSchreibenCount;
  const totalQuestions = activeExam.hoeren.questions.length + activeExam.lesen.questions.length + 6; // 15 + 15 + 6 = 36

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* PWA Install Banner for iPhone & Mobile */}
      <PWAInstallBanner />

      {/* Header Navigation with Goethe Styling */}
      <HeaderNav
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        selectedExamId={selectedExamId}
        onSelectExam={handleSelectExam}
        examOptions={MOCK_EXAMS.map((e) => ({ id: e.id, title: e.title }))}
        timeRemainingSeconds={timeRemainingSeconds}
        isTimerRunning={isTimerRunning}
        onToggleTimer={() => setIsTimerRunning(!isTimerRunning)}
        onResetTimer={() => setTimeRemainingSeconds(80 * 60)}
        onFinishExam={handleFinishExam}
        answeredCount={totalAnswered}
        totalQuestions={totalQuestions}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* Review Mode Banner */}
        {showExplanations && (
          <div className="bg-amber-100 border-2 border-amber-300 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3 text-amber-950">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm uppercase">Korrektur-Modus aktiv:</span>
              <span className="text-xs sm:text-sm">
                Lösungen, Fehler-Erklärungen und A1-Hacks sind jetzt direkt bei den Aufgaben eingeblendet.
              </span>
            </div>
            <button
              onClick={() => setCurrentModule('analytics')}
              className="bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg"
            >
              Fehler-Analyse DB öffnen →
            </button>
          </div>
        )}

        {/* Current Module Content */}
        {currentModule === 'hoeren' && (
          <HoerenSection
            questions={activeExam.hoeren.questions}
            answers={answers}
            onSelectAnswer={handleSelectAnswer}
            showExplanations={showExplanations}
          />
        )}

        {currentModule === 'lesen' && (
          <LesenSection
            questions={activeExam.lesen.questions}
            answers={answers}
            onSelectAnswer={handleSelectAnswer}
            showExplanations={showExplanations}
          />
        )}

        {currentModule === 'schreiben' && (
          <SchreibenSection
            exam={activeExam}
            teil1Answers={schreibenTeil1Answers}
            onUpdateTeil1Answer={handleUpdateTeil1Answer}
            teil2Text={schreibenTeil2Text}
            onUpdateTeil2Text={setSchreibenTeil2Text}
            showExplanations={showExplanations}
          />
        )}

        {currentModule === 'sprechen' && (
          <SprechenSection
            sprechenData={activeExam.sprechen}
            selfScore={sprechenScore}
            onUpdateSelfScore={setSprechenScore}
          />
        )}

        {currentModule === 'analytics' && (
          <MistakeAnalyticsDashboard
            onTakeExamAgain={(id) => {
              if (id) handleSelectExam(id);
              setCurrentModule('hoeren');
            }}
          />
        )}

        {currentModule === 'hacks' && <HacksAndTipsSection />}
      </main>

      {/* Results Modal */}
      <ResultsModal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        result={lastResult}
        examTitle={activeExam.title}
        onViewAnalytics={() => {
          setIsResultsModalOpen(false);
          setCurrentModule('analytics');
        }}
        onReviewAnswers={handleReviewAnswers}
        onRestartExam={handleRestartExam}
      />

      {/* Official Footer matching Goethe CI */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white mb-1">
              Goethe-Zertifikat A1: Start Deutsch 1 — Prüfungssimulator & Fehler-Diagnose-DB
            </p>
            <p className="text-[11px] text-slate-500">
              Nach dem offiziellen Prüfungsformat des Goethe-Instituts e. V. und der telc gGmbH (Gemeinsamer europäischer Referenzrahmen CEFR A1).
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setCurrentModule('hacks')}
              className="hover:text-emerald-400 transition-colors"
            >
              Prüfungs-Hacks
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentModule('analytics')}
              className="hover:text-emerald-400 transition-colors"
            >
              Fehler-Analyse DB
            </button>
            <span>•</span>
            <span className="text-slate-600">© 2026 Goethe A1 Prep Suite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
