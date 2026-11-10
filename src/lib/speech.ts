// German Web Speech API Audio Helper & Web Audio Sound Effects
// Optimized for Mobile Safari (iOS), Android Chrome/Edge, and Desktop browsers

let currentUtterance: SpeechSynthesisUtterance | null = null;
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;
let sharedAudioCtx: AudioContext | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let audioUnlocked = false;

// AudioContext singleton to avoid hitting browser limits (max 6 AudioContexts on mobile)
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedAudioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        sharedAudioCtx = new AudioContextClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (err) {
    console.debug('Failed to initialize AudioContext:', err);
    return null;
  }
}

// Mobile iOS Safari warm-up / gesture unlock routine
export function unlockAudioAndSpeech(): void {
  if (typeof window === 'undefined' || audioUnlocked) return;
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      cachedVoices = window.speechSynthesis.getVoices();
    }
    audioUnlocked = true;
  } catch (e) {
    console.debug('Audio unlock error:', e);
  }
}

// Auto-register touch/click unlock on first mobile user gesture
if (typeof window !== 'undefined') {
  const onFirstInteraction = () => {
    unlockAudioAndSpeech();
    window.removeEventListener('touchstart', onFirstInteraction);
    window.removeEventListener('touchend', onFirstInteraction);
    window.removeEventListener('click', onFirstInteraction);
  };
  window.addEventListener('touchstart', onFirstInteraction, { passive: true, once: true });
  window.addEventListener('click', onFirstInteraction, { passive: true, once: true });

  if ('speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }
}

// Play standard German examination gong / beep chime using Web Audio API
export function playExamChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Ding-dong chord (D5 to A5)
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {
    console.debug('Exam chime error:', e);
  }
}

// Keep-alive timer for iOS Safari to prevent speech synthesis pausing after 15s
function startKeepAlive(): void {
  stopKeepAlive();
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  keepAliveTimer = setInterval(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    } else {
      stopKeepAlive();
    }
  }, 10000);
}

function stopKeepAlive(): void {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

let currentHtmlAudio: HTMLAudioElement | null = null;

export interface AudioPlayOptions {
  onStart?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

export function stopAllAudio(): void {
  if (currentHtmlAudio) {
    try {
      currentHtmlAudio.pause();
      currentHtmlAudio.currentTime = 0;
      currentHtmlAudio.src = '';
    } catch {
      // ignore
    }
    currentHtmlAudio = null;
  }
  stopSpeaking();
}

/**
 * Play a studio-quality native German MP3 audio recording using HTML5 Audio.
 * 100% works on iOS Safari (even when the hardware silent switch is on),
 * Android Chrome, Edge and Desktop.
 */
export function playAudioUrl(url: string, options?: AudioPlayOptions): () => void {
  stopAllAudio();

  if (typeof window === 'undefined') {
    return () => {};
  }

  try {
    const audio = new Audio();
    currentHtmlAudio = audio;

    audio.preload = 'auto';
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');

    audio.onplay = () => {
      if (options?.onStart) options.onStart();
    };

    audio.ontimeupdate = () => {
      if (options?.onProgress && audio.duration && !isNaN(audio.duration)) {
        options.onProgress(audio.currentTime, audio.duration);
      }
    };

    audio.onended = () => {
      currentHtmlAudio = null;
      if (options?.onEnd) options.onEnd();
    };

    audio.onerror = (e) => {
      console.warn('HTML5 Audio playback error for', url, e);
      currentHtmlAudio = null;
      if (options?.onError) options.onError(e);
    };

    audio.src = url;

    // Synchronous execution in user gesture stack ensures iOS authorization
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Audio.play() blocked or failed:', err);
        currentHtmlAudio = null;
        if (options?.onError) options.onError(err);
      });
    }

    return () => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // ignore
      }
      currentHtmlAudio = null;
    };
  } catch (err) {
    if (options?.onError) options.onError(err);
    return () => {};
  }
}

export function stopSpeaking(): void {
  stopKeepAlive();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}

export function getBestGermanVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }

  const deVoices = cachedVoices.filter((v) => v.lang.toLowerCase().startsWith('de'));
  if (deVoices.length === 0) return null;

  // 1. Prioritize natural German voices
  const premium = deVoices.find((v) => {
    const n = v.name.toLowerCase();
    return (
      n.includes('google') ||
      n.includes('natural') ||
      n.includes('deutsch') ||
      n.includes('anna') ||
      n.includes('markus') ||
      n.includes('katja') ||
      n.includes('siri')
    );
  });
  if (premium) return premium;

  // 2. Prioritize de-DE
  const deDE = deVoices.find((v) => v.lang.toLowerCase() === 'de-de' || v.lang.toLowerCase() === 'de_de');
  if (deDE) return deDE;

  return deVoices[0];
}

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
  rate?: number; // default 0.88 for clear A1 learner comprehension
  pitch?: number; // default 1.0
  playChime?: boolean; // default true
}

