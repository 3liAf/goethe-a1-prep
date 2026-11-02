'use client';

import React, { useState } from 'react';
import { HoerenQuestion } from '@/types/exam';
import { speakGermanText, stopSpeaking, isSpeaking } from '@/lib/speech';
import { Play, Square, Volume2, HelpCircle, AlertTriangle, Eye, EyeOff, Lightbulb, CheckCircle2, XCircle } from 'lucide-react';
import { MISTAKE_CATEGORIES } from '@/data/hacks-and-tips';

interface HoerenSectionProps {
  questions: HoerenQuestion[];
  answers: Record<string, string>;
  onSelectAnswer: (questionId: string, answerId: string) => void;
  showExplanations?: boolean;
}

export function HoerenSection({
  questions,
  answers,
  onSelectAnswer,
  showExplanations = false,
}: HoerenSectionProps) {
  // Play count tracker per question
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({});
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [revealedTranscripts, setRevealedTranscripts] = useState<Record<string, boolean>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  const handlePlayAudio = (q: HoerenQuestion) => {
    const currentPlays = playCounts[q.id] || 0;
    if (currentPlays >= q.playLimit && !showExplanations) {
      alert(`Prüfungsregel: In Teil ${q.teil} darf dieses Audio maximal ${q.playLimit}x abgespielt werden!`);
      return;
    }

    if (activePlayingId === q.id) {
      stopSpeaking();
      setActivePlayingId(null);
      return;
    }

    setPlayCounts((prev) => ({
      ...prev,
      [q.id]: currentPlays + 1,
    }));
    setActivePlayingId(q.id);

    speakGermanText(q.audioScript, {
      onEnd: () => setActivePlayingId(null),
      onError: () => setActivePlayingId(null),
    });
  };

  const handleStopAudio = () => {
    stopSpeaking();
    setActivePlayingId(null);
  };

  const toggleTranscript = (id: string) => {
    setRevealedTranscripts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleSolution = (id: string) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Group by Teil
  const teil1Questions = questions.filter((q) => q.teil === 1);
  const teil2Questions = questions.filter((q) => q.teil === 2);
  const teil3Questions = questions.filter((q) => q.teil === 3);

  const renderQuestionCard = (q: HoerenQuestion) => {
    const plays = playCounts[q.id] || 0;
    const isPlaying = activePlayingId === q.id;
    const isOverLimit = plays >= q.playLimit && !showExplanations;
    const isTranscriptOpen = revealedTranscripts[q.id] || false;
    const isSolutionOpen = showExplanations || revealedSolutions[q.id] || false;
    const selectedAnswer = answers[q.id] || '';
    const isCorrect = selectedAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
    const categoryInfo = MISTAKE_CATEGORIES[q.mistakeCategory];

    return (
      <div
        key={q.id}
        id={`question-${q.id}`}
        className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 transition-all hover:border-slate-300"
      >
        {/* Question Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#007346] text-white text-xs font-bold px-2.5 py-1 rounded-md">
              Aufgabe {q.number}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {q.teil === 2 ? 'Öffentliche Durchsage' : q.teil === 1 ? 'Kurzgespräch' : 'Telefonansage'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Play Limit Badge */}
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                q.playLimit === 1
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              {q.playLimit === 1 ? '1x hören (Teil 2 Regel)' : '2x hören erlaubt'}
            </span>

            <span className="text-xs font-medium text-slate-500">
              Gespielt: <strong className="text-slate-900">{plays}</strong>/{q.playLimit}
            </span>
          </div>
        </div>

        {/* Question Text */}
        <h4 className="text-base font-bold text-slate-900 mb-4">{q.question}</h4>

        {/* Official Goethe Audio Player Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePlayAudio(q)}
              disabled={isOverLimit && !isPlaying}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all shadow-xs ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : isOverLimit
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#007346] hover:bg-emerald-800 text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stopp</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{plays === 0 ? 'Hörsequenz abspielen' : 'Noch einmal hören'}</span>
                </>
              )}
            </button>

            {isPlaying && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 animate-pulse">
                <Volume2 className="w-4 h-4" />
                <span>Audio läuft...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleTranscript(q.id)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-md hover:bg-slate-50"
            >
              {isTranscriptOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isTranscriptOpen ? 'Transkript verbergen' : 'Transkript (Text)'}</span>
            </button>

            <button
              onClick={() => toggleSolution(q.id)}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-md hover:bg-amber-100"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{isSolutionOpen ? 'Lösung schließen' : 'Lösung & Hack'}</span>
            </button>
          </div>
        </div>

        {/* Revealed Audio Transcript */}
        {isTranscriptOpen && (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3.5 mb-4 text-xs sm:text-sm text-slate-800">
            <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" />
              <span>Gesprochener Originaltext (Transkript):</span>
            </div>
            <p className="italic leading-relaxed font-serif bg-white p-2.5 rounded-md border border-emerald-100">
              &ldquo;{q.audioScript}&rdquo;
            </p>
          </div>
        )}

        {/* Options */}
        <div className="space-y-2.5 mb-4">
          {q.options.map((opt) => {
            const isChecked = selectedAnswer.toLowerCase() === opt.id.toLowerCase();
            const isOptionCorrect = opt.id.toLowerCase() === q.correctAnswer.toLowerCase();
            const showCorrectStyle = isSolutionOpen && isOptionCorrect;
            const showWrongStyle = isSolutionOpen && isChecked && !isCorrect;

            return (
              <label
                key={opt.id}
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                  showCorrectStyle
                    ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                    : showWrongStyle
                    ? 'bg-red-50 border-red-400'
                    : isChecked
                    ? 'bg-emerald-50/60 border-emerald-600 ring-1 ring-emerald-600'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value={opt.id}
                  checked={isChecked}
                  onChange={() => onSelectAnswer(q.id, opt.id)}
                  className="mt-0.5 h-4 w-4 text-[#007346] focus:ring-emerald-500 border-slate-300"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">
                      <strong className="text-[#007346] mr-2 uppercase">
                        {opt.id === 'richtig' || opt.id === 'falsch' ? opt.id.toUpperCase() : `(${opt.id.toUpperCase()})`}
                      </strong>
                      {opt.text}
                    </span>
                    {showCorrectStyle && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" /> Richtig
                      </span>
                    )}
                    {showWrongStyle && (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                        <XCircle className="w-4 h-4" /> Deine Wahl
                      </span>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Solution & Hack Tip Box */}
        {isSolutionOpen && (
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
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Module Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-1">Hören (Listening Comprehension)</h2>
            <p className="text-sm text-slate-600 mb-3">
              Reguläre Prüfungszeit: <strong>circa 20 Minuten</strong> • 15 Aufgaben • maximal 15 Punkte (25% der Gesamtnote).
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded-md">
                Teil 1: 6 Aufgaben (2x hören)
              </span>
              <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Teil 2: 4 Durchsagen (NUR 1x hören!)
              </span>
              <span className="bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded-md">
                Teil 3: 5 Telefonansagen (2x hören)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Teil 1 */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900">Teil 1 — Aufgaben 1 bis 6</h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Was ist richtig? Kreuzen Sie die richtige Antwort an. Sie hören jeden Text <strong>zweimal</strong>.
          </p>
        </div>
        <div className="space-y-5">{teil1Questions.map(renderQuestionCard)}</div>
      </div>

      {/* Teil 2 */}
      <div>
        <div className="mb-4 bg-amber-50/80 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Teil 2 — Aufgaben 7 bis 10 (ACHTUNG: Nur EINMAL hören!)</span>
          </div>
          <p className="text-xs text-amber-800">
            Kreuzen Sie an: <strong>Richtig</strong> oder <strong>Falsch</strong>. Sie hören jeden Text nur <strong>einmal</strong>.
          </p>
        </div>
        <div className="space-y-5">{teil2Questions.map(renderQuestionCard)}</div>
      </div>

      {/* Teil 3 */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900">Teil 3 — Aufgaben 11 bis 15</h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Was ist richtig? Kreuzen Sie die richtige Antwort an. Sie hören jeden Text <strong>zweimal</strong>.
          </p>
        </div>
        <div className="space-y-5">{teil3Questions.map(renderQuestionCard)}</div>
      </div>
    </div>
  );
}
