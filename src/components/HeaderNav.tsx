'use client';

import React from 'react';
import { ModuleType } from '@/types/exam';
import { Headphones, BookOpen, PenTool, Mic, BarChart3, Lightbulb, Clock, CheckCircle2, RotateCcw } from 'lucide-react';

interface HeaderNavProps {
  currentModule: ModuleType | 'analytics' | 'hacks';
  onSelectModule: (module: ModuleType | 'analytics' | 'hacks') => void;
  selectedExamId: string;
  onSelectExam: (examId: string) => void;
  examOptions: { id: string; title: string }[];
  timeRemainingSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onFinishExam: () => void;
  answeredCount: number;
  totalQuestions: number;
}

export function HeaderNav({
  currentModule,
  onSelectModule,
  selectedExamId,
  onSelectExam,
  examOptions,
  timeRemainingSeconds,
  isTimerRunning,
  onToggleTimer,
  onResetTimer,
  onFinishExam,
  answeredCount,
  totalQuestions,
}: HeaderNavProps) {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemainingSeconds < 300; // < 5 minutes

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner: Goethe Header */}
      <div className="bg-[#007346] text-white px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-white text-[#007346] font-black text-sm tracking-widest px-2.5 py-1 rounded-sm shadow-xs uppercase">
              GOETHE A1
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold leading-tight">
                Start Deutsch 1 — Prüfungssimulator & Diagnose-DB
              </h1>
              <p className="text-xs text-emerald-100 hidden sm:block">
                Offizielles Prüfungsformat: Hören (20m) • Lesen (25m) • Schreiben (20m) • Sprechen (15m)
              </p>
            </div>
          </div>

          {/* Exam Selector Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="exam-select" className="text-xs font-medium text-emerald-100 hidden md:inline">
              Übungssatz:
            </label>
            <select
              id="exam-select"
              value={selectedExamId}
              onChange={(e) => onSelectExam(e.target.value)}
              className="bg-emerald-900/60 text-white text-xs sm:text-sm font-semibold rounded-md px-3 py-1.5 border border-emerald-400/40 focus:outline-hidden focus:ring-2 focus:ring-white"
            >
              {examOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="text-slate-900 bg-white">
                  {opt.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Primary Navigation & Controls */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Module Switcher Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" aria-label="Prüfungsmodule">
          <button
            onClick={() => onSelectModule('hoeren')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
              currentModule === 'hoeren'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Hören</span>
            <span className="text-[10px] opacity-80 hidden md:inline">(20m)</span>
          </button>

          <button
            onClick={() => onSelectModule('lesen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
              currentModule === 'lesen'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Lesen</span>
            <span className="text-[10px] opacity-80 hidden md:inline">(25m)</span>
          </button>

          <button
            onClick={() => onSelectModule('schreiben')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
              currentModule === 'schreiben'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Schreiben</span>
            <span className="text-[10px] opacity-80 hidden md:inline">(20m)</span>
          </button>

          <button
            onClick={() => onSelectModule('sprechen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
              currentModule === 'sprechen'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Sprechen</span>
            <span className="text-[10px] opacity-80 hidden md:inline">(15m)</span>
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

          <button
            onClick={() => onSelectModule('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
              currentModule === 'analytics'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Fehler-Analyse DB</span>
          </button>

          <button
            onClick={() => onSelectModule('hacks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
              currentModule === 'hacks'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>A1 Hacks & Tipps</span>
          </button>
        </nav>

        {/* Exam Timer & Finish Button */}
        <div className="flex items-center gap-2.5">
          {/* Progress Pill */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-md">
            <span>Aufgaben:</span>
            <span className="font-bold text-slate-900">
              {answeredCount}/{totalQuestions}
            </span>
          </div>

          {/* Timer Display */}
          <div
            className={`flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold px-2.5 py-1.5 rounded-md border ${
              isLowTime
                ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                : 'bg-slate-50 text-slate-800 border-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeRemainingSeconds)}</span>
            <button
              onClick={onToggleTimer}
              title={isTimerRunning ? 'Pause' : 'Start'}
              className="ml-1 text-[10px] uppercase font-bold text-slate-500 hover:text-slate-800 underline"
            >
              {isTimerRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={onResetTimer}
              title="Reset Timer"
              className="text-slate-400 hover:text-slate-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Finish & Evaluate Exam Button */}
          <button
            onClick={onFinishExam}
            className="flex items-center gap-1.5 bg-[#007346] hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-lg shadow-xs transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Prüfung abgeben</span>
          </button>
        </div>
      </div>
    </header>
  );
}
