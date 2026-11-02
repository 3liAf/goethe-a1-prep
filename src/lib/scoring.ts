import { MockExam, QuestionMistake, ExamAttemptRecord } from '@/types/exam';

export interface EvaluationResult {
  scores: {
    hoeren: { raw: number; max: 15; scaled: number };
    lesen: { raw: number; max: 15; scaled: number };
    schreiben: { raw: number; max: 15; scaled: number };
    sprechen: { raw: number; max: 15; scaled: number };
    totalScaled: number;
  };
  passed: boolean;
  cefrGrade: 'Sehr gut (1)' | 'Gut (2)' | 'Befriedigend (3)' | 'Ausreichend (4)' | 'Nicht bestanden (5)';
  mistakes: QuestionMistake[];
  schreibenTeil2Feedback: {
    scoreOutOf10: number;
    wordCount: number;
    hasSalutation: boolean;
    hasClosing: boolean;
    leitpunkteResults: { point: string; covered: boolean; tip: string }[];
    feedbackNotes: string[];
  };
}

export function evaluateSchreibenTeil2(
  text: string,
  exam: MockExam
): {
  scoreOutOf10: number;
  wordCount: number;
  hasSalutation: boolean;
  hasClosing: boolean;
  leitpunkteResults: { point: string; covered: boolean; tip: string }[];
  feedbackNotes: string[];
} {
  const cleanText = text.trim();
  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  const lower = cleanText.toLowerCase();

  // 1. Check Salutation
  const hasSalutation =
    lower.includes('sehr geehrte') ||
    lower.includes('sehr geehrter') ||
    lower.includes('hallo') ||
    lower.includes('liebe') ||
    lower.includes('lieber') ||
    lower.includes('guten tag') ||
    lower.includes('guten morgen') ||
    lower.includes('guten abend');

  // 2. Check Closing
  const hasClosing =
    lower.includes('mit freundlichen grüßen') ||
    lower.includes('mit freundlichen gruessen') ||
    lower.includes('freundliche grüße') ||
    lower.includes('freundliche gruesse') ||
    lower.includes('viele grüße') ||
    lower.includes('viele gruesse') ||
    lower.includes('herzliche grüße') ||
    lower.includes('herzliche gruesse') ||
    lower.includes('beste grüße') ||
    lower.includes('beste gruesse') ||
    lower.includes('liebe grüße') ||
    lower.includes('liebe gruesse') ||
    lower.includes('auf wiedersehen') ||
    lower.includes('tschüss') ||
    lower.includes('tschuess') ||
    lower.includes('dein') ||
    lower.includes('deine');

  const leitpunkteResults = exam.schreiben.teil2.leitpunkte.map((lp, index) => {
    let covered = false;
    let tip = '';

    // If explicit rules are provided in the exam data:
    if (exam.schreiben.teil2.leitpunkteRules && exam.schreiben.teil2.leitpunkteRules[index]) {
      const rule = exam.schreiben.teil2.leitpunkteRules[index];
      covered = rule.keywords.some(kw => lower.includes(kw.toLowerCase()));
      tip = rule.tip;
    } else if (exam.id === 'modellsatz-1') {
      if (index === 0) {
        covered = lower.includes('august') || lower.includes('dresden') || lower.includes('besuchen') || lower.includes('reise');
        tip = 'Mention visiting Dresden in August ("Ich möchte im August Dresden besuchen").';
      } else if (index === 1) {
        covered = lower.includes('museum') || lower.includes('kultur') || lower.includes('information') || lower.includes('film');
        tip = 'Ask for cultural or museum information ("Können Sie mir Informationen über Museen schicken?").';
      } else {
        covered = lower.includes('hotel') || lower.includes('adresse') || lower.includes('übernacht') || lower.includes('günstig');
        tip = 'Inquire about affordable hotel addresses ("Haben Sie Hoteladressen?").';
      }
    } else if (exam.id === 'modellsatz-2') {
      if (index === 0) {
        covered = lower.includes('entschuldig') || lower.includes('leider') || lower.includes('nicht kommen') || lower.includes('fehlen');
        tip = 'Apologize for missing class ("Ich kann leider nicht kommen").';
      } else if (index === 1) {
        covered = lower.includes('dienstreise') || lower.includes('arbeit') || lower.includes('geschäftlich') || lower.includes('reise');
        tip = 'State the reason (business trip / Dienstreise).';
      } else {
        covered = lower.includes('unterlagen') || lower.includes('material') || lower.includes('hausaufgabe') || lower.includes('schicken');
        tip = 'Ask for course materials/homework ("Schicken Sie mir bitte die Hausaufgaben").';
      }
    } else if (exam.id === 'modellsatz-3') {
      if (index === 0) {
        covered = lower.includes('dank') || lower.includes('einladung') || lower.includes('geburtstag');
        tip = 'Thank for birthday invitation ("Vielen Dank für die Einladung").';
      } else if (index === 1) {
        covered = lower.includes('arbeit') || lower.includes('überstunden') || lower.includes('samstag') || lower.includes('nicht kommen');
        tip = 'Explain work reason for cancellation ("Ich muss am Samstag leider arbeiten").';
      } else {
        covered = lower.includes('nächste woche') || lower.includes('treffen') || lower.includes('kaffee') || lower.includes('zeit');
        tip = 'Suggest meeting next week ("Treffen wir uns nächste Woche?").';
      }
    } else {
      const keywords = lp.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      covered = keywords.some(kw => lower.includes(kw));
      tip = `Address the point: "${lp}".`;
    }

    return { point: lp, covered, tip };
  });

  const feedbackNotes: string[] = [];
  let score = 0;

  // Communicative Form (max 2 points)
  if (hasSalutation) {
    score += 1;
  } else {
    feedbackNotes.push('Missing appropriate salutation (e.g., "Sehr geehrte Damen und Herren," or "Liebe/Lieber [Name],").');
  }

  if (hasClosing) {
    score += 1;
  } else {
    feedbackNotes.push('Missing closing formula (e.g., "Mit freundlichen Grüßen" or "Viele Grüße").');
  }

  // Word Count (max 2 points)
  if (wordCount >= 25 && wordCount <= 55) {
    score += 2;
  } else if (wordCount >= 18) {
    score += 1;
    feedbackNotes.push(`Word count is ${wordCount} words (ideal is 30–35 words).`);
  } else {
    feedbackNotes.push(`Text is too short (${wordCount} words). Aim for at least 30 words.`);
  }

  // Leitpunkte (2 points each = 6 points)
  leitpunkteResults.forEach((lp) => {
    if (lp.covered) {
      score += 2;
    } else {
      feedbackNotes.push(`Point not clearly fulfilled: "${lp.point}". ${lp.tip}`);
    }
  });

  if (feedbackNotes.length === 0) {
    feedbackNotes.push('Excellent writing! All 3 required points, proper salutation, and closing were included.');
  }

  return {
    scoreOutOf10: Math.min(10, Math.max(0, score)),
    wordCount,
    hasSalutation,
    hasClosing,
    leitpunkteResults,
    feedbackNotes,
  };
}

