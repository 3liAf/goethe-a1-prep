'use client';

import React, { useState } from 'react';
import { LesenQuestion } from '@/types/exam';
import { Globe, Lightbulb, CheckCircle2, XCircle, Mail, FileText, AlertCircle } from 'lucide-react';
import { MISTAKE_CATEGORIES } from '@/data/hacks-and-tips';

interface LesenSectionProps {
  questions: LesenQuestion[];
  answers: Record<string, string>;
  onSelectAnswer: (questionId: string, answerId: string) => void;
  showExplanations?: boolean;
}

export function LesenSection({
  questions,
  answers,
  onSelectAnswer,
  showExplanations = false,
}: LesenSectionProps) {
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  const toggleSolution = (id: string) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const teil1Questions = questions.filter((q) => q.teil === 1);
  const teil2Questions = questions.filter((q) => q.teil === 2);
  const teil3Questions = questions.filter((q) => q.teil === 3);

  const renderSolutionBox = (q: LesenQuestion) => {
    const isSolutionOpen = showExplanations || revealedSolutions[q.id];
    if (!isSolutionOpen) return null;
    const categoryInfo = MISTAKE_CATEGORIES[q.mistakeCategory];

    return (
      <div className="mt-4 p-4 rounded-lg bg-amber-50/90 border border-amber-200 text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-bold text-amber-950 mb-1.5">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          <span>Erklärung & Goethe-A1 Hack:</span>
          <span className="text-[11px] font-normal bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full ml-auto">
            Kategorie: {categoryInfo?.nameEn || q.mistakeCategory}
          </span>
        </div>
        <p className="text-slate-800 mb-2 leading-relaxed">{q.explanationDe}</p>
        <p className="text-slate-600 mb-3 text-xs italic">{q.explanationEn}</p>
        <div className="bg-white p-2.5 rounded-md border border-amber-200/60 flex items-start gap-2 text-amber-900 font-medium">
          <span className="font-bold text-amber-700">💡 Hack:</span>
          <span>{q.hackTip}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Module Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-xl font-black text-slate-900 mb-1">Lesen (Reading Comprehension)</h2>
        <p className="text-sm text-slate-600 mb-3">
          Reguläre Prüfungszeit: <strong>circa 25 Minuten</strong> • 15 Aufgaben • maximal 15 Punkte (25% der Gesamtnote).
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded-md">
            Teil 1: 5 Aufgaben (E-Mails & Notizen)
          </span>
          <span className="bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded-md">
            Teil 2: 5 Aufgaben (Websites & Anzeigen A/B)
          </span>
          <span className="bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded-md">
            Teil 3: 5 Aufgaben (Schilder & Aushänge)
          </span>
        </div>
      </div>

      {/* Teil 1 */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900">Teil 1 — Aufgaben 1 bis 5</h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Lesen Sie die Texte und die Aufgaben 1 bis 5. Kreuzen Sie an: <strong>Richtig</strong> oder <strong>Falsch</strong>.
          </p>
        </div>

        <div className="space-y-6">
          {teil1Questions.map((q) => {
            const selectedAnswer = answers[q.id] || '';
            const isCorrect = selectedAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
            const isSolutionOpen = showExplanations || revealedSolutions[q.id];

            return (
              <div
                key={q.id}
                id={`question-${q.id}`}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 transition-all hover:border-slate-300"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="bg-[#007346] text-white text-xs font-bold px-2.5 py-1 rounded-md">
                    Aufgabe {q.number}
                  </span>
                  <button
                    onClick={() => toggleSolution(q.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{isSolutionOpen ? 'Lösung schließen' : 'Lösung & Tipp'}</span>
                  </button>
                </div>

                {/* Simulated Email / Note Box */}
                {q.textContext && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 font-sans">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-2 mb-2">
                      <Mail className="w-4 h-4 text-emerald-700" />
                      <span>{q.textContext.title}</span>
                      {q.textContext.sender && <span className="text-slate-500 ml-auto">Von: {q.textContext.sender}</span>}
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-line">
                      {q.textContext.body}
                    </p>
                  </div>
                )}

                {/* Statement */}
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase">Aussage zur Prüfung:</span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">{q.statement}</h4>
                </div>

                {/* Richtig / Falsch Radios */}
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  {['richtig', 'falsch'].map((choice) => {
                    const isChecked = selectedAnswer.toLowerCase() === choice;
                    const isOptionCorrect = choice === q.correctAnswer.toLowerCase();
                    const showCorrect = isSolutionOpen && isOptionCorrect;
                    const showWrong = isSolutionOpen && isChecked && !isCorrect;

                    return (
                      <label
                        key={choice}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer font-bold text-sm transition-all ${
                          showCorrect
                            ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                            : showWrong
                            ? 'bg-red-50 border-red-400'
                            : isChecked
                            ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name={`reading-${q.id}`}
                            value={choice}
                            checked={isChecked}
                            onChange={() => onSelectAnswer(q.id, choice)}
                            className="h-4 w-4 text-[#007346] focus:ring-emerald-500 border-slate-300"
                          />
                          <span className="capitalize">{choice}</span>
                        </div>
                        {showCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                        {showWrong && <XCircle className="w-4 h-4 text-red-600" />}
                      </label>
                    );
                  })}
                </div>

                {renderSolutionBox(q)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Teil 2: Situational Website Choices (A vs B) */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900">Teil 2 — Aufgaben 6 bis 10</h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Lesen Sie die Information und die Aufgaben 6 bis 10. Wo finden Sie, was Sie suchen? Kreuzen Sie an: <strong>Website a</strong> oder <strong>Website b</strong>.
          </p>
        </div>

        <div className="space-y-7">
          {teil2Questions.map((q) => {
            const selectedAnswer = answers[q.id] || '';
            const isCorrect = selectedAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
            const isSolutionOpen = showExplanations || revealedSolutions[q.id];

            return (
              <div
                key={q.id}
                id={`question-${q.id}`}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 transition-all hover:border-slate-300"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="bg-[#007346] text-white text-xs font-bold px-2.5 py-1 rounded-md">
                    Aufgabe {q.number}
                  </span>
                  <button
                    onClick={() => toggleSolution(q.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{isSolutionOpen ? 'Lösung schließen' : 'Lösung & Tipp'}</span>
                  </button>
                </div>

                {/* Situation */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3.5 mb-4">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">
                    Ihre Situation / Was Sie suchen:
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-900 mt-1">{q.statement}</p>
                </div>

                {/* Website A & B Cards */}
                {q.websiteOptions && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {q.websiteOptions.map((site) => {
                      const isChecked = selectedAnswer.toLowerCase() === site.id.toLowerCase();
                      const isSiteCorrect = site.id.toLowerCase() === q.correctAnswer.toLowerCase();
                      const showCorrect = isSolutionOpen && isSiteCorrect;
                      const showWrong = isSolutionOpen && isChecked && !isCorrect;

                      return (
                        <div
                          key={site.id}
                          onClick={() => onSelectAnswer(q.id, site.id)}
                          className={`rounded-lg border p-4 cursor-pointer transition-all flex flex-col justify-between ${
                            showCorrect
                              ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500'
                              : showWrong
                              ? 'bg-red-50 border-red-400'
                              : isChecked
                              ? 'bg-emerald-50/40 border-emerald-600 ring-1 ring-emerald-600'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <div>
                            {/* Browser style URL bar */}
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-white border border-slate-200 rounded px-2 py-1 mb-2 font-mono">
                              <Globe className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{site.url}</span>
                            </div>

                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-[#007346] text-white text-xs font-bold px-2 py-0.5 rounded uppercase">
                                Website {site.id}
                              </span>
                              <h5 className="font-bold text-sm text-slate-900">{site.title}</h5>
                            </div>

                            <p className="text-xs text-slate-700 font-medium mb-2">{site.snippet}</p>

                            <ul className="text-xs text-slate-600 space-y-1 mb-3">
                              {site.details.map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-emerald-700 font-bold">•</span>
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <button
                            type="button"
                            className={`w-full py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
                              isChecked
                                ? 'bg-[#007346] text-white'
                                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span>Website ({site.id.toUpperCase()}) auswählen</span>
                            {showCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-200" />}
                            {showWrong && <XCircle className="w-4 h-4 text-red-300" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {renderSolutionBox(q)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Teil 3: Signs & Notices */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900">Teil 3 — Aufgaben 11 bis 15</h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Lesen Sie die Schilder und Aushänge. Kreuzen Sie an: <strong>Richtig</strong> oder <strong>Falsch</strong>.
          </p>
        </div>

        <div className="space-y-6">
          {teil3Questions.map((q) => {
            const selectedAnswer = answers[q.id] || '';
            const isCorrect = selectedAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
            const isSolutionOpen = showExplanations || revealedSolutions[q.id];

            return (
              <div
                key={q.id}
                id={`question-${q.id}`}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 transition-all hover:border-slate-300"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="bg-[#007346] text-white text-xs font-bold px-2.5 py-1 rounded-md">
                    Aufgabe {q.number}
                  </span>
                  <button
                    onClick={() => toggleSolution(q.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{isSolutionOpen ? 'Lösung schließen' : 'Lösung & Tipp'}</span>
                  </button>
                </div>

                {/* Simulated Signboard Card */}
                {q.textContext && (
                  <div className="bg-amber-50/50 border-2 border-amber-300 rounded-lg p-4 mb-4 text-center max-w-lg mx-auto shadow-xs">
                    <span className="text-[10px] uppercase tracking-widest font-black text-amber-900 block mb-1">
                      {q.textContext.title}
                    </span>
                    <p className="text-base font-bold text-slate-900 leading-snug font-mono">
                      {q.textContext.body}
                    </p>
                  </div>
                )}

                {/* Statement */}
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase">Aussage zum Schild:</span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">{q.statement}</h4>
                </div>

                {/* Richtig / Falsch Radios */}
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  {['richtig', 'falsch'].map((choice) => {
                    const isChecked = selectedAnswer.toLowerCase() === choice;
                    const isOptionCorrect = choice === q.correctAnswer.toLowerCase();
                    const showCorrect = isSolutionOpen && isOptionCorrect;
                    const showWrong = isSolutionOpen && isChecked && !isCorrect;

                    return (
                      <label
                        key={choice}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer font-bold text-sm transition-all ${
                          showCorrect
                            ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                            : showWrong
                            ? 'bg-red-50 border-red-400'
                            : isChecked
                            ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name={`sign-${q.id}`}
                            value={choice}
                            checked={isChecked}
                            onChange={() => onSelectAnswer(q.id, choice)}
                            className="h-4 w-4 text-[#007346] focus:ring-emerald-500 border-slate-300"
                          />
                          <span className="capitalize">{choice}</span>
                        </div>
                        {showCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                        {showWrong && <XCircle className="w-4 h-4 text-red-600" />}
                      </label>
                    );
                  })}
                </div>

                {renderSolutionBox(q)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
