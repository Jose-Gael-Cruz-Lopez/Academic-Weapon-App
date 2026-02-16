import * as chrono from 'chrono-node';
import type { ParsedAssignment, AssignmentType } from '../types';

// Syllabus Parser — extracts assignments from text/PDF content
// Never auto-saves; always returns preview with confidence scores

const KEYWORDS: Record<AssignmentType, string[]> = {
  'Homework': ['homework', 'hw', 'problem set', 'ps', 'assignment', 'exercise'],
  'Lab': ['lab', 'laboratory', 'practical'],
  'Quiz': ['quiz', 'pop quiz', 'assessment'],
  'Exam': ['exam', 'midterm', 'mid-term', 'final', 'test', 'quiz'],
  'Project': ['project', 'paper', 'essay', 'report', 'presentation'],
  'Reading': ['reading', 'read', 'chapter', 'ch.', 'pages', 'pp']
};

function detectType(text: string): { type: AssignmentType; confidence: number } {
  const lower = text.toLowerCase();
  let bestType: AssignmentType = 'Homework';
  let bestScore = 0;

  for (const [type, keywords] of Object.entries(KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestType = type as AssignmentType;
    }
  }

  // Normalize confidence: 0-1 based on keyword match
  const confidence = Math.min(bestScore / 2, 1);
  return { type: bestType, confidence };
}

function extractPoints(text: string): number | undefined {
  // Match patterns like "10 points", "20 pts", "(100 pts)"
  const match = text.match(/(\d+)\s*(?:points?|pts?)/i);
  return match ? parseInt(match[1], 10) : undefined;
}

export interface ParseSyllabusOptions {
  classCode?: string;  // To match/filter results
}

export interface ParseSyllabusResult {
  assignments: ParsedAssignment[];
  rawText: string;
}

export async function parseSyllabus(
  text: string,
  options: ParseSyllabusOptions = {}
): Promise<ParseSyllabusResult> {
  const lines = text.split(/\n|\r/).filter(l => l.trim().length > 0);
  const assignments: ParsedAssignment[] = [];

  for (const line of lines) {
    // Look for date patterns
    const dates = chrono.parse(line, new Date(), { forwardDate: true });
    
    if (dates.length > 0) {
      const date = dates[0];
      const dateStr = date.start.date().toISOString().split('T')[0];
      
      // Detect type from keywords
      const typeInfo = detectType(line);
      
      // Extract title (remove date text, keep rest)
      let title = line
        .replace(date.text, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Clean up common prefixes
      title = title.replace(/^(?:\d+[.:-]?\s*)?/, ''); // "1. " or "1: "
      
      // Calculate overall confidence
      const hasKeyword = typeInfo.confidence > 0;
      const confidence = hasKeyword
        ? 0.7 + (typeInfo.confidence * 0.3)
        : 0.4; // Low confidence if no keyword match

      const points = extractPoints(line);

      assignments.push({
        title: title.substring(0, 100), // Limit length
        type: typeInfo.type,
        due_date: dateStr,
        class_code: options.classCode,
        points_possible: points,
        confidence: Math.min(confidence, 0.95)
      });
    }
  }

  // Sort by date
  assignments.sort((a, b) => a.due_date.localeCompare(b.due_date));

  return {
    assignments,
    rawText: text
  };
}

// Parse from PDF file (browser-side)
export async function parseSyllabusPDF(
  file: File,
  options: ParseSyllabusOptions = {}
): Promise<ParseSyllabusResult> {
  // Dynamically import pdfjs-dist to avoid bundle bloat
  const pdfjs = await import('pdfjs-dist');
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  // Extract text from all pages
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
  }
  
  return parseSyllabus(fullText, options);
}