export function calculateExamScore(
  exam: MockExam,
  answers: Record<string, string>,
  schreibenTeil1Answers: Record<number, string>,
  schreibenTeil2Text: string,
  sprechenSelfScore: number // 0 to 15
): EvaluationResult {
  const mistakes: QuestionMistake[] = [];
  const now = new Date().toISOString();

  // 1. Hören (15 questions)
  let rawHoeren = 0;
  exam.hoeren.questions.forEach((q) => {
    const userAns = answers[q.id]?.trim().toLowerCase() || '';
    const correctAns = q.correctAnswer.toLowerCase();

    if (userAns === correctAns) {
      rawHoeren += 1;
    } else {
      mistakes.push({
        examId: exam.id,
        module: 'hoeren',
        questionId: q.id,
        questionNumber: q.number,
        questionPrompt: q.question,
        userAnswer: userAns || '(No answer)',
        correctAnswer: q.options.find((o) => o.id.toLowerCase() === correctAns)?.text || q.correctAnswer,
        category: q.mistakeCategory,
        explanation: q.explanationEn,
        hackTip: q.hackTip,
        timestamp: now,
      });
    }
  });

  // 2. Lesen (15 questions)
  let rawLesen = 0;
  exam.lesen.questions.forEach((q) => {
    const userAns = answers[q.id]?.trim().toLowerCase() || '';
    const correctAns = q.correctAnswer.toLowerCase();

    if (userAns === correctAns) {
      rawLesen += 1;
    } else {
      mistakes.push({
        examId: exam.id,
        module: 'lesen',
        questionId: q.id,
        questionNumber: q.number,
        questionPrompt: q.statement,
        userAnswer: userAns || '(No answer)',
        correctAnswer: q.correctAnswer === 'richtig' ? 'Richtig' : q.correctAnswer === 'falsch' ? 'Falsch' : `Website ${q.correctAnswer.toUpperCase()}`,
        category: q.mistakeCategory,
        explanation: q.explanationEn,
        hackTip: q.hackTip,
        timestamp: now,
      });
    }
  });

  // 3. Schreiben Teil 1 (5 fields, 1 pt each)
  let rawSchreibenTeil1 = 0;
  exam.schreiben.teil1.fieldsToFill.forEach((field) => {
    const userVal = (schreibenTeil1Answers[field.fieldNumber] || '').trim().toLowerCase();
    const isCorrect = field.correctAnswers.some((ans) => {
      const cleanAns = ans.trim().toLowerCase();
      return userVal === cleanAns || (userVal.length > 0 && cleanAns.includes(userVal));
    });

    if (isCorrect) {
      rawSchreibenTeil1 += 1;
    } else {
      mistakes.push({
        examId: exam.id,
        module: 'schreiben',
        questionId: `schreiben-t1-f${field.fieldNumber}`,
        questionNumber: field.fieldNumber,
        questionPrompt: `Formular Feld ${field.fieldNumber}: ${field.label}`,
        userAnswer: userVal || '(Empty field)',
        correctAnswer: field.correctAnswers[0],
        category: field.mistakeCategory,
        explanation: field.explanationEn,
        hackTip: field.hackTip,
        timestamp: now,
      });
    }
  });

  // 4. Schreiben Teil 2 (10 points max)
  const teil2Result = evaluateSchreibenTeil2(schreibenTeil2Text, exam);
  const rawSchreiben = rawSchreibenTeil1 + teil2Result.scoreOutOf10;

  // 5. Sprechen
  const rawSprechen = Math.min(15, Math.max(0, sprechenSelfScore));

  // Scaled calculations (raw / 15 * 25 = 100 max)
  const scaledHoeren = Math.round((rawHoeren / 15) * 25 * 10) / 10;
  const scaledLesen = Math.round((rawLesen / 15) * 25 * 10) / 10;
  const scaledSchreiben = Math.round((rawSchreiben / 15) * 25 * 10) / 10;
  const scaledSprechen = Math.round((rawSprechen / 15) * 25 * 10) / 10;

  const totalScaled = Math.round(scaledHoeren + scaledLesen + scaledSchreiben + scaledSprechen);
  const passed = totalScaled >= 60;

  let cefrGrade: EvaluationResult['cefrGrade'];
  if (totalScaled >= 90) cefrGrade = 'Sehr gut (1)';
  else if (totalScaled >= 80) cefrGrade = 'Gut (2)';
  else if (totalScaled >= 70) cefrGrade = 'Befriedigend (3)';
  else if (totalScaled >= 60) cefrGrade = 'Ausreichend (4)';
  else cefrGrade = 'Nicht bestanden (5)';

  return {
    scores: {
      hoeren: { raw: rawHoeren, max: 15, scaled: scaledHoeren },
      lesen: { raw: rawLesen, max: 15, scaled: scaledLesen },
      schreiben: { raw: rawSchreiben, max: 15, scaled: scaledSchreiben },
      sprechen: { raw: rawSprechen, max: 15, scaled: scaledSprechen },
      totalScaled,
    },
    passed,
    cefrGrade,
    mistakes,
    schreibenTeil2Feedback: teil2Result,
  };
}
