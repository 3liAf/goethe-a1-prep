'use client';

import React, { useState, useEffect } from 'react';
import { SprechenModuleData } from '@/types/exam';
import {
  speakGermanText,
  stopSpeaking,
  unlockAudioAndSpeech,
  isSpeechRecognitionSupported,
  startGermanSpeechRecognition,
  evaluateGermanPronunciation,
  PronunciationResult,
} from '@/lib/speech';
import {
  Volume2,
  Mic,
  CheckCircle2,
  Lightbulb,
  Smartphone,
  RotateCcw,
  AlertCircle,
  Award,
  Edit3,
  ExternalLink,
  ShieldAlert,
  Eye,
  EyeOff,
} from 'lucide-react';

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
  // TTS audio playback
  const [activeSpeechIndex, setActiveSpeechIndex] = useState<string | null>(null);

  // Manual checked status
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Hidden hints/answers state (Hidden by default for realistic examination simulation)
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [revealAllHints, setRevealAllHints] = useState<boolean>(false);

  // Microphone practice state
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [recordingText, setRecordingText] = useState<Record<string, string>>({});
  const [pronunciationMap, setPronunciationMap] = useState<
    Record<string, { spoken: string; result: PronunciationResult }>
  >({});
  const [micErrors, setMicErrors] = useState<Record<string, string>>({});
  const [stopRecordingCallback, setStopRecordingCallback] = useState<(() => void) | null>(null);
  const [isRecognitionAvailable, setIsRecognitionAvailable] = useState<boolean>(true);
  const [showPhoneTip, setShowPhoneTip] = useState<boolean>(false);

  // iPhone non-HTTPS detection (Apple strictly disables mic on unencrypted HTTP)
  const [isNonHttpsIPhone, setIsNonHttpsIPhone] = useState<boolean>(false);

  // Manual text edit / adjustment mode for difficult recognition
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingInputText, setEditingInputText] = useState<string>('');

  useEffect(() => {
    setIsRecognitionAvailable(isSpeechRecognitionSupported());

    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      const isIPhone = /iphone|ipad|ipod/.test(ua);
      const isNotHttps =
        window.location.protocol !== 'https:' &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1';

      if (isIPhone && isNotHttps) {
        setIsNonHttpsIPhone(true);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (stopRecordingCallback) {
        stopRecordingCallback();
      }
    };
  }, [stopRecordingCallback]);

  // Toggle single hint
  const toggleHint = (id: string) => {
    setRevealedHints((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle all hints globally
  const toggleAllHints = () => {
    const next = !revealAllHints;
    setRevealAllHints(next);
    if (!next) {
      setRevealedHints({});
    }
  };

  const isHintRevealed = (id: string) => {
    return revealAllHints || Boolean(revealedHints[id]);
  };

  // Audio Playback Handler (TTS)
  const handleSpeak = (id: string, text: string) => {
    unlockAudioAndSpeech();

    if (activeSpeechIndex === id) {
      stopSpeaking();
      setActiveSpeechIndex(null);
      return;
    }

    if (activeRecordingId) {
      handleStopMic();
    }

    setActiveSpeechIndex(id);
    speakGermanText(text, {
      onEnd: () => setActiveSpeechIndex(null),
      onError: () => setActiveSpeechIndex(null),
    });
  };

  // Microphone Recording Handler
  const handleStartMic = (id: string, targetPhrase: string) => {
    unlockAudioAndSpeech();
    stopSpeaking();
    setActiveSpeechIndex(null);

    // If already recording this one, stop and evaluate it
    if (activeRecordingId === id) {
      handleStopMic(id, targetPhrase);
      return;
    }

    // Stop any existing recording
    if (stopRecordingCallback) {
      stopRecordingCallback();
      setStopRecordingCallback(null);
    }

    setMicErrors((prev) => ({ ...prev, [id]: '' }));
    setRecordingText((prev) => ({ ...prev, [id]: 'Höre zu... Sprich jetzt deutlich auf Deutsch!' }));
    setActiveRecordingId(id);

    const cancel = startGermanSpeechRecognition({
      onStart: () => {
        setRecordingText((prev) => ({ ...prev, [id]: 'Mikrofon aktiv... Sprich deinen deutschen Satz!' }));
      },
      onInterim: (interim) => {
        setRecordingText((prev) => ({ ...prev, [id]: interim }));
      },
      onResult: (finalText) => {
        const clean = finalText.trim();
        setRecordingText((prev) => ({ ...prev, [id]: clean }));
        if (clean) {
          const evalResult = evaluateGermanPronunciation(clean, targetPhrase);
          setPronunciationMap((prev) => ({
            ...prev,
            [id]: { spoken: clean, result: evalResult },
          }));
          // Auto mark as practiced if score >= 60
          if (evalResult.score >= 60) {
            setCheckedItems((prev) => ({ ...prev, [id]: true }));
          }
        }
      },
      onError: (errMessage) => {
        setMicErrors((prev) => ({ ...prev, [id]: errMessage }));
        setActiveRecordingId(null);
      },
      onEnd: () => {
        setActiveRecordingId((curr) => (curr === id ? null : curr));
      },
    });

    setStopRecordingCallback(() => cancel);
  };

  // Stop microphone recording and immediately evaluate whatever was captured
  const handleStopMic = (cardId?: string, targetPhrase?: string) => {
    const id = cardId || activeRecordingId;

    if (stopRecordingCallback) {
      stopRecordingCallback();
      setStopRecordingCallback(null);
    }

    if (id && targetPhrase) {
      const raw = recordingText[id];
      if (
        raw &&
        !raw.startsWith('Höre zu') &&
        !raw.startsWith('Mikrofon') &&
        !raw.startsWith('Keine')
      ) {
        const evalResult = evaluateGermanPronunciation(raw, targetPhrase);
        setPronunciationMap((prev) => ({
          ...prev,
          [id]: { spoken: raw, result: evalResult },
        }));
        if (evalResult.score >= 60) {
          setCheckedItems((prev) => ({ ...prev, [id]: true }));
        }
      }
    }

    setActiveRecordingId(null);
  };

  const handleManualSubmit = (id: string, targetPhrase: string) => {
    if (!editingInputText.trim()) return;
    const clean = editingInputText.trim();
    const evalResult = evaluateGermanPronunciation(clean, targetPhrase);
    setPronunciationMap((prev) => ({
      ...prev,
      [id]: { spoken: clean, result: evalResult },
    }));
    setRecordingText((prev) => ({ ...prev, [id]: clean }));
    setEditingCardId(null);
    if (evalResult.score >= 60) {
      setCheckedItems((prev) => ({ ...prev, [id]: true }));
    }
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

  // Practice stats
  const totalPracticeItems =
    teil1.sampleSelfIntro.length +
    teil1.followUpQuestions.length +
    teil2Cards.length +
    teil3Cards.length;
  const recordedCount = Object.keys(pronunciationMap).length;
  const avgScore =
    recordedCount > 0
      ? Math.round(
          Object.values(pronunciationMap).reduce((acc, curr) => acc + curr.result.score, 0) /
            recordedCount
        )
      : null;

  // Render Pronunciation Evaluation Card
  const renderEvaluationBox = (id: string, targetPhrase: string) => {
    const data = pronunciationMap[id];
    const isRecording = activeRecordingId === id;
    const currentLiveText = recordingText[id];
    const errorMsg = micErrors[id];
    const isEditing = editingCardId === id;

    if (!data && !isRecording && !errorMsg && !isEditing) return null;

    return (
      <div className="mt-3 pt-3 border-t border-slate-200 text-xs sm:text-sm animate-fadeIn">
        {/* Live Recording Indicator */}
        {isRecording && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span className="font-bold text-red-900 text-xs sm:text-sm">
                {currentLiveText || 'Höre zu... Sprich jetzt deutlich auf Deutsch!'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleStopMic(id, targetPhrase)}
              className="self-end sm:self-center px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs active:scale-95 transition-transform"
            >
              Stopp & Auswerten
            </button>
          </div>
        )}

        {/* Error message with retry */}
        {errorMsg && !isRecording && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 mb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => handleStartMic(id, targetPhrase)}
              className="self-end sm:self-center flex items-center gap-1 font-bold text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-md hover:bg-amber-300"
            >
              <RotateCcw className="w-3 h-3" /> Nochmal
            </button>
          </div>
        )}

        {/* Manual text editing option */}
        {isEditing && (
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-3 mb-2 space-y-2">
            <span className="font-bold text-slate-800 text-xs block">
              Satz manuell eingeben oder anpassen:
            </span>
            <input
              type="text"
              value={editingInputText}
              onChange={(e) => setEditingInputText(e.target.value)}
              placeholder="z. B. Ich heiße Alex..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#007346] outline-hidden"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingCardId(null)}
                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => handleManualSubmit(id, targetPhrase)}
                className="text-xs font-bold text-white bg-[#007346] hover:bg-emerald-800 px-3 py-1 rounded-md"
              >
                Auswerten
              </button>
            </div>
          </div>
        )}

        {/* Evaluation Output */}
        {data && !isRecording && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#007346]" />
                <span className="font-bold text-slate-800">Aussprache-Ergebnis:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${data.result.colorClass}`}
                >
                  {data.result.score}% • {data.result.gradeBadge}
                </span>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-400 font-semibold block mb-0.5">Erkanntes Audio:</span>
              <p className="font-medium text-slate-800 italic">&ldquo;{data.spoken}&rdquo;</p>
            </div>

            {/* Word Analysis */}
            <div className="flex flex-wrap gap-1 text-[11px] pt-1">
              <span className="text-slate-500 font-semibold mr-1">Wort-Analyse:</span>
              {data.result.matchedWords.map((w, idx) => (
                <span
                  key={`match-${idx}`}
                  className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded"
                >
                  ✓ {w}
                </span>
              ))}
              {data.result.missingWords.map((w, idx) => (
                <span
                  key={`miss-${idx}`}
                  className="bg-rose-100 text-rose-800 line-through px-1.5 py-0.5 rounded"
                >
                  {w}
                </span>
              ))}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {data.result.feedbackDe}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px] text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setEditingCardId(id);
                  setEditingInputText(data.spoken);
                }}
                className="hover:text-emerald-700 flex items-center gap-1 font-semibold"
              >
                <Edit3 className="w-3 h-3" /> Text korrigieren
              </button>

              <button
                type="button"
                onClick={() => handleStartMic(id, targetPhrase)}
                className="hover:text-emerald-700 flex items-center gap-1 font-semibold text-emerald-800"
              >
                <RotateCcw className="w-3 h-3" /> Nochmal sprechen
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Non-HTTPS iPhone Warning Banner */}
      {isNonHttpsIPhone && (
        <div className="bg-amber-500/15 border-2 border-amber-500 rounded-xl p-4 text-xs text-amber-950 animate-fadeIn flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-900 mb-0.5">
                iPhone-Sicherheitshinweis für das Mikrofon
              </p>
              <p className="text-amber-800 leading-relaxed">
                Apple Safari blockiert das Mikrofon auf unverschlüsselten HTTP-Seiten. Bitte öffne die Goethe A1 Prüfung über die offizielle HTTPS-Adresse, damit die Spracherkennung sofort funktioniert:
              </p>
            </div>
          </div>
          <a
            href="https://searches-managers-kurt-muze.trycloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
            className="self-start sm:self-center bg-[#007346] hover:bg-emerald-800 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <span>Zu HTTPS wechseln</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Module Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-1">
              Sprechen (Oral Examination & Mobile Mic Practice)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Reguläre Prüfungszeit: <strong>circa 15 Minuten</strong> (in der Gruppe) • maximal 15 Punkte (25% der Gesamtnote).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPhoneTip(!showPhoneTip)}
            className="self-start sm:self-center flex items-center gap-1.5 text-xs text-[#007346] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-lg font-bold transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            <span>iPhone & Smartphone Tipps</span>
          </button>
        </div>

        {/* Practice Stats Bar & Global Answer Reveal Toggle */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Dein Training:</span>
              <span className="bg-[#007346] text-white font-bold px-2 py-0.5 rounded-full">
                {recordedCount} / {totalPracticeItems} geübt
              </span>
            </div>

            {avgScore !== null && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">Aussprache-Ø:</span>
                <strong className="text-emerald-700 text-sm">{avgScore}%</strong>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-slate-500">
              <Mic className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isRecognitionAvailable ? 'Mikrofon aktiv' : 'Audio-Modus'}</span>
            </div>
          </div>

          {/* Global Toggle for Answer Hints */}
          <button
            type="button"
            onClick={toggleAllHints}
            className={`min-h-[36px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 ${
              revealAllHints
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
            }`}
          >
            {revealAllHints ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                <span>Alle Musterantworten verbergen</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-[#007346]" />
                <span>Alle Musterantworten einblenden</span>
              </>
            )}
          </button>
        </div>

        {/* Real Exam Mode Callout Notice */}
        <div className="flex items-center gap-2 bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-900">
          <Lightbulb className="w-4 h-4 text-[#007346] shrink-0" />
          <span>
            <strong>🔒 Echtes Prüfungstraining:</strong> Die Musterantworten sind standardmäßig ausgeblendet. Versuchen Sie zuerst frei zu sprechen! Bei Bedarf tippen Sie auf <em>&ldquo;Musterantwort zeigen&rdquo;</em>.
          </span>
        </div>

        {/* Phone Tips Callout */}
        {showPhoneTip && (
          <div className="mt-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 animate-fadeIn">
            <div className="flex items-center gap-2 font-bold mb-1">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>📱 So übst du Sprechen optimal auf dem iPhone & Smartphone:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-blue-800 leading-relaxed">
              <li>
                <strong>1. Freies Sprechen:</strong> Versuche den Satz zuerst ohne Hilfe zu formulieren und tippe auf das Mikrofon (<Mic className="w-3 h-3 inline" />).
              </li>
              <li>
                <strong>2. Musterlösung ansehen:</strong> Falls du nicht weiterweißt, tippe auf <em>&ldquo;Musterantwort zeigen&rdquo;</em>, um den Satz und Tipps aufzudecken.
              </li>
              <li>
                <strong>3. Audio-Vorbild:</strong> Tippe auf das Lautsprecher-Symbol (<Volume2 className="w-3 h-3 inline" />), um die korrekte Aussprache anzuhören.
              </li>
              <li>
                <strong>4. Sofortige KI-Analyse:</strong> Sobald du auf <em>&ldquo;Stopp & Auswerten&rdquo;</em> tippst, erscheint deine Auswertung mit Trefferquote und Feedback!
              </li>
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-xs mt-3">
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-6">
        <div className="mb-4">
          <span className="bg-[#007346] text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase">
            Teil 1 — Sich vorstellen
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Persönliche Vorstellung anhand von 7 Stichworten (5 Punkte)
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Formulieren Sie Ihren Satz zum jeweiligen Stichwort. Bei Bedarf können Sie die Musterantwort aufdecken.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
          {teil1.sampleSelfIntro.map((item, idx) => {
            const cardId = `intro-${idx}`;
            const isPlaying = activeSpeechIndex === cardId;
            const isRecording = activeRecordingId === cardId;
            const isChecked = checkedItems[cardId] || false;
            const isRevealed = isHintRevealed(cardId);

            return (
              <div
                key={idx}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isChecked
                    ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300/40'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="bg-[#007346] text-white text-[11px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                        {item.keyword}
                      </span>
                      <span className="text-xs text-slate-500 italic">{item.englishMeaning}</span>
                    </div>

                    {/* German Answer Phrase: Hidden by default for real exam testing */}
                    {isRevealed ? (
                      <p className="text-sm font-bold text-slate-900 leading-snug animate-fadeIn">
                        {item.germanPhrase}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Musterantwort verborgen (Sprechen Sie frei!)
                      </p>
                    )}

                    {/* Toggle Button to open/close answer */}
                    <button
                      type="button"
                      onClick={() => toggleHint(cardId)}
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-2.5 py-1 rounded-md transition-colors shadow-2xs active:scale-95"
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="w-3 h-3 text-slate-500" />
                          <span>Verbergen</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 text-[#007346]" />
                          <span>Musterantwort zeigen</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action Buttons - Min 44px tap targets for mobile */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Listen Audio */}
                    <button
                      type="button"
                      onClick={() => handleSpeak(cardId, item.germanPhrase)}
                      title="Deutsche Aussprache anhören"
                      className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all shadow-2xs active:scale-95 ${
                        isPlaying
                          ? 'bg-red-500 text-white ring-2 ring-red-300 animate-pulse'
                          : 'bg-white border border-slate-200 text-[#007346] hover:bg-emerald-50'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* Microphone Practice */}
                    <button
                      type="button"
                      onClick={() => handleStartMic(cardId, item.germanPhrase)}
                      title="Mit dem Smartphone-Mikrofon üben"
                      className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all shadow-2xs active:scale-95 ${
                        isRecording
                          ? 'bg-red-600 text-white ring-2 ring-red-400 animate-bounce'
                          : 'bg-emerald-50 border border-emerald-200 text-[#007346] hover:bg-emerald-100'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    {/* Checkmark */}
                    <button
                      type="button"
                      onClick={() => toggleCheck(cardId)}
                      title="Als geübt markieren"
                      className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all shadow-2xs active:scale-95 ${
                        isChecked
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Pronunciation Feedback Box */}
                {renderEvaluationBox(cardId, item.germanPhrase)}
              </div>
            );
          })}
        </div>

        {/* Follow-up questions (Spelling & Numbers) */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4">
          <div className="font-bold text-amber-950 text-sm mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>Zusatzfragen der Prüfer (Buchstabieren & Zahlen):</span>
          </div>
          <div className="space-y-3">
            {teil1.followUpQuestions.map((q, i) => {
              const cardId = `q-${i}`;
              const isPlaying = activeSpeechIndex === cardId;
              const isRecording = activeRecordingId === cardId;
              const isRevealed = isHintRevealed(cardId);

              return (
                <div key={i} className="bg-white p-3.5 rounded-xl border border-amber-200/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      Frage {i + 1}: &ldquo;{q.question}&rdquo;
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSpeak(cardId, q.question + ' ... ' + q.sampleAnswer)}
                        className="min-h-[38px] flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isPlaying ? 'Spielt...' : 'Audio'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartMic(cardId, q.sampleAnswer)}
                        className={`min-h-[38px] flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                          isRecording
                            ? 'bg-red-600 text-white animate-pulse'
                            : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>{isRecording ? 'Stopp' : 'Antwort sprechen'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Toggle Button for Question Sample Answer */}
                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={() => toggleHint(cardId)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-100/70 hover:bg-amber-200/70 border border-amber-300 px-2.5 py-1 rounded-md transition-colors active:scale-95"
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="w-3 h-3 text-amber-700" />
                          <span>Musterantwort verbergen</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 text-amber-700" />
                          <span>Musterantwort & Tipp anzeigen</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isRevealed && (
                    <div className="mt-2 space-y-1.5 animate-fadeIn">
                      <p className="text-xs text-slate-800 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        Musterantwort: <strong>{q.sampleAnswer}</strong>
                      </p>
                      <p className="text-[11px] text-amber-800 italic">💡 Hack: {q.tip}</p>
                    </div>
                  )}

                  {renderEvaluationBox(cardId, q.sampleAnswer)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Teil 2: Um Informationen bitten & geben */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-6">
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
            const isRecording = activeRecordingId === card.id;
            const isRevealed = isHintRevealed(card.id);

            return (
              <div
                key={card.id}
                className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-600 uppercase">
                      Thema: <strong className="text-emerald-700 text-sm ml-1">{card.topic}</strong>
                    </span>
                    <span className="bg-[#007346] text-white text-xs font-black px-2.5 py-1 rounded-md shadow-2xs">
                      Wort: {card.keyword}
                    </span>
                  </div>

                  {/* Toggle button to open/close sample question & answer */}
                  <button
                    type="button"
                    onClick={() => toggleHint(card.id)}
                    className="w-full mb-3 flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-lg border transition-all active:scale-98 shadow-2xs bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  >
                    {isRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                        <span>Musterfrage & Antwort schließen</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-[#007346]" />
                        <span>Musterfrage & Antwort anzeigen</span>
                      </>
                    )}
                  </button>

                  {/* Sample Answer Box (Revealed upon click) */}
                  {isRevealed && (
                    <div className="space-y-2 mb-3 bg-white p-3.5 rounded-lg border border-slate-200 animate-fadeIn">
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Musterfrage:</span>
                        <p className="text-sm font-bold text-slate-900">&ldquo;{card.sampleQuestion}&rdquo;</p>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Musterantwort:</span>
                        <p className="text-xs text-slate-700">&ldquo;{card.sampleAnswer}&rdquo;</p>
                      </div>
                      <p className="text-[11px] text-amber-800 italic pt-1 border-t border-slate-100">
                        💡 {card.hackTip}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 mb-1 pt-2 border-t border-slate-200/60">
                    <span className="text-[11px] font-medium text-slate-500">
                      {isRevealed ? 'Musterlösung offen' : 'Prüfungsmodus (Antwort verborgen)'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeak(card.id, card.sampleQuestion + ' ... ' + card.sampleAnswer)
                        }
                        className="min-h-[38px] flex items-center gap-1 font-bold text-[#007346] hover:text-emerald-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg active:scale-95 shadow-2xs"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isPlaying ? 'Spielt...' : 'Audio'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartMic(card.id, card.sampleQuestion)}
                        className={`min-h-[38px] flex items-center gap-1 font-bold px-3 py-1.5 rounded-lg active:scale-95 shadow-2xs ${
                          isRecording
                            ? 'bg-red-600 text-white animate-pulse'
                            : 'bg-emerald-50 border border-emerald-200 text-[#007346] hover:bg-emerald-100'
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>{isRecording ? 'Stopp' : 'Sprechen'}</span>
                      </button>
                    </div>
                  </div>

                  {renderEvaluationBox(card.id, card.sampleQuestion)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Teil 3: Bitten formulieren und reagieren */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-6">
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
            const isRecording = activeRecordingId === card.id;
            const isRevealed = isHintRevealed(card.id);

            return (
              <div
                key={card.id}
                className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-amber-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-2xs">
                      Gegenstand: {card.keyword}
                    </span>
                    <span className="text-xs text-slate-500 font-medium italic">
                      Höfliche Bitte formulieren
                    </span>
                  </div>

                  {/* Toggle button to open/close sample request & reaction */}
                  <button
                    type="button"
                    onClick={() => toggleHint(card.id)}
                    className="w-full mb-3 flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-lg border transition-all active:scale-98 shadow-2xs bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  >
                    {isRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                        <span>Musterbitte & Reaktion schließen</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-[#007346]" />
                        <span>Musterbitte & Reaktion anzeigen</span>
                      </>
                    )}
                  </button>

                  {/* Sample Answer Box (Revealed upon click) */}
                  {isRevealed && (
                    <div className="space-y-2 mb-3 bg-white p-3.5 rounded-lg border border-slate-200 animate-fadeIn">
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Höfliche Bitte:</span>
                        <p className="text-sm font-bold text-slate-900">&ldquo;{card.sampleQuestion}&rdquo;</p>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Natürliche Reaktion:</span>
                        <p className="text-xs text-slate-700">&ldquo;{card.sampleAnswer}&rdquo;</p>
                      </div>
                      <p className="text-[11px] text-amber-800 italic pt-1 border-t border-slate-100">
                        💡 {card.hackTip}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 mb-1 pt-2 border-t border-slate-200/60">
                    <span className="text-[11px] font-medium text-slate-500">
                      {isRevealed ? 'Musterlösung offen' : 'Prüfungsmodus (Antwort verborgen)'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeak(card.id, card.sampleQuestion + ' ... ' + card.sampleAnswer)
                        }
                        className="min-h-[38px] flex items-center gap-1 font-bold text-[#007346] hover:text-emerald-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg active:scale-95 shadow-2xs"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isPlaying ? 'Spielt...' : 'Audio'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartMic(card.id, card.sampleQuestion)}
                        className={`min-h-[38px] flex items-center gap-1 font-bold px-3 py-1.5 rounded-lg active:scale-95 shadow-2xs ${
                          isRecording
                            ? 'bg-red-600 text-white animate-pulse'
                            : 'bg-emerald-50 border border-emerald-200 text-[#007346] hover:bg-emerald-100'
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>{isRecording ? 'Stopp' : 'Sprechen'}</span>
                      </button>
                    </div>
                  </div>

                  {renderEvaluationBox(card.id, card.sampleQuestion)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Self-Rating Score Selector */}
      <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-xl p-4 sm:p-5">
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
          className="w-full accent-[#007346] cursor-pointer mt-2 h-3"
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
