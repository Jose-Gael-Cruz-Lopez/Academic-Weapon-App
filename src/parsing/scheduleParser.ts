import { createWorker, type Worker } from 'tesseract.js';
import type { ParsedScheduleItem } from '../types';

// Schedule Parser — extracts class schedules from screenshot images
// Uses Tesseract OCR with optional grid detection

let tesseractWorker: Worker | null = null;

async function getWorker(): Promise<Worker> {
  if (!tesseractWorker) {
    tesseractWorker = await createWorker('eng');
  }
  return tesseractWorker;
}

// Extract time from text like "10:30 AM", "14:00", "2pm"
function extractTime(text: string): string | undefined {
  // Match 12-hour format: "10:30 AM", "2:45 PM"
  const match12 = text.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
  if (match12) {
    let hour = parseInt(match12[1], 10);
    const min = match12[2] || '00';
    const pm = match12[3].toUpperCase() === 'PM';
    
    if (pm && hour !== 12) hour += 12;
    if (!pm && hour === 12) hour = 0;
    
    return `${hour.toString().padStart(2, '0')}:${min}`;
  }

  // Match 24-hour format: "14:30", "09:00"
  const match24 = text.match(/(\d{2}):(\d{2})/);
  if (match24) {
    return `${match24[1]}:${match24[2]}`;
  }

  return undefined;
}

// Detect day of week from column headers
function detectDayOfWeek(text: string): number | undefined {
  const days: Record<string, number> = {
    'sun': 0, 'sunday': 0, 'su': 0,
    'mon': 1, 'monday': 1, 'm': 1,
    'tue': 2, 'tuesday': 2, 'tu': 2, 'tues': 2,
    'wed': 3, 'wednesday': 3, 'w': 3,
    'thu': 4, 'thursday': 4, 'thurs': 4, 'th': 4, 'r': 4,
    'fri': 5, 'friday': 5, 'f': 5,
    'sat': 6, 'saturday': 6, 'sa': 6, 's': 6
  };

  const lower = text.toLowerCase().trim();
  
  // Direct match
  if (days[lower] !== undefined) {
    return days[lower];
  }

  // Check if text contains day name
  for (const [name, num] of Object.entries(days)) {
    if (lower.includes(name)) {
      return num;
    }
  }

  return undefined;
}

// Heuristic: Is this text likely a class entry?
function isLikelyClass(text: string): boolean {
  const classIndicators = [
    /\b[A-Z]{2,4}\s?\d{3,4}\b/,  // Course codes: "CS 101", "MATH202"
    /\b(lecture|lab|seminar|recitation)\b/i,
    /\d{1,2}:\d{2}/,  // Has time
    /\b(building|room|hall|center)\b/i
  ];
  
  return classIndicators.some(pattern => pattern.test(text));
}

export interface ParseScheduleOptions {
  knownClasses?: string[];  // To match class codes
}

export interface ParseScheduleResult {
  items: ParsedScheduleItem[];
  rawText: string;
  confidence: number;
}

export async function parseScheduleImage(
  imageFile: File | Blob,
  options: ParseScheduleOptions = {}
): Promise<ParseScheduleResult> {
  const worker = await getWorker();
  
  // Run OCR
  const result = await worker.recognize(imageFile);
  const text = result.data.text;
  const lines = text.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  const items: ParsedScheduleItem[] = [];
  let currentDay: number | undefined;

  // Simple heuristic parsing
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a day header
    const day = detectDayOfWeek(line);
    if (day !== undefined) {
      currentDay = day;
      continue;
    }

    // Skip if no day context yet
    if (currentDay === undefined) continue;

    // Try to extract time range
    const times = line.match(/(\d{1,2}:?\d{0,2}\s*(?:AM|PM)?)\s*-\s*(\d{1,2}:?\d{0,2}\s*(?:AM|PM)?)/i);
    
    if (times || isLikelyClass(line)) {
      const startTime = times ? extractTime(times[1]) : undefined;
      const endTime = times ? extractTime(times[2]) : undefined;
      
      // Extract class code if present
      const codeMatch = line.match(/\b([A-Z]{2,4})\s?(\d{3,4})\b/);
      const classCode = codeMatch ? `${codeMatch[1]} ${codeMatch[2]}` : undefined;
      
      // Clean title
      let title = line
        .replace(/\b[A-Z]{2,4}\s?\d{3,4}\b/, '')  // Remove course code
        .replace(/\d{1,2}:?\d{0,2}\s*(?:AM|PM)?\s*-\s*\d{1,2}:?\d{0,2}\s*(?:AM|PM)?/i, '')  // Remove time
        .replace(/\s+/g, ' ')
        .trim();

      if (title.length > 0) {
        items.push({
          class_code: classCode,
          title: title.substring(0, 50),
          day_of_week: currentDay,
          start_time: startTime || '09:00',
          end_time: endTime || '10:00',
          location: undefined, // TODO: extract room numbers
          confidence: startTime && endTime ? 0.8 : 0.5
        });
      }
    }
  }

  // Calculate overall confidence
  const avgConfidence = items.length > 0
    ? items.reduce((sum, item) => sum + item.confidence, 0) / items.length
    : 0;

  return {
    items,
    rawText: text,
    confidence: avgConfidence
  };
}

// Terminate worker when done (call on app unload)
export async function terminateTesseract(): Promise<void> {
  if (tesseractWorker) {
    await tesseractWorker.terminate();
    tesseractWorker = null;
  }
}
