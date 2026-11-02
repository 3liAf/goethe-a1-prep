# Goethe-Zertifikat A1: Start Deutsch 1 — Exam Simulator & Mistake Diagnostic Database

[![Deploy Next.js site to Pages](https://github.com/3liAf/goethe-a1-prep/actions/workflows/deploy.yml/badge.svg)](https://github.com/3liAf/goethe-a1-prep/actions/workflows/deploy.yml)
[![Live Site](https://img.shields.io/badge/Live_Site-GitHub_Pages-007346?style=flat&logo=github)](https://3liaf.github.io/goethe-a1-prep/)

A complete, production-grade recreation of the official **Goethe-Zertifikat A1: Start Deutsch 1** barrier-free examination platform ([bfu.goethe.de/a1_sd1](https://bfu.goethe.de/a1_sd1/)), enhanced with:

- 🎧 **Interactive German Audio Engine**: Built-in German speech synthesis with authentic examination chimes, play limits (2x for Teil 1/3, 1x for Teil 2), and optional transcripts.
- 📚 **3 Full Mock Exams**:
  - **Modellsatz 1**: Exact recreation of the official Goethe-Institut sample exam.
  - **Modellsatz 2**: Daily life, transit, shopping & appointments focus.
  - **Modellsatz 3**: Workplace, health & vacation accommodation focus.
- 🧠 **Persistent Mistake Diagnostic Database**: Automatically logs and categorizes every error into 9 core linguistic trap types (*Zahlen/Uhrzeiten, Negationsfallen, Distraktoren, Anzeigen-Matching, Formular-Präzision, etc.*) and recommends targeted study priorities.
- ✍️ **Automated Writing Evaluation**:
  - Teil 1 Formular with multi-variation answer acceptance.
  - Teil 2 Email evaluator with word count, formality detection, and 3-Leitpunkte rubric scoring out of 10 points.
- 🗣️ **Oral Examination Simulator**: 7-point self-introduction checklist, pronunciation audio, Thema prompt cards, and polite request templates.
- 💡 **A1 Hacks & Strategy**: High-yield formulas, time equations (`halb X = (X - 1):30`), false friends, and 10/10 writing templates.

---

## 🚀 Live Demo

- **Live URL**: [https://3liaf.github.io/goethe-a1-prep/](https://3liaf.github.io/goethe-a1-prep/)

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/3liAf/goethe-a1-prep.git
cd goethe-a1-prep

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📊 Exam Structure & Scoring

| Module | Duration | Question Format | Raw Points | Scaled Weight | Passing Threshold |
|---|---|---|---|---|---|
| **Hören** | 20 Min | Teil 1 (6 MCQs), Teil 2 (4 R/F), Teil 3 (5 MCQs) | 15 Punkte | 25% (25 Pkt.) | 15 / 25 Pkt. |
| **Lesen** | 25 Min | Teil 1 (5 R/F), Teil 2 (5 Websites A/B), Teil 3 (5 R/F) | 15 Punkte | 25% (25 Pkt.) | 15 / 25 Pkt. |
| **Schreiben** | 20 Min | Teil 1 (5 Formularfelder), Teil 2 (E-Mail, ~30 Wörter) | 15 Punkte | 25% (25 Pkt.) | 15 / 25 Pkt. |
| **Sprechen** | 15 Min | Teil 1 (Sich vorstellen), Teil 2 (Thema), Teil 3 (Bitten) | 15 Punkte | 25% (25 Pkt.) | 15 / 25 Pkt. |
| **Gesamt** | **~80 Min** | **Alle 4 Fertigkeiten kombiniert** | **60 Punkte** | **100 Punkte** | **60 / 100 Punkte (60%)** |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: Strict TypeScript
- **Styling**: Tailwind CSS v4 + Goethe CI Palette
- **Icons**: Lucide React
- **Audio**: Web Speech API (`de-DE`) + Web Audio API
- **Persistence**: Local Storage + JSON Import/Export
- **CI/CD**: GitHub Actions + GitHub Pages
