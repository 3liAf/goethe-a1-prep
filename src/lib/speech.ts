// German Web Speech API Audio Helper & Web Audio Sound Effects

let currentUtterance: SpeechSynthesisUtterance | null = null;

// Play standard German examination gong / beep chime using Web Audio API
export function playExamChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Ding-dong chord
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.65);
  } catch (e) {
    console.debug('Web audio chime not available:', e);
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
  rate?: number; // default 0.9 for clear A1 clarity
  pitch?: number; // default 1.0
}

export function speakGermanText(text: string, options?: SpeakOptions): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (options?.onError) options.onError(new Error('Speech synthesis not supported in this browser'));
    return;
  }

  stopSpeaking();

  // Play polite chime
  playExamChime();

  setTimeout(() => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      currentUtterance = utterance;

      utterance.lang = 'de-DE';
      utterance.rate = options?.rate ?? 0.88; // Slight slower pace for A1 learners
      utterance.pitch = options?.pitch ?? 1.0;

      // Try to find a native German voice
      const voices = window.speechSynthesis.getVoices();
      const germanVoice =
        voices.find((v) => v.lang.startsWith('de') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('German') || v.name.includes('Deutsch'))) ||
        voices.find((v) => v.lang.startsWith('de'));

      if (germanVoice) {
        utterance.voice = germanVoice;
      }

      utterance.onstart = () => {
        if (options?.onStart) options.onStart();
      };

      utterance.onend = () => {
        currentUtterance = null;
        if (options?.onEnd) options.onEnd();
      };

      utterance.onerror = (e) => {
        currentUtterance = null;
        if (options?.onError) options.onError(e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      if (options?.onError) options.onError(err);
    }
  }, 350);
}