/**
 * Mobile-bulletproof German speech synthesis.
 * CRITICAL FOR iOS SAFARI & ANDROID:
 * Must execute `speechSynthesis.speak()` synchronously within the user gesture event loop.
 * No setTimeout before speak!
 */
export function speakGermanText(text: string, options?: SpeakOptions): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (options?.onError) options.onError(new Error('Speech synthesis not supported in this browser'));
    return;
  }

  // Cancel prior utterance
  stopSpeaking();

  // Resume Web Audio & SpeechSynthesis immediately within user gesture
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  window.speechSynthesis.resume();

  // Play chime synchronously if requested
  if (options?.playChime !== false) {
    playExamChime();
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;

    utterance.lang = 'de-DE';
    utterance.rate = options?.rate ?? 0.88; // Slower cadence for A1 examination realism
    utterance.pitch = options?.pitch ?? 1.0;

    const germanVoice = getBestGermanVoice();
    if (germanVoice) {
      utterance.voice = germanVoice;
    }

    utterance.onstart = () => {
      startKeepAlive();
      if (options?.onStart) options.onStart();
    };

    utterance.onend = () => {
      stopKeepAlive();
      currentUtterance = null;
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      stopKeepAlive();
      currentUtterance = null;
      // 'canceled' errors happen when user presses stop or switches questions - don't crash
      if (e.error !== 'canceled' && options?.onError) {
        options.onError(e);
      }
    };

    // Synchronous speak call ensures iOS Safari & Chrome Mobile keep gesture privilege
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    stopKeepAlive();
    if (options?.onError) options.onError(err);
  }
}

// ==========================================
// German Speech Recognition (Microphone Practice for Phones & Desktop)
// ==========================================

export interface SpeechRecognitionOptions {
  onStart?: () => void;
  onInterim?: (interimText: string) => void;
  onResult?: (finalText: string) => void;
  onError?: (errorMessage: string) => void;
  onEnd?: () => void;
}

// Check if browser supports Web Speech Recognition
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}

// Start German speech recognition from phone or desktop microphone
export function startGermanSpeechRecognition(options: SpeechRecognitionOptions): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    if (options.onError) {
      options.onError(
        'Spracherkennung wird von diesem Browser nicht unterstützt. Verwende Safari auf dem iPhone oder Chrome auf Android/PC.'
      );
    }
    return () => {};
  }

  try {
    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'de-DE';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    let hasEnded = false;
    let latestCapturedText = '';
    let hasDeliveredResult = false;

    recognition.onstart = () => {
      hasDeliveredResult = false;
      latestCapturedText = '';
      if (options.onStart) options.onStart();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let fullTranscript = '';
      let interim = '';

      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i];
        const transcript = item[0]?.transcript || '';
        if (transcript) {
          fullTranscript += (fullTranscript ? ' ' : '') + transcript;
        }
        if (!item.isFinal) {
          interim += transcript;
        }
      }

      fullTranscript = fullTranscript.trim();
      if (fullTranscript) {
        latestCapturedText = fullTranscript;
        // Broadcast interim live to UI immediately
        if (options.onInterim) {
          options.onInterim(fullTranscript);
        }
      }
    };

    const flushAndFinish = () => {
      if (hasEnded) return;
      hasEnded = true;

      const cleaned = latestCapturedText.trim();
      if (cleaned) {
        if (!hasDeliveredResult && options.onResult) {
          hasDeliveredResult = true;
          options.onResult(cleaned);
        }
      } else {
        if (options.onError) {
          options.onError(
            'Keine deutliche Sprache erfasst. Halte das Smartphone näher an den Mund und sprich den Satz auf Deutsch.'
          );
        }
      }

      if (options.onEnd) {
        options.onEnd();
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      const err = event.error;
      let msg = 'Fehler bei der Spracherkennung.';
      if (err === 'not-allowed') {
        msg =
          'Mikrofon-Zugriff verweigert. Bitte erlaube den Mikrofon-Zugriff in den iOS Einstellungen -> Safari -> Mikrofon.';
      } else if (err === 'no-speech') {
        msg = 'Keine Sprache erkannt. Bitte sprich lauter und deutlicher ins Mikrofon.';
      } else if (err === 'network') {
        msg = 'Netzwerkfehler bei der Spracherkennung. Bitte Internetverbindung prüfen.';
      } else if (err === 'audio-capture') {
        msg = 'Kein Mikrofon gefunden. Bitte schließe ein Mikrofon an.';
      }

      // If we already captured some text before the error event, keep and deliver it!
      if (latestCapturedText.trim() && !hasDeliveredResult && options.onResult) {
        hasDeliveredResult = true;
        options.onResult(latestCapturedText.trim());
      } else if (options.onError) {
        options.onError(msg);
      }
    };

    recognition.onend = () => {
      flushAndFinish();
    };

    recognition.start();

    // Return abort/stop callback
    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore already stopped
      }
      flushAndFinish();
    };
  } catch (err) {
    if (options.onError) {
      options.onError('Konnte Mikrofon nicht initialisieren.');
    }
    return () => {};
  }
}

