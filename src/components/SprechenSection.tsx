'use client';

import React, { useState } from 'react';
import { SprechenModuleData } from '@/types/exam';
import { speakGermanText, stopSpeaking } from '@/lib/speech';
import { Volume2, Mic, CheckCircle2, Lightbulb, Play, UserCheck, HelpCircle } from 'lucide-react';

interface SprechenSectionProps {
  sprechenData: SprechenModuleData;
  selfScore: number;
  onUpdateSelfScore: (score: number) => void;
}

export function SprechenSection({
  sprechenData,
  selfScore,
  onUpdateSelfScore,
}: SprechenSectionProps) {
  const [activeSpeechIndex, setActiveSpeechIndex] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handleSpeak = (id: string, text: string) => {
    if (activeSpeechIndex === id) {
      stopSpeaking();
      setActiveSpeechIndex(null);
      return;
    }
    setActiveSpeechIndex(id);
    speakGermanText(text, {
      onEnd: () => setActiveSpeechIndex(null),
      onError: () => setActiveSpeechIndex(null),
    });
  };

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const teil1 = sprechenData.teil1;
  const teil2Cards = sprechenData.teil2Cards;
  const teil3Cards = sprechenData.teil3Cards;

  return (
    <div className="space-y-8">
      {/* Module Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-xl font-black text-slate-900 mb-1">Sprechen (Oral Examination)</h2>
        <p className="text-sm text-slate-600 mb-3">
          Reguläre Prüfungszeit: <strong>circa 15 Minuten</strong> (in der Gruppe) • maximal 15 Punkte (25% der Gesamtnote).
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded-md">
            Teil 1: Sich vorstellen + Buchstabieren + Zahlen (5 Punkte)
          </span>
          <span className="bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded-md">
            Teil 2: Um Informationen bitten & antworten (5 Punkte)
          </span>
          <span className="bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded-md">
            Teil 3: Bitten formulieren & reagieren (5 Punkte)
          </span>
        </div>
      </div>

      {/* Teil 1: Sich vorstellen */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="mb-4">
          <span className="bg-[#007346] text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase">
            Teil 1 — Sich vorstellen
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Persönliche Vorstellung anhand von 7 Stichworten (5 Punkte)
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Klicken Sie auf den Lautsprecher, um die deutsche Aussprache jedes Satzes anzuhören.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {teil1.sampleSelfIntro.map((item, idx) => {
            const isPlaying = activeSpeechIndex === `intro-${idx}`;
            const isChecked = checkedItems[`intro-${idx}`] || false;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                  isChecked ? 'bg-emerald-50/60 border-emerald-400' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-slate-200 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      {item.keyword}
                    </span>
                    <span className="text-xs text-slate-500 italic">{item.englishMeaning}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{item.germanPhrase}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleSpeak(`intro-${idx}`, item.germanPhrase)}
                    title="Aussprache anhören"
                    className={`p-2 rounded-md transition-colors ${
                      isPlaying
                        ? 'bg-red-500 text-white'
                        : 'bg-white border border-slate-200 text-[#007346] hover:bg-emerald-50'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleCheck(`intro-${idx}`)}
                    title="Als geübt markieren"
                    className={`p-2 rounded-md transition-colors ${
                      isChecked
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Follow-up questions (Spelling & Numbers) */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-4">
          <div className="font-bold text-amber-950 text-sm mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>Zusatzfragen der Prüfer (Buchstabieren & Zahlen):</span>
          </div>
          <div className="space-y-3">
            {teil1.followUpQuestions.map((q, i) => (
              <div key={i} className="bg-white p-3 rounded-md border border-amber-200/80">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800">Frage {i + 1}: &ldquo;{q.question}&rdquo;</span>
                  <button
                    onClick={() => handleSpeak(`q-${i}`, q.question + ' ' + q.sampleAnswer)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Anhören
                  </button>
                </div>
                <p className="text-xs text-slate-700 font-mono bg-slate-50 p-1.5 rounded">
                  Antwort: <strong>{q.sampleAnswer}</strong>
                </p>
                <p className="text-[11px] text-amber-800 mt-1 italic">💡 Hack: {q.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teil 2: Um Informationen bitten & geben */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="mb-4">
          <span className="bg-[#007346] text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase">
            Teil 2 — Thema-Karten
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Um Informationen bitten und Informationen geben (5 Punkte)
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Sie ziehen eine Karte mit einem Thema und einem Wort. Bilden Sie eine Frage mit &ldquo;Sie&rdquo;!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teil2Cards.map((card) => {
            const isPlaying = activeSpeechIndex === card.id;

            return (
              <div key={card.id} className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50 hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Thema: <strong className="text-emerald-700">{card.topic}</strong>
                  </span>
                  <span className="bg-[#007346] text-white text-xs font-bold px-2 py-0.5 rounded">
                    Wort: {card.keyword}
                  </span>
                </div>

                <div className="space-y-2 mb-3 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">Musterfrage:</span>
                    <p className="text-sm font-bold text-slate-900">&ldquo;{card.sampleQuestion}&rdquo;</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">Musterantwort:</span>
                    <p className="text-xs text-slate-700">&ldquo;{card.sampleAnswer}&rdquo;</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="italic">💡 {card.hackTip}</span>
                  <button
                    onClick={() => handleSpeak(card.id, card.sampleQuestion + ' ... ' + card.sampleAnswer)}
                    className="flex items-center gap-1 font-bold text-[#007346] hover:text-emerald-800 bg-white border border-slate-200 px-2.5 py-1 rounded"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlaying ? 'Spielt...' : 'Audio'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Teil 3: Bitten formulieren und reagieren */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="mb-4">
          <span className="bg-[#007346] text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase">
            Teil 3 — Bitten & Reagieren
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Höfliche Bitte formulieren und darauf reagieren (5 Punkte)
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Sie sehen ein Bild / Gegenstand. Formulieren Sie eine höfliche Bitte mit &ldquo;Können Sie bitte...?&rdquo;.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teil3Cards.map((card) => {
            const isPlaying = activeSpeechIndex === card.id;

            return (
              <div key={card.id} className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50 hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                    Gegenstand: {card.keyword}
                  </span>
                </div>

                <div className="space-y-2 mb-3 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">Höfliche Bitte:</span>
                    <p className="text-sm font-bold text-slate-900">&ldquo;{card.sampleQuestion}&rdquo;</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">Natürliche Reaktion:</span>
                    <p className="text-xs text-slate-700">&ldquo;{card.sampleAnswer}&rdquo;</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="italic">💡 {card.hackTip}</span>
                  <button
                    onClick={() => handleSpeak(card.id, card.sampleQuestion + ' ... ' + card.sampleAnswer)}
                    className="flex items-center gap-1 font-bold text-[#007346] hover:text-emerald-800 bg-white border border-slate-200 px-2.5 py-1 rounded"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlaying ? 'Spielt...' : 'Audio'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Self-Rating Score Selector */}
      <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h4 className="text-base font-bold text-emerald-950">
              Sprechen Selbstbewertung (für Gesamtnote):
            </h4>
            <p className="text-xs text-slate-600">
              Wie flüssig konnten Sie die Sätze formulieren? (0 bis 15 Punkte)
            </p>
          </div>
          <span className="bg-[#007346] text-white text-base font-black px-4 py-1.5 rounded-lg shadow-xs">
            {selfScore} / 15 Punkte
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="15"
          value={selfScore}
          onChange={(e) => onUpdateSelfScore(Number(e.target.value))}
          className="w-full accent-[#007346] cursor-pointer mt-2"
        />
        <div className="flex justify-between text-[11px] text-slate-500 font-semibold mt-1">
          <span>0 (Nicht vorbereitet)</span>
          <span>9 (60% Bestehensgrenze)</span>
          <span>15 (Volle Punktzahl)</span>
        </div>
      </div>
    </div>
  );
}
