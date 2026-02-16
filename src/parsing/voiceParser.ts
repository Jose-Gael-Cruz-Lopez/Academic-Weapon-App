// Voice Parser — extracts assignments from voice transcripts
// Simple heuristic-based parser for spoken assignment commands

import * as chrono from 'chrono-node';
import type { ParsedAssignment, AssignmentType } from '../types';

const TYPE_KEYWORDS: Record<AssignmentType, string[]> = {
  'Homework': ['homework', 'problem', 'exercise', 'worksheet'],
  'Lab': ['lab', 'laboratory', 'practical'],
  'Quiz': ['quiz', 'pop quiz'],
  'Exam': ['exam', 'midterm', 'final', 'test'],
  'Project': ['project', 'paper', 'essay', 'report'],
  'Reading': ['reading', 'read', 'chapter']
};

export interface ParseVoiceResult {
  assignment: ParsedAssignment | null;
  confidence: number;
}

export function parseVoiceTranscript(transcript: string): ParseVoiceResult {
  const lower = transcript.toLowerCase();

  // Detect assignment type
  let detectedType: AssignmentType = 'Homework';
  let typeConfidence = 0;

  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        detectedType = type as AssignmentType;
        typeConfidence = 0.8;
        break;
      }
    }
    if (typeConfidence > 0) break;
  }

  // Parse date
  const dates = chrono.parse(transcript, new Date(), { forwardDate: true });
  
  if (dates.length === 0) {
    return {
      assignment: null,
      confidence: 0
    };
  }

  const date = dates[0].start.date();
  const dueDate = date.toISOString().split('T')[0];

  // Parse time (optional)
  let dueTime: string | undefined;
  if (dates[0].start.isCertain('hour')) {
    const hour = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    dueTime = `${hour}:${min}`;
  }

  // Extract title by removing date/time and action words
  const actionWords = ['add', 'create', 'schedule', 'set', 'remind', 'me', 'for', 'due', 'on', 'at'];
  let title = transcript;

  // Remove date text
  title = title.replace(dates[0].text, '');

  // Remove action words and type keywords
  const wordsToRemove = [...actionWords, ...TYPE_KEYWORDS[detectedType]];
  for (const word of wordsToRemove) {
    title = title.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  }

  // Clean up
  title = title.replace(/\s+/g, ' ').trim();
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // Default title if empty
  if (title.length < 3) {
    title = `${detectedType} due ${dueDate}`;
  }

  // Calculate confidence
  const hasDate = dates.length > 0;
  const hasType = typeConfidence > 0;
  const confidence = hasDate
    ? (hasType ? 0.85 : 0.6)
    : 0.3;

  return {
    assignment: {
      title: title.substring(0, 100),
      type: detectedType,
      due_date: dueDate,
      due_time: dueTime,
      confidence,
      class_code: undefined  // Could extract from context if known
    },
    confidence
  };
}

// Example commands that work:
// "Add math homework for tomorrow at 5pm"
// "Schedule a chemistry lab for next Friday"
// "Remind me about the history essay due December 15th"
// "Quiz on Wednesday at 2pm"
