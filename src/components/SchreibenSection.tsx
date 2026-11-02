'use client';

import React, { useState } from 'react';
import { SchreibenTeil1Form, SchreibenTeil2Task, MockExam } from '@/types/exam';
import { evaluateSchreibenTeil2 } from '@/lib/scoring';
import { Check, X, Lightbulb, Sparkles, AlertCircle, FileText, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { MISTAKE_CATEGORIES } from '@/data/hacks-and-tips';

interface SchreibenSectionProps {
  exam: MockExam;
  teil1Answers: Record<number, string>;
  onUpdateTeil1Answer: (fieldNumber: number, value: string) => void;
  teil2Text: string;
  onUpdateTeil2Text: (text: string) => void;
  showExplanations?: boolean;
}

export function SchreibenSection({
  exam,
  teil1Answers,
  onUpdateTeil1Answer,
  teil2Text,
  onUpdateTeil2Text,
  showExplanations = false,
}: SchreibenSectionProps) {
  const [checkedTeil1, setCheckedTeil1] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<ReturnType<typeof evaluateSchreibenTeil2> | null>(null);
  const [showSampleSolution, setShowSampleSolution] = useState(false);

  const teil1 = exam.schreiben.teil1;
  const teil2 = exam.schreiben.teil2;

  // Words calculation
  const cleanWords = teil2Text.trim() ? teil2Text.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = cleanWords.length;

  const handleEvaluateTeil2 = () => {
    const res = evaluateSchreibenTeil2(teil2Text, exam);
    setEvaluationResult(res);
  };

  return (
    <div className="space-y-8">
      {/* Module Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-xl font-black text-slate-900 mb-1">Schreiben (Written Expression)</h2>
        <p className="text-sm text-slate-600 mb-3">
          Reguläre Prüfungszeit: <strong>circa 20 Minuten</strong> • maximal 15 Punkte (25% der Gesamtnote).
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded-md">
            Teil 1: 5 Formularfelder ausfüllen (5 Punkte)
          </span>
          <span className="bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded-md">
            Teil 2: E-Mail / Mitteilung schreiben (10 Punkte)
          </span>
        </div>
      </div>

      {/* Teil 1: Formular ausfüllen */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <span className="bg-[#007346] text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase">
              Teil 1 — Formular ausfüllen
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">5 fehlende Informationen eintragen (5 Punkte)</h3>
          </div>
          <button
            onClick={() => setCheckedTeil1(!checkedTeil1)}
            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg hover:bg-emerald-100"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{checkedTeil1 ? 'Lösungen verbergen' : 'Formular-Antworten prüfen'}</span>
          </button>
        </div>

        {/* Scenario description */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-sm text-slate-800 leading-relaxed font-serif">
          <p>{teil1.scenarioText}</p>
        </div>

        {/* Official Form Replica */}
        <div className="border-2 border-slate-300 rounded-xl overflow-hidden max-w-2xl mx-auto bg-slate-50 shadow-inner">
          <div className="bg-[#007346] text-white text-center py-2.5 px-4 font-bold text-sm tracking-wide uppercase">
            {teil1.formTitle}
          </div>

          <div className="p-5 space-y-4 bg-white">
            {/* Pre-filled static fields */}
            {teil1.staticFields.map((field, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-600">{field.label}:</span>
                <span className="text-sm font-semibold text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded">
                  {field.value}
                </span>
              </div>
            ))}

            {/* Interactive Fields 1 to 5 */}
            {teil1.fieldsToFill.map((field) => {
              const userVal = teil1Answers[field.fieldNumber] || '';
              const isCorrect = field.correctAnswers.some((ans) => {
                const cleanAns = ans.trim().toLowerCase();
                return userVal.trim().toLowerCase() === cleanAns || (userVal.trim().length > 0 && cleanAns.includes(userVal.trim().toLowerCase()));
              });
              const showResult = checkedTeil1 || showExplanations;
              const categoryInfo = MISTAKE_CATEGORIES[field.mistakeCategory];

              return (
                <div key={field.fieldNumber} className="border-b border-slate-100 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="bg-[#007346] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                        {field.fieldNumber}
                      </span>
                      <span>{field.label}:</span>
                    </label>

                    {/* Radio or Text Input */}
                    {field.type === 'radio' && field.selectOptions ? (
                      <div className="flex items-center gap-4">
                        {field.selectOptions.map((opt) => (
                          <label key={opt} className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-slate-800">
                            <input
                              type="radio"
                              name={`schreiben-f${field.fieldNumber}`}
                              value={opt}
                              checked={userVal.toLowerCase() === opt.toLowerCase()}
                              onChange={() => onUpdateTeil1Answer(field.fieldNumber, opt)}
                              className="text-[#007346] focus:ring-emerald-500 h-3.5 w-3.5"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={userVal}
                        onChange={(e) => onUpdateTeil1Answer(field.fieldNumber, e.target.value)}
                        placeholder={field.placeholder}
                        className={`text-sm font-medium px-3 py-1.5 rounded-md border max-w-xs w-full focus:outline-hidden focus:ring-2 ${
                          showResult
                            ? isCorrect
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 focus:ring-emerald-400'
                              : 'bg-red-50 border-red-400 text-red-900 focus:ring-red-400'
                            : 'bg-white border-slate-300 focus:ring-[#007346]'
                        }`}
                      />
                    )}
                  </div>

                  {/* Immediate Feedback Note */}
                  {showResult && (
                    <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-md border border-slate-200">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        {isCorrect ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Richtig (+1 Punkt)
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> Nicht korrekt (0 Punkte)
                          </span>
                        )}
                        <span className="text-slate-500 ml-auto text-[11px]">
                          Erwartet: <strong>{field.correctAnswers.join(' / ')}</strong>
                        </span>
                      </div>
                      <p className="text-slate-700">{field.explanationEn}</p>
                      <p className="text-amber-800 font-semibold mt-1">💡 Hack: {field.hackTip}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Teil 2: Kurze Mitteilung schreiben */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="mb-4">
          <span className="bg-[#007346] text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase">
            Teil 2 — E-Mail schreiben
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-1">Kurze Mitteilung verfassen (10 Punkte)</h3>
        </div>

        {/* Task prompt */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-5 text-sm text-slate-800 leading-relaxed font-sans">
          <p className="font-semibold mb-2">{teil2.situationText}</p>
          <div className="bg-white p-3 rounded-md border border-slate-200 mt-2">
            <span className="text-xs font-bold text-emerald-800 uppercase block mb-1.5">
              Schreiben Sie zu jedem der 3 Leitpunkte 1 bis 2 Sätze (ca. 30 Wörter):
            </span>
            <ul className="text-xs sm:text-sm text-slate-800 space-y-1 list-disc list-inside">
              {teil2.leitpunkte.map((lp, idx) => (
                <li key={idx} className="font-medium">
                  {lp}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Textbox & Toolbar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
            <span>Ihr Prüfungstext (E-Mail):</span>
            <div className="flex items-center gap-2">
              <span>Wörter:</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded-full ${
                  wordCount >= 25 && wordCount <= 45
                    ? 'bg-emerald-100 text-emerald-800'
                    : wordCount < 25
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {wordCount} Wörter {wordCount >= 25 ? '✓' : '(Ziel: ~30-35)'}
              </span>
            </div>
          </div>

          <textarea
            rows={8}
            value={teil2Text}
            onChange={(e) => onUpdateTeil2Text(e.target.value)}
            placeholder="Sehr geehrte Damen und Herren, / Lieber Martin,&#10;&#10;ich schreibe Ihnen, weil...&#10;&#10;Mit freundlichen Grüßen&#10;[Ihr Name]"
            className="w-full text-sm font-sans p-3.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#007346] leading-relaxed resize-y"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            <button
              onClick={handleEvaluateTeil2}
              className="flex items-center gap-2 bg-[#007346] hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-lg shadow-xs transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>E-Mail automatisch bewerten (Kriterien-Check)</span>
            </button>

            <button
              onClick={() => setShowSampleSolution(!showSampleSolution)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showSampleSolution ? 'Musterlösung verbergen' : '10/10 Musterlösung ansehen'}</span>
              {showSampleSolution ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Automated Rubric Evaluation Results */}
        {evaluationResult && (
          <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-5 mt-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 font-black text-emerald-950 text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>Goethe A1 Schreib-Bewertung:</span>
              </div>
              <span className="bg-[#007346] text-white text-sm font-black px-3 py-1 rounded-md">
                {evaluationResult.scoreOutOf10} / 10 Punkte
              </span>
            </div>

            {/* Checklist of 3 Leitpunkte */}
            <div className="space-y-2 mb-4 bg-white p-3.5 rounded-lg border border-emerald-200">
              <span className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Erfüllung der Aufgabenstellung (Leitpunkte):
              </span>
              {evaluationResult.leitpunkteResults.map((lp, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  {lp.covered ? (
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <span className={lp.covered ? 'font-medium text-slate-800' : 'text-red-700 font-medium'}>
                      Leitpunkt {i + 1}: {lp.point}
                    </span>
                    {!lp.covered && <p className="text-[11px] text-slate-500 italic mt-0.5">Tipp: {lp.tip}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Feedback Notes */}
            <div className="text-xs text-slate-800 space-y-1">
              <span className="font-bold text-slate-900 block">Detailliertes Feedback:</span>
              {evaluationResult.feedbackNotes.map((note, idx) => (
                <p key={idx} className="flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>{note}</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* 10/10 Sample Solution */}
        {showSampleSolution && (
          <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-5 mt-4 text-xs sm:text-sm">
            <div className="font-bold text-amber-950 flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Offizielle 10/10 Punkte Musterlösung:</span>
            </div>
            <pre className="bg-white p-3.5 rounded-lg border border-amber-200 font-serif whitespace-pre-wrap text-slate-900 leading-relaxed">
              {teil2.sampleSolution}
            </pre>
            <div className="mt-3 space-y-1 text-xs text-amber-950">
              <span className="font-bold">Erfolgs-Hacks für 10 Punkte:</span>
              {teil2.hacks.map((h, i) => (
                <p key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-700 font-bold">✓</span>
                  <span>{h}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
