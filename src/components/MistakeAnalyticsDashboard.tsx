'use client';

import React, { useState, useEffect } from 'react';
import {
  getMistakeAnalytics,
  getExamAttempts,
  deleteAttempt,
  clearAllAttempts,
  exportDataAsJson,
  importDataFromJson,
  MistakeAnalyticsSummary,
} from '@/lib/db';
import { ExamAttemptRecord, QuestionMistake } from '@/types/exam';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Download,
  Upload,
  Trash2,
  Calendar,
  CheckCircle2,
  XCircle,
  Award,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { MISTAKE_CATEGORIES } from '@/data/hacks-and-tips';

interface MistakeAnalyticsDashboardProps {
  onTakeExamAgain: (examId?: string) => void;
}

export function MistakeAnalyticsDashboard({ onTakeExamAgain }: MistakeAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<MistakeAnalyticsSummary | null>(null);
  const [attempts, setAttempts] = useState<ExamAttemptRecord[]>([]);
  const [selectedMistake, setSelectedMistake] = useState<QuestionMistake | null>(null);

  const refreshData = () => {
    const a = getMistakeAnalytics();
    const att = getExamAttempts();
    setAnalytics(a);
    setAttempts(att);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie diesen Prüfungsversuch wirklich aus der Datenbank löschen?')) {
      deleteAttempt(id);
      refreshData();
    }
  };

  const handleClearAll = () => {
    if (confirm('Warnung: Alle gespeicherten Prüfungsergebnisse und Fehler-Analysen werden unwiderruflich gelöscht. Fortfahren?')) {
      clearAllAttempts();
      refreshData();
    }
  };

  const handleExport = () => {
    const jsonStr = exportDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goethe-a1-exam-db-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importDataFromJson(content)) {
        alert('Datenbank erfolgreich importiert!');
        refreshData();
      } else {
        alert('Fehler beim Importieren: Ungültiges Dateiformat.');
      }
    };
    reader.readAsText(file);
  };

  if (!analytics) return null;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
              Diagnose-Datenbank
            </span>
            <span className="text-xs text-slate-500 font-medium">Persistente Fehler- und Leistungsanalyse</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Prüfungsanalytik & Schwachstellen-Diagnose
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Alle Ihre Prüfungsversuche werden detailliert gespeichert, um Fehlerursachen (Distraktoren, Uhrzeiten, Negationen) systematisch zu beseitigen.
          </p>
        </div>

        {/* Database Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>DB exportieren (JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>DB importieren</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 text-xs font-bold bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>DB leeren</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Prüfungen</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{analytics.totalAttempts}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {analytics.passedAttempts} bestanden / {analytics.totalAttempts - analytics.passedAttempts} nicht bestanden
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Bestehensquote</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{analytics.passRate}%</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Ziel: Mindestens 60%</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Durchschnitt</span>
            <BarChart3 className="w-4 h-4 text-[#007346]" />
          </div>
          <p className="text-3xl font-black text-slate-900">{analytics.averageScore} <span className="text-sm font-bold text-slate-400">/ 100</span></p>
          <span className="text-[11px] text-slate-500 mt-1 block">Skalierte Punkte (A1)</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Fehler erfasst</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-700">{analytics.totalMistakesCount}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">In Diagnosekategorien getaggt</span>
        </div>
      </div>

      {/* Module Strengths Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Fertigkeiten-Bilanz (Module Averages)</h3>
        <p className="text-xs text-slate-500 mb-4">
          Jedes der 4 Module steuert maximal 25 skalierte Punkte bei. Bestehensgrenze pro Modul: 15 Punkte.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Hören', score: analytics.moduleAverages.hoeren, max: 25 },
            { name: 'Lesen', score: analytics.moduleAverages.lesen, max: 25 },
            { name: 'Schreiben', score: analytics.moduleAverages.schreiben, max: 25 },
            { name: 'Sprechen', score: analytics.moduleAverages.sprechen, max: 25 },
          ].map((mod) => {
            const pct = Math.round((mod.score / mod.max) * 100);
            const isPassing = mod.score >= 15;

            return (
              <div key={mod.name} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-800">{mod.name}</span>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {mod.score} / {mod.max} Pkt.
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPassing ? 'bg-[#007346]' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className={isPassing ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
                    {isPassing ? '✓ Bestanden (>60%)' : '⚠ Nachholbedarf (<60%)'}
                  </span>
                  <span className="text-slate-500 font-bold">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Focus & Top Weakness Banner */}
      <div className="bg-amber-50/90 border-2 border-amber-300 rounded-xl p-5">
        <div className="flex items-center gap-2 font-black text-amber-950 text-base mb-2">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <span>Ihre personalisierte Handlungsempfehlung (KI-Diagnose):</span>
        </div>
        <div className="space-y-2 text-xs sm:text-sm text-slate-800">
          {analytics.recommendedFocus.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-white p-3 rounded-lg border border-amber-200/80">
              <span className="text-amber-600 font-bold mt-0.5">•</span>
              <p className="leading-relaxed font-medium">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mistake Category Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Fehlerursachen-Taxonomie (Fehlertypen im Detail)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Hier sehen Sie genau, in welchen sprachlichen und prüfungsspezifischen Fallen Sie Punkte verlieren.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {analytics.categoryStats.map((cat) => (
            <div key={cat.category} className="p-5 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{cat.nameEn}</span>
                  <span className="text-xs text-slate-500">({cat.nameDe})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-red-100 text-red-800 text-xs font-black px-2.5 py-0.5 rounded-full">
                    {cat.count} Fehler ({cat.percentageOfMistakes}%)
                  </span>
                </div>
              </div>

              {/* Hack Box */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 text-xs text-slate-800 mt-2">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-800 shrink-0">💡 Hack & Tipp:</span>
                  <p className="text-emerald-950 font-medium">{cat.hackTipEn}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Mistakes Log Table */}
      {analytics.recentMistakes.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Zuletzt gemachte Fehler (Detail-Rückschau)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Klicken Sie auf einen Fehler, um die vollständige Frage und Erklärung zu studieren.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Modul</th>
                  <th className="p-3">Aufgabe</th>
                  <th className="p-3">Ihre Antwort</th>
                  <th className="p-3">Korrekte Lösung</th>
                  <th className="p-3">Fehlerkategorie</th>
                  <th className="p-3">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.recentMistakes.map((m, idx) => {
                  const catInfo = MISTAKE_CATEGORIES[m.category];
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold uppercase text-emerald-700">{m.module}</td>
                      <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">{m.questionPrompt}</td>
                      <td className="p-3 text-red-600 font-medium">{m.userAnswer}</td>
                      <td className="p-3 text-emerald-700 font-bold">{m.correctAnswer}</td>
                      <td className="p-3">
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                          {catInfo?.nameEn || m.category}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedMistake(m)}
                          className="text-[#007346] hover:underline font-bold text-xs"
                        >
                          Ansehen
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Mistake Modal / Details */}
      {selectedMistake && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-300">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <span className="font-bold text-sm text-[#007346] uppercase">
                Fehler-Detail — {selectedMistake.module}
              </span>
              <button
                onClick={() => setSelectedMistake(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕ Schließen
              </button>
            </div>

            <h4 className="text-base font-bold text-slate-900 mb-2">{selectedMistake.questionPrompt}</h4>

            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between p-2 rounded bg-red-50 text-red-800">
                <span>Ihre Eingabe:</span>
                <strong className="font-mono">{selectedMistake.userAnswer}</strong>
              </div>
              <div className="flex justify-between p-2 rounded bg-emerald-50 text-emerald-800">
                <span>Richtig:</span>
                <strong className="font-mono">{selectedMistake.correctAnswer}</strong>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs mb-3 text-slate-700">
              <span className="font-bold block mb-1 text-slate-900">Erklärung:</span>
              <p>{selectedMistake.explanation}</p>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-950 font-medium">
              <span className="font-bold text-amber-700 block mb-0.5">💡 A1 Hack:</span>
              <p>{selectedMistake.hackTip}</p>
            </div>
          </div>
        </div>
      )}

      {/* Attempts History Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Historie aller Prüfungsdurchläufe</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ihre gespeicherten Durchgänge mit Gesamtpunkten und Noten.
            </p>
          </div>
          <button
            onClick={() => onTakeExamAgain()}
            className="bg-[#007346] hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg"
          >
            Neuen Test starten
          </button>
        </div>

        {attempts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Noch keine Prüfungsversuche in der Datenbank gespeichert. Schließen Sie Ihren ersten Test ab!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Datum & Uhrzeit</th>
                  <th className="p-3">Übungssatz</th>
                  <th className="p-3">Dauer</th>
                  <th className="p-3">Hören</th>
                  <th className="p-3">Lesen</th>
                  <th className="p-3">Schreiben</th>
                  <th className="p-3">Sprechen</th>
                  <th className="p-3">Gesamt</th>
                  <th className="p-3">Status / Note</th>
                  <th className="p-3">Löschen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-600 whitespace-nowrap">
                      {new Date(att.completedAt).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-slate-900">{att.examTitle}</td>
                    <td className="p-3 text-slate-600">{Math.round(att.durationSeconds / 60)} Min.</td>
                    <td className="p-3 font-mono">{att.scores.hoeren.scaled}</td>
                    <td className="p-3 font-mono">{att.scores.lesen.scaled}</td>
                    <td className="p-3 font-mono">{att.scores.schreiben.scaled}</td>
                    <td className="p-3 font-mono">{att.scores.sprechen.scaled}</td>
                    <td className="p-3 font-mono font-black text-sm text-slate-900">
                      {att.scores.totalScaled} / 100
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {att.passed ? 'Bestanden' : 'Nicht bestanden'} • {att.cefrGrade}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(att.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                        title="Diesen Versuch löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
