# Parsing Documentation

## Syllabus Parser

Extracts assignments from PDF/text syllabi:

1. **Date detection** — Uses `chrono-node` to find due dates
2. **Type detection** — Keyword matching for Homework/Lab/Quiz/Exam/Project/Reading
3. **Points extraction** — Regex for "10 points", "20 pts"
4. **Title extraction** — Removes date/time, keeps description

**Confidence scoring:**
- 0.7-0.95: Has date + keyword match
- 0.4: Has date but no keyword match

### Usage

```typescript
import { parseSyllabusPDF } from './parsing/syllabusParser';

const result = await parseSyllabusPDF(file, { classCode: 'CS 101' });
// Returns: { assignments: [...], rawText: "..." }
```

---

## Schedule Parser

Extracts class schedule from screenshot images:

1. **OCR** — Tesseract.js for text recognition
2. **Day detection** — Column headers: MON, TUE, etc.
3. **Time extraction** — "10:30 AM - 12:00 PM"
4. **Class code extraction** — "CS 101" patterns

**Limitations:**
- Works best on clear, high-contrast schedule images
- May miss complex layouts with overlapping events
- Location/room extraction not yet implemented

### Usage

```typescript
import { parseScheduleImage } from './parsing/scheduleParser';

const result = await parseScheduleImage(file);
// Returns: { items: [...], rawText: "...", confidence: 0.8 }
```

---

## Voice Parser

Extracts assignments from spoken commands:

1. **Transcript** → Text from speech recognition
2. **Date parsing** — `chrono-node`
3. **Type detection** — Keywords: "homework", "quiz", "exam"
4. **Title cleaning** — Remove action words

### Supported Commands

- "Add math homework for tomorrow at 5pm"
- "Schedule chemistry lab for next Friday"
- "Remind me about history essay due December 15th"
- "Quiz on Wednesday at 2pm"

### Usage

```typescript
import { parseVoiceTranscript } from './parsing/voiceParser';

const result = parseVoiceTranscript("Add homework for tomorrow");
// Returns: { assignment: {...}, confidence: 0.85 }
```

---

## Important: Never Auto-Save

All parsers return **preview data** with confidence scores. The UI must show a confirmation screen before saving. See `ImportPage` for implementation.
