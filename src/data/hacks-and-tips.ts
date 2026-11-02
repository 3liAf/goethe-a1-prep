import { MistakeCategoryInfo, MistakeCategoryKey } from '@/types/exam';

export const MISTAKE_CATEGORIES: Record<MistakeCategoryKey, MistakeCategoryInfo> = {
  zahlen_uhrzeiten: {
    key: 'zahlen_uhrzeiten',
    nameDe: 'Zahlen, Uhrzeiten & Daten',
    nameEn: 'Numbers, Times & Dates',
    descriptionDe: 'Verwechslung von verdrehten Zahlen (z. B. 25 vs 52) oder Uhrzeiten (z. B. "halb drei" = 14:30 Uhr, nicht 15:30 Uhr).',
    descriptionEn: 'Confusion of reversed German numbers (e.g., 25 vs 52) or German time expressions (e.g., "halb drei" means 2:30, NOT 3:30).',
    hackTipDe: 'Merke dir die Formel: "halb X" = immer X minus 30 Minuten (halb 8 = 7:30). Bei zweistelligen Zahlen erst die Einerstelle aufschreiben, dann die Zehnerstelle!',
    hackTipEn: 'Golden Rule: "halb X" = X minus 30 mins ("halb 8" = 7:30). For German numbers like "fünfunddreißig", write the 5 first, then 3 = 35.',
  },
  negation_traps: {
    key: 'negation_traps',
    nameDe: 'Negations- & Einschränkungsfalle',
    nameEn: 'Negation & Qualifier Traps',
    descriptionDe: 'Überhören von Verneinungen wie "nicht", "kein", "leider", "doch", "erst morgen" oder "schon ausverkauft".',
    descriptionEn: 'Missing negative words or restriction adverbs like "nicht", "kein", "leider" (unfortunately), "erst" (only starting from), or "ausverkauft" (sold out).',
    hackTipDe: 'Warte immer auf das Verb am Satzende oder Verbindungswörter wie "aber", "leider" oder "doch". Die erste Aussage wird oft im zweiten Halbsatz widerrufen!',
    hackTipEn: 'Never select an answer immediately after hearing the first clause! Wait for German transition words ("aber", "leider", "doch") which reverse the statement.',
  },
  distraktor_hoeren: {
    key: 'distraktor_hoeren',
    nameDe: 'Hörverstehens-Distraktoren',
    nameEn: 'Listening Distractor Traps',
    descriptionDe: 'Im Goethe-Audio werden absichtlich fast alle 3 Optionen erwähnt, aber zwei davon mit Hindernissen oder Absagen versehen.',
    descriptionEn: 'The audio will intentionally pronounce all 3 choices (e.g., Monday, Saturday, Sunday), but discard two through subtle context.',
    hackTipDe: 'Die klassische Goethe-Struktur: Option 1 wird vorgeschlagen ("Samstag?"), abgelehnt ("Nein, da muss ich arbeiten"), Option 2 hat ein Problem ("Sonntag ist zu"), Option 3 ist der Treffer ("Dann also Montag!").',
    hackTipEn: 'The Goethe Formula: Choice 1 is suggested, Choice 2 has an obstacle, Choice 3 is the agreed resolution. Listen for confirmation verbs like "Gut", "Abgemacht", "Passt mir".',
  },
  anzeigen_matching: {
    key: 'anzeigen_matching',
    nameDe: 'Anzeigen- & Website-Bedingungen',
    nameEn: 'Classified & Website Match Traps',
    descriptionDe: 'Übersehen von harten Ausschlusskriterien wie Öffnungszeiten (z. B. "nur werktags"), Zielgruppe ("nur für Damen") oder Zahlungsart.',
    descriptionEn: 'Overlooking hard disqualifiers such as opening hours ("nur sonntags"), audience restrictions, or order methods ("nur online").',
    hackTipDe: 'Lies zuerst die Aufgabenstellung ganz genau! Markiere die Kernbedingung (z. B. "abends" oder "günstig"). Wenn Website A um 18:00 Uhr schließt, ist sie sofort raus!',
    hackTipEn: 'Scan the requirement first! Underline constraints like day/time/budget. If Website A has the right item but closes at 18:00 and you need evening, it is eliminated.',
  },
  formular_genauigkeit: {
    key: 'formular_genauigkeit',
    nameDe: 'Formular-Präzision (Schreiben 1)',
    nameEn: 'Form-Filling Precision (Writing 1)',
    descriptionDe: 'Falsche Feldzuordnung oder Schreiben ganzer Sätze statt knapper, korrekter Fakten (z. B. Verwechslung von Gesamtpersonen vs. Kinder).',
    descriptionEn: 'Placing values into the wrong field or writing verbose sentences instead of exact data (e.g., confusing total persons vs number of kids).',
    hackTipDe: 'Im Formular niemals ganze Sätze schreiben! Nur die präzise Information: z. B. "4" für Personen, "2" für Kinder, "Bar" für Zahlungsweise. Keine Rechtschreibfehler bei Eigennamen!',
    hackTipEn: 'Never write full sentences in Formular Teil 1! Only exact data: numbers, city name, date, payment method. Copy names exactly as spelled.',
  },
  email_struktur_anrede: {
    key: 'email_struktur_anrede',
    nameDe: 'E-Mail Struktur & Formalität (Schreiben 2)',
    nameEn: 'Email Salutation & Structure (Writing 2)',
    descriptionDe: 'Punktabzug wegen falscher Anrede (Du vs. Sie), fehlendem Gruß oder Nichterfüllung eines der 3 vorgeschriebenen Leitpunkte.',
    descriptionEn: 'Losing points due to incorrect formality (informal "Du" vs formal "Sie"), missing greeting/closing, or omitting one of the 3 bullet points.',
    hackTipDe: 'Die 10/10 Punkte-Formel: 1. Passende Anrede mit Komma, 2. Klein weiterschreiben im ersten Satz! 3. Genau einen Satz pro Leitpunkt schreiben. 4. Feste Grußformel + dein Vorname.',
    hackTipEn: 'Foolproof 10/10 Formula: Greeting + comma -> start next line with lowercase! Write 1-2 clear sentences per bullet point. Finish with "Mit freundlichen Grüßen" or "Viele Grüße" + Name.',
  },
  wortschatz_luecke: {
    key: 'wortschatz_luecke',
    nameDe: 'A1-Schlüsselwortschatz',
    nameEn: 'A1 High-Frequency Vocabulary',
    descriptionDe: 'Wissenslücke bei essenziellen Signalwörtern wie "Gleis", "Verspätung", "ermäßigt", "Auskunft", "Öffnungszeiten" oder "Eintritt frei".',
    descriptionEn: 'Unfamiliarity with core Goethe A1 keywords like "Gleis" (platform), "Verspätung" (delay), "ermäßigt" (discounted), "Auskunft" (info counter).',
    hackTipDe: 'Lerne die Bahnhofs- & Flughafen-Wörter auswendig! "Gleis" (Gleis 4), "abfahren/ankommen", "Durchsage", "Verspätung" kommen in fast jeder Hören-Prüfung vor.',
    hackTipEn: 'Memorize the transit bundle: Gleis (platform), Zug (train), Verspätung (delay), fällt aus (canceled), Abfahrt (departure), Ankunft (arrival).',
  },
  grammatik_akkusativ_dativ: {
    key: 'grammatik_akkusativ_dativ',
    nameDe: 'Präpositionen & Kasus',
    nameEn: 'Prepositions & Cases',
    descriptionDe: 'Verwirrung bei Richtungs- und Ortspräpositionen ("nach Berlin" vs "in die Schweiz", "beim Arzt" vs "zum Arzt").',
    descriptionEn: 'Confusion between location and direction prepositions ("in", "nach", "zu", "bei").',
    hackTipDe: 'Personen/Berufe = "zu" / "bei": "Ich gehe zum Arzt" (Richtung), "Ich bin beim Arzt" (Ort). Städte/Länder ohne Artikel = "nach": "nach München".',
    hackTipEn: 'People & professions use "zu/bei": "zum Arzt" (going to), "beim Arzt" (at the doctor). Cities & neuter countries use "nach": "nach Berlin".',
  },
  fragewoerter: {
    key: 'fragewoerter',
    nameDe: 'W-Fragewörter',
    nameEn: 'Question Words (W-Fragen)',
    descriptionDe: 'Verwechslung von Wer (who), Wo (where), Wohin (where to), Woher (where from), Wann (when) und Wie (how).',
    descriptionEn: 'Mixing up German W-words: Wer (who), Wo (where), Wohin (where to), Wann (when).',
    hackTipDe: 'Eselsbrücke: "Wo" = Ort (bleiben), "Wohin" = Richtung (hin gehen), "Woher" = Herkunft (her kommen). "Wer" = Who (nicht Where!).',
    hackTipEn: 'False Friend alert: German "Wer" sounds like "where" but means WHO! "Wo" means WHERE. "Wann" means WHEN.',
  },
};

