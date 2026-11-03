'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Share, PlusSquare, X, CheckCircle, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallBanner() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Register service worker
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.debug('ServiceWorker registration error:', err);
      });
    }

    // Check if dismissed previously in session
    const dismissed = sessionStorage.getItem('goethe_pwa_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    // Check if running in standalone mode (already installed as PWA)
    const isStandaloneMode =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches;

    setIsStandalone(isStandaloneMode);

    // Detect iOS / iPadOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (ua.includes('macintosh') && window.navigator.maxTouchPoints > 1);

    setIsIOS(isAppleDevice);

    // Android / Desktop PWA install prompt handler
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('goethe_pwa_banner_dismissed', 'true');
  };

  // If already running inside installed standalone PWA, don't show prompt
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Top Banner or Notification if not yet installed */}
      {!isDismissed && (
        <aside
          aria-label="PWA Installation"
          className="bg-emerald-900 text-emerald-100 border-b border-emerald-800 text-xs px-3.5 py-2 flex items-center justify-between gap-3 shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <span className="p-1 bg-emerald-700 rounded-md text-white">
              <Smartphone className="w-3.5 h-3.5" />
            </span>
            <span className="font-medium text-slate-100 leading-snug">
              {isIOS
                ? '📱 Tipp für iPhone: Installiere die Goethe A1 App auf deinen Home-Bildschirm!'
                : '📱 Lade die Goethe A1 App direkt auf dein Smartphone herunter.'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-emerald-950 font-black text-xs px-3 py-1 rounded-md transition-colors shadow-xs"
            >
              {isIOS ? 'Anleitung öffnen' : 'App installieren'}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Banner schließen"
              className="text-emerald-300 hover:text-white p-1 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* iPhone PWA Step-by-Step Installation Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#007346] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
                  A1
                </div>
                <div>
                  <h3 id="pwa-modal-title" className="font-bold text-slate-900 text-base leading-tight">
                    Goethe A1 als App
                  </h3>
                  <p className="text-xs text-slate-500">Auf dem iPhone-Home-Bildschirm</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Benefits */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#007346]" />
                <span>Vorteile als Home-Screen App:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-800 text-[11px] pl-1">
                <li>Volles Vollbild ohne Safari-Browserleisten</li>
                <li>Schnellere Audio-Wiedergabe & Mikrofonzugriff</li>
                <li>Funktioniert offline für alle 15 Prüfungen</li>
              </ul>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#007346] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs text-slate-800">
                  <p className="font-bold mb-0.5 flex items-center gap-1">
                    <span>Tippe auf das Teilen-Symbol</span>
                    <Share className="w-4 h-4 text-blue-600 inline ml-1" />
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Unten in der Menüleiste von Safari auf dem iPhone (Quadrat mit Pfeil nach oben).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#007346] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs text-slate-800">
                  <p className="font-bold mb-0.5 flex items-center gap-1">
                    <span>Scrolle zu &ldquo;Zum Home-Bildschirm&rdquo;</span>
                    <PlusSquare className="w-4 h-4 text-slate-700 inline ml-1" />
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Tippe auf das Symbol <em>&ldquo;Zum Home-Bildschirm&rdquo;</em> (Add to Home Screen).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#007346] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs text-slate-800">
                  <p className="font-bold mb-0.5">Tippe oben rechts auf &ldquo;Hinzufügen&rdquo;</p>
                  <p className="text-slate-500 text-[11px]">
                    Das Goethe A1 Symbol erscheint auf deinem Home-Bildschirm wie eine native App!
                  </p>
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full bg-[#007346] hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Verstanden
            </button>
          </div>
        </div>
      )}
    </>
  );
}