// ==========================================
// German Pronunciation & Accuracy Evaluator
// ==========================================

export interface PronunciationResult {
  score: number; // 0 - 100
  gradeBadge: 'Ausgezeichnet' | 'Sehr gut' | 'Befriedigend' | 'Noch üben';
  colorClass: string;
  matchedWords: string[];
  missingWords: string[];
  feedbackDe: string;
  feedbackEn: string;
}

// Levenshtein distance for string similarity
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d: number[][] = [];

  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return d[m][n];
}

function cleanGermanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»„“]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compare what the student said into the phone microphone against the Goethe A1 target sentence.
 */
export function evaluateGermanPronunciation(spoken: string, target: string): PronunciationResult {
  const cleanSpoken = cleanGermanText(spoken);
  const cleanTarget = cleanGermanText(target);

  if (!cleanSpoken) {
    return {
      score: 0,
      gradeBadge: 'Noch üben',
      colorClass: 'bg-red-100 text-red-800 border-red-200',
      matchedWords: [],
      missingWords: cleanTarget.split(' '),
      feedbackDe: 'Keine deutsche Sprache erfasst. Bitte sprich deinen Satz ins Mikrofon.',
      feedbackEn: 'No speech detected. Please speak clearly into your phone microphone.',
    };
  }

  const targetWords = cleanTarget.split(' ').filter(Boolean);
  const spokenWords = cleanSpoken.split(' ').filter(Boolean);

  const matchedWords: string[] = [];
  const missingWords: string[] = [];

  for (const tWord of targetWords) {
    // Check for exact match or close match (distance <= 1 for short words, <= 2 for longer words)
    const isMatched = spokenWords.some((sWord) => {
      if (sWord === tWord) return true;
      const maxDist = tWord.length > 4 ? 2 : 1;
      return levenshteinDistance(sWord, tWord) <= maxDist;
    });

    if (isMatched) {
      matchedWords.push(tWord);
    } else {
      missingWords.push(tWord);
    }
  }

  // Word match percentage
  const wordRatio = targetWords.length > 0 ? matchedWords.length / targetWords.length : 0;

  // Full string Levenshtein similarity ratio
  const maxLen = Math.max(cleanSpoken.length, cleanTarget.length);
  const dist = levenshteinDistance(cleanSpoken, cleanTarget);
  const stringSimilarity = maxLen > 0 ? Math.max(0, 1 - dist / maxLen) : 0;

  // Weighted score (65% word presence + 35% string similarity)
  const rawScore = Math.round((wordRatio * 0.65 + stringSimilarity * 0.35) * 100);
  const score = Math.min(100, Math.max(0, rawScore));

  if (score >= 82) {
    return {
      score,
      gradeBadge: 'Ausgezeichnet',
      colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      matchedWords,
      missingWords,
      feedbackDe: '🎉 Hervorragend! Deine Aussprache ist klar, korrekt und sofort verständlich für die Goethe-Prüfer.',
      feedbackEn: 'Excellent! Clear, accurate pronunciation that Goethe examiners would award full marks.',
    };
  }

  if (score >= 60) {
    return {
      score,
      gradeBadge: 'Sehr gut',
      colorClass: 'bg-teal-100 text-teal-800 border-teal-300',
      matchedWords,
      missingWords,
      feedbackDe: '👍 Sehr gut! Gut verständlich (A1 bestanden). Achte noch auf die Endungen und das Satzende.',
      feedbackEn: 'Very good! Clear enough for passing A1. Pay attention to word endings.',
    };
  }

  if (score >= 40) {
    return {
      score,
      gradeBadge: 'Befriedigend',
      colorClass: 'bg-amber-100 text-amber-800 border-amber-300',
      matchedWords,
      missingWords,
      feedbackDe: '⚠️ Teilweise verstanden. Manche Wörter wurden nicht ganz richtig ausgesprochen. Wiederhole den Satz noch einmal.',
      feedbackEn: 'Partially understood. Some words were mispronounced. Try repeating the sentence.',
    };
  }

  return {
    score,
    gradeBadge: 'Noch üben',
    colorClass: 'bg-rose-100 text-rose-800 border-rose-300',
    matchedWords,
    missingWords,
    feedbackDe: '🔄 Noch einmal üben: Sprich etwas langsamer und betone die Vokale deutlicher.',
    feedbackEn: 'Needs practice: Speak a little slower, closer to the microphone, and articulate each syllable.',
  };
}
