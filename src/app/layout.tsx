import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Goethe-Zertifikat A1 Modellsatz — Prüfungssimulator & Fehler-Analyse DB',
  description:
    'Offizieller Prüfungssimulator für Goethe-Zertifikat A1: Start Deutsch 1 mit deutscher Audio-Wiedergabe, interaktiven Modellsätzen, Fehler-Diagnose-Datenbank und A1-Hacks.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
