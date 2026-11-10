import fs from 'fs';
import path from 'path';
import { MOCK_EXAMS } from '../src/data/mock-exams';

interface AudioTask {
  examId: string;
  questionId: string;
  teil: number;
  questionNumber: number;
  audioScript: string;
  outputFile: string;
}

const tasks: AudioTask[] = [];

for (const exam of MOCK_EXAMS) {
  for (const q of exam.hoeren.questions) {
    tasks.push({
      examId: exam.id,
      questionId: q.id,
      teil: q.teil,
      questionNumber: q.number,
      audioScript: q.audioScript,
      outputFile: path.join('public', 'audio', exam.id, `${q.id}.mp3`),
    });
  }
}

console.log(`Generated ${tasks.length} audio tasks across ${MOCK_EXAMS.length} exams.`);
fs.writeFileSync(
  path.join(__dirname, 'audio_tasks.json'),
  JSON.stringify(tasks, null, 2),
  'utf-8'
);
console.log('Saved to scripts/audio_tasks.json');