export const A1_EXAM_HACKS = [
  {
    category: 'Hören (Listening) — 20 Minutes / 15 Points',
    tips: [
      {
        title: 'Teil 1: Read the Question & Options BEFORE the Audio Starts',
        text: 'During the 5-10 second pause before each task, immediately read the question and look at the 3 answer choices. Underline keywords (times, prices, names) so your brain is primed to catch them.',
        priority: 'High',
      },
      {
        title: 'Teil 2: You Only Hear It ONCE! (Public Announcements)',
        text: 'Teil 2 (train station, airport, department store) is played ONLY ONCE. The statements are True/False. Focus on the core announcement: Is a train delayed? Is a gate changed? Is a shop closing early?',
        priority: 'Critical',
      },
      {
        title: 'Teil 3: Answering Machines & Phone Messages',
        text: 'Played twice. Look for callback numbers, meeting times, and cancellations. Distractors are frequent: "Call me back before 6 PM, or tomorrow at 8 AM" - ensure you know which day is asked.',
        priority: 'High',
      },
    ],
  },
  {
    category: 'Lesen (Reading) — 25 Minutes / 15 Points',
    tips: [
      {
        title: 'Teil 1: True / False on Emails & Postcards',
        text: 'Look for synonyms in the text. If the statement says "Lis Zug kommt um 12:45 an", find the time in the email. Remember: "nach halb eins" means after 12:30, which matches 12:45 (Richtig!).',
        priority: 'High',
      },
      {
        title: 'Teil 2: Situational Website Match (A vs B)',
        text: 'You have 5 tasks with 2 websites each. If someone needs "billige Bücher", look for "gebraucht", "Sonderangebote", or "Rabatt". If someone wants to swim in winter, look for "Hallenbad" (indoor pool), not "Freibad" (outdoor pool).',
        priority: 'Critical',
      },
      {
        title: 'Teil 3: Signs & Notices in Public Buildings',
        text: 'True/False on short signs. Watch for prohibition signs: "Rauchen verboten", "Zutritt nur für Personal", "Außer Betrieb" (out of order).',
        priority: 'Medium',
      },
    ],
  },
  {
    category: 'Schreiben (Writing) — 20 Minutes / 15 Points',
    tips: [
      {
        title: 'Teil 1: Formular ausfüllen (5 Points — Free Marks!)',
        text: 'Read the short scenario carefully. Count the exact number of people (adults vs children). Write numbers as digits ("4") or plain words ("vier"). Check the payment method (Bar = cash, Kreditkarte = credit card).',
        priority: 'Critical',
      },
      {
        title: 'Teil 2: Master Email Template (Guaranteed 10/10)',
        text: 'Always write:\n1. Formal: "Sehr geehrte Damen und Herren," / Informal: "Liebe/Lieber [Name],"\n2. Start next line with a lower-case letter: "ich schreibe Ihnen, weil..."\n3. Address Leitpunkt 1 in sentence 1, Leitpunkt 2 in sentence 2, Leitpunkt 3 in sentence 3.\n4. Closing: "Mit freundlichen Grüßen" or "Viele Grüße" + your name.\nAim for 30-35 words.',
        priority: 'Critical',
      },
    ],
  },
  {
    category: 'Sprechen (Speaking) — 15 Minutes / 15 Points',
    tips: [
      {
        title: 'Teil 1: The Foolproof Self-Introduction Formula',
        text: 'Memorize these exact 7 sentences:\n- Name: "Ich heiße [Name]."\n- Alter: "Ich bin [Alter] Jahre alt."\n- Land: "Ich komme aus [Land]."\n- Wohnort: "Ich wohne in [Stadt]."\n- Sprachen: "Ich spreche Englisch, Urdu und ein bisschen Deutsch."\n- Beruf: "Ich bin Softwareentwickler von Beruf."\n- Hobby: "Meine Hobbys sind Lesen und Sport machen."',
        priority: 'Critical',
      },
      {
        title: 'Teil 1 Bonus: Spelling & Numbers',
        text: 'The examiner will ask: "Können Sie bitte Ihren Namen / Ihre Straße buchstabieren?" and "Wie ist Ihre Telefonnummer / Postleitzahl?". Practice the German alphabet (especially Ä, Ö, Ü, EI vs IE) and reciting numbers digit by digit!',
        priority: 'High',
      },
      {
        title: 'Teil 2 & 3: Magic Question & Polite Request Templates',
        text: 'For Teil 2 (Questions): Always start with a W-Frage or Verb-first question: "Haben Sie...?", "Wo kann man... kaufen?", "Wie viel kostet...?".\nFor Teil 3 (Requests with pictures): Always say "Können Sie mir bitte das Buch geben?" or "Darf ich hier bitte rauchen?". Response: "Ja, natürlich, bitte schön!" or "Nein, das ist hier verboten."',
        priority: 'High',
      },
    ],
  },
];
