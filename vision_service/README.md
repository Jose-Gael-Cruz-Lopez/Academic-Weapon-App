# Vision Service - Grid Schedule Parser

Python FastAPI service for parsing weekly grid schedule images using OpenCV and Tesseract OCR.

## Setup

### 1. Install System Dependencies

**macOS:**
```bash
brew install python tesseract
```

**Windows:**
- Install Python 3.10+ from [python.org](https://www.python.org/downloads/)
- Install Tesseract from [GitHub releases](https://github.com/UB-Mannheim/tesseract/wiki) and add to PATH

**Linux:**
```bash
sudo apt install python3 python3-pip tesseract-ocr
```

### 2. Create Virtual Environment

```bash
cd vision_service
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### 3. Install Python Packages

```bash
pip install fastapi uvicorn opencv-python pytesseract pillow numpy pydantic python-multipart
```

## Running the Service

```bash
uvicorn main:app --reload --port 5055
```

The service will be available at `http://localhost:5055`

## API Endpoints

### POST /parse-grid-schedule

Parse a weekly grid schedule image.

**Request:**
- `file`: Multipart file upload (image file)
- `debug`: Query parameter (optional, boolean) - Include debug overlay image

**Response:**
```json
{
  "mode": "grid_schedule",
  "blocks": [
    {
      "bbox": {"x": 100, "y": 200, "w": 150, "h": 80},
      "text": "CS 101\nIntroduction to Computer Science\nRoom 101",
      "dayOfWeek": 1,
      "startTime": "10:00",
      "endTime": "11:30",
      "classTitle": "Introduction to Computer Science",
      "classCodeGuess": "CS 101",
      "locationGuess": "Room 101",
      "confidence": "HI"
    }
  ],
  "debug": {
    "overlay_image_base64": "iVBORw0KGgo...",
    "detected_columns": [...],
    "detected_time_marks": [...],
    "schedule_area": {...}
  },
  "warnings": []
}
```

## Development

The service uses:
- **OpenCV** for image processing and block detection
- **Tesseract OCR** for text extraction
- **FastAPI** for the web service

## Troubleshooting

- If Tesseract is not found, ensure it's installed and in your PATH
- On macOS, you may need to set `pytesseract.pytesseract.tesseract_cmd` to the full path
- For better OCR results, ensure images are clear and well-lit
