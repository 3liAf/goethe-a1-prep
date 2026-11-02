'use client';

import React from 'react';
import { EvaluationResult } from '@/lib/scoring';
import { Award, CheckCircle2, XCircle, BarChart3, RotateCcw, Eye, ArrowRight } from 'lucide-react';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: EvaluationResult | null;
  examTitle: string;
  onViewAnalytics: () => void;
  onReviewAnswers: () => void;
  onRestartExam: () => void;
}

export function ResultsModal({
  isOpen,
  onClose,
  result,
  examTitle,
  onViewAnalytics,
  onReviewAnswers,
  onRestartExam,
}: ResultsModalProps) {
  if (!isOpen || !result) return null;

  const { scores, passed, cefrGrade, mistakes } = result;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        {/* Banner */}
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 shadow-md ${
              passed ? 'bg-emerald-100 text-[#007346]' : 'bg-red-100 text-red-600'
            }`}
          >
            {passed ? <Award className="w-9 h-9" /> : <XCircle className="w-9 h-9" />}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {passed ? 'Herzlichen Glückwunsch! Bestanden!' : 'Leider nicht bestanden'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {examTitle} • Mindestanforderung zum Bestehen: 60 von 100 Punkten
          </p>
        </div>

        {/* Total Score Display */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl font-black text-slate-900">{scores.totalScaled}</span>
            <span className="text-xl font-bold text-slate-400">/ 100 Punkte</span>
          </div>

          <div className="mt-3">
            <span
              className={`inline-block font-bold text-sm px-4 py-1.5 rounded-full ${
                passed ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
              }`}
            >
              Prädikat: {cefrGrade}
            </span>
          </div>
        </div>

        {/* 4 Modules Breakdown Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { name: 'Hören', score: scores.hoeren.scaled, max: 25, raw: scores.hoeren.raw, rawMax: 15 },
            { name: 'Lesen', score: scores.lesen.scaled, max: 25, raw: scores.lesen.raw, rawMax: 15 },
            { name: 'Schreiben', score: scores.schreiben.scaled, max: 25, raw: scores.schreiben.raw, rawMax: 15 },
            { name: 'Sprechen', score: scores.sprechen.scaled, max: 25, raw: scores.sprechen.raw, rawMax: 15 },
          ].map((m) => {
            const isPassing = m.score >= 15;
            return (
              <div key={m.name} className="p-3 bg-white border border-slate-200 rounded-lg text-center shadow-2xs">
                <span className="text-xs font-bold text-slate-600 uppercase block">{m.name}</span>
                <p className="text-lg font-black text-slate-900 mt-1 font-mono">
                  {m.score} <span className="text-xs text-slate-400 font-normal">/ {m.max}</span>
                </p>
                <span className="text-[10px] text-slate-500 block">
                  ({m.raw}/{m.rawMax} roh)
                </span>
                <span
                  className={`text-[10px] font-bold block mt-1 ${
                    isPassing ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {isPassing ? '✓ Bestanden' : '✗ < 60%'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Database Saved Notice */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3.5 mb-6 text-xs text-indigo-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>{mistakes.length} Fehler</strong> wurden kategorisiert und in Ihrer persönlichen Diagnose-DB gespeichert!
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={onViewAnalytics}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Fehler-Analyse DB öffnen</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onReviewAnswers}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-[#007346] hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Lösungen im Test prüfen</span>
          </button>

          <button
            onClick={onRestartExam}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Test neu starten</span>
          </button>
        </div>
      </div>
    </div>
  );
}
