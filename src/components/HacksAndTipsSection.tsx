'use client';

import React, { useState } from 'react';
import { A1_EXAM_HACKS, MISTAKE_CATEGORIES } from '@/data/hacks-and-tips';
import { Lightbulb, Search, BookOpen, Clock, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export function HacksAndTipsSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'hoeren' | 'lesen' | 'schreiben' | 'sprechen' | 'vocab'>('all');

  const filteredHacks = A1_EXAM_HACKS.filter((cat) => {
    if (activeTab === 'hoeren' && !cat.category.toLowerCase().includes('hören')) return false;
    if (activeTab === 'lesen' && !cat.category.toLowerCase().includes('lesen')) return false;
    if (activeTab === 'schreiben' && !cat.category.toLowerCase().includes('schreiben')) return false;
    if (activeTab === 'sprechen' && !cat.category.toLowerCase().includes('sprechen')) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
            Offizielle Strategien & Hacks
          </span>
          <span className="text-xs text-slate-500 font-medium">Bestehen mit mindestens 60% – 90%+ anvisiert</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          Goethe-Zertifikat A1: Hacks, Fallen & Erfolgsformeln
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Die häufigsten Prüfungsfallen des Goethe-Instituts und wie Sie sie mit einfachen Systemen umgehen.
        </p>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          {[
            { id: 'all', label: 'Alle Strategien' },
            { id: 'hoeren', label: '🎧 Hören Hacks' },
            { id: 'lesen', label: '📖 Lesen Hacks' },
            { id: 'schreiben', label: '✍️ Schreiben 10/10 Vorlagen' },
            { id: 'sprechen', label: '🗣️ Sprechen Skripte' },
            { id: 'vocab', label: '⚠️ Fallen & Signalwörter' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Cheat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cheat 1: Time Formula */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-[#007346] mb-2">
            <Clock className="w-4 h-4" />
            <span>Die &ldquo;Halb X&rdquo; Formel</span>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Die häufigste Goethe-Falle bei Uhrzeiten:
          </p>
          <div className="bg-slate-50 p-2.5 rounded-md font-mono text-xs font-bold text-slate-900 space-y-1 mb-2">
            <div className="flex justify-between">
              <span>halb 8:</span>
              <span className="text-[#007346]">07:30 Uhr</span>
            </div>
            <div className="flex justify-between">
              <span>halb 3:</span>
              <span className="text-[#007346]">02:30 / 14:30 Uhr</span>
            </div>
            <div className="flex justify-between">
              <span>Viertel vor 4:</span>
              <span className="text-[#007346]">03:45 / 15:45 Uhr</span>
            </div>
          </div>
          <p className="text-[11px] text-amber-800 font-semibold">
            Merke: &ldquo;halb X&rdquo; = immer X minus 30 Minuten!
          </p>
        </div>

        {/* Cheat 2: Number Reversal */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-indigo-700 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Deutsche Zahlendreher</span>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Deutsche Zahlen werden von hinten nach vorne gesprochen:
          </p>
          <div className="bg-slate-50 p-2.5 rounded-md font-mono text-xs font-bold text-slate-900 space-y-1 mb-2">
            <div className="flex justify-between">
              <span>vierundfünfzig:</span>
              <span className="text-indigo-700">54 (nicht 45!)</span>
            </div>
            <div className="flex justify-between">
              <span>fünfundvierzig:</span>
              <span className="text-indigo-700">45 (nicht 54!)</span>
            </div>
          </div>
          <p className="text-[11px] text-indigo-800 font-semibold">
            Tipp: Schreib beim Hören zuerst die Einerstelle auf!
          </p>
        </div>

        {/* Cheat 3: Negation Triggers */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-red-700 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Signalwörter für &ldquo;Falsch&rdquo;</span>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Diese Signalwörter kehren den Sinn einer Aussage um:
          </p>
          <div className="bg-slate-50 p-2.5 rounded-md font-mono text-xs font-bold text-slate-900 space-y-1 mb-2">
            <div>• <span className="text-red-700">leider ausverkauft</span> (sold out)</div>
            <div>• <span className="text-red-700">außer Betrieb</span> (out of order)</div>
            <div>• <span className="text-red-700">Eintritt frei</span> (kostenlos!)</div>
          </div>
          <p className="text-[11px] text-red-800 font-semibold">
            Achtung: &ldquo;Eintritt frei&rdquo; bedeutet 0 Euro, nicht bezahlbar!
          </p>
        </div>
      </div>

      {/* Section Content */}
      <div className="space-y-6">
        {filteredHacks.map((section, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <span className="bg-[#007346] text-white p-1 rounded-md">
                <BookOpen className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">{section.category}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.tips.map((tip, tIdx) => (
                <div
                  key={tIdx}
                  className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-sm text-slate-900">{tip.title}</h4>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          tip.priority === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tip.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{tip.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Writing 10/10 Email Blueprint */}
      {(activeTab === 'all' || activeTab === 'schreiben') && (
        <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-emerald-800" />
            <h3 className="text-lg font-black text-emerald-950">
              Der 10/10 Punkte E-Mail Baukasten (Schreiben Teil 2)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-emerald-900 mb-4">
            Mit diesem standardisierten Aufbau sichern Sie sich die vollen 10 Punkte in jeder Prüfung:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-emerald-200">
              <span className="bg-[#007346] text-white text-xs font-bold px-2 py-0.5 rounded uppercase">
                Formell (Touristeninfo, Kursleiter, Hotel)
              </span>
              <pre className="mt-3 font-serif text-xs text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 rounded">
                Sehr geehrte Damen und Herren, [oder Sehr geehrte Frau X / Sehr geehrter Herr Y,]
                {'\n\n'}ich schreibe Ihnen, weil... [Leitpunkt 1]{'\n'}
                Können Sie mir bitte... schicken? [Leitpunkt 2]{'\n'}
                Ich möchte gern wissen, ob... [Leitpunkt 3]{'\n\n'}
                Vielen Dank im Voraus.{'\n\n'}
                Mit freundlichen Grüßen{'\n'}[Ihr Vor- und Nachname]
              </pre>
            </div>

            <div className="bg-white p-4 rounded-lg border border-emerald-200">
              <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded uppercase">
                Informell (Freunde, Bekannte, Kollegen)
              </span>
              <pre className="mt-3 font-serif text-xs text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 rounded">
                Liebe Anna, [oder Lieber Markus,]{'\n\n'}
                vielen Dank für deine Einladung! [Leitpunkt 1]{'\n'}
                Leider kann ich nicht kommen, weil ich arbeiten muss. [Leitpunkt 2]{'\n'}
                Hast du nächste Woche Zeit für einen Kaffee? [Leitpunkt 3]{'\n\n'}
                Viele Grüße [oder Herzliche Grüße]{'\n'}[Dein Vorname]
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
