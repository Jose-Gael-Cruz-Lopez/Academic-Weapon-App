"""
OpenCV-based grid schedule parser
"""
import cv2
import numpy as np
import pytesseract
from PIL import Image
import re
from typing import List, Dict, Tuple, Optional, Any
import base64
import io

# Day labels for OCR matching
DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']


def normalize_image(image: np.ndarray) -> Tuple[np.ndarray, int, int]:
    """Normalize image: resize, grayscale, threshold"""
    # Resize to consistent width (~1600px) while preserving aspect ratio
    target_width = 1600
    height, width = image.shape[:2]
    aspect_ratio = width / height
    target_height = int(target_width / aspect_ratio)
    
    resized = cv2.resize(image, (target_width, target_height), interpolation=cv2.INTER_AREA)
    
    # Convert to grayscale if needed
    if len(resized.shape) == 3:
        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    else:
        gray = resized
    
    # Apply adaptive threshold for better OCR
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    return thresh, target_width, target_height


def detect_schedule_area(image: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
    """Detect schedule grid area using edge detection and contour detection"""
    # Find edges
    edges = cv2.Canny(image, 50, 150)
    
    # Use HoughLines to find major grid lines
    lines = cv2.HoughLines(edges, 1, np.pi / 180, threshold=200)
    
    if lines is None or len(lines) < 4:
        # Fallback: use contour detection
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            # Find largest rectangular contour
            largest = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(largest)
            if w > image.shape[1] * 0.5 and h > image.shape[0] * 0.3:
                return (x, y, x + w, y + h)
    
    # Estimate schedule area (exclude top 10% and left 12%)
    height, width = image.shape[:2]
    header_height = int(height * 0.1)
    time_axis_width = int(width * 0.12)
    
    return (time_axis_width, header_height, width, height)


def detect_event_blocks(image: np.ndarray, schedule_area: Tuple[int, int, int, int]) -> List[Dict[str, int]]:
    """Detect colored event blocks inside schedule area"""
    x0, y0, x1, y1 = schedule_area
    
    # Crop to schedule area
    schedule_roi = image[y0:y1, x0:x1]
    
    # Create binary mask: non-white regions
    # Invert threshold so non-white becomes white
    _, mask = cv2.threshold(schedule_roi, 240, 255, cv2.THRESH_BINARY_INV)
    
    # Morphology to clean up noise
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    
    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    blocks = []
    min_area = 2000  # Minimum block area in pixels
    
    for contour in contours:
        area = cv2.contourArea(contour)
        if area < min_area:
            continue
        
        x, y, w, h = cv2.boundingRect(contour)
        
        # Filter by aspect ratio (blocks should be roughly rectangular)
        aspect_ratio = w / h if h > 0 else 0
        if aspect_ratio < 0.2 or aspect_ratio > 5.0:
            continue
        
        # Adjust coordinates to full image space
        blocks.append({
            'x': x + x0,
            'y': y + y0,
            'w': w,
            'h': h
        })
    
    return blocks


def ocr_block(image: np.ndarray, bbox: Dict[str, int], padding: int = 5) -> str:
    """OCR a specific block region"""
    x = max(0, bbox['x'] - padding)
    y = max(0, bbox['y'] - padding)
    w = bbox['w'] + padding * 2
    h = bbox['h'] + padding * 2
    
    # Crop block
    block_roi = image[y:y+h, x:x+w]
    
    # Convert to PIL Image for pytesseract
    pil_image = Image.fromarray(block_roi)
    
    # Perform OCR
    text = pytesseract.image_to_string(pil_image, config='--psm 6').strip()
    
    return text


def detect_day_columns(image: np.ndarray, schedule_area: Tuple[int, int, int, int]) -> List[Dict[str, Any]]:
    """Detect day columns from header row"""
    x0, y0, x1, y1 = schedule_area
    
    # Crop top 10% for header
    header_height = int((y1 - y0) * 0.1)
    header_roi = image[y0:y0+header_height, x0:x1]
    
    # OCR header
    pil_header = Image.fromarray(header_roi)
    header_text = pytesseract.image_to_string(pil_header, config='--psm 6')
    
    # Try to find day labels
    found_days = {}
    for i, day_label in enumerate(DAY_LABELS):
        if day_label in header_text.upper():
            found_days[i] = day_label
    
    # If we found days, estimate column positions
    # Otherwise, divide evenly into 7 columns
    width = x1 - x0
    column_width = width / 7
    
    columns = []
    for i in range(7):
        day_label = found_days.get(i, DAY_LABELS[i])
        columns.append({
            'dayOfWeek': i,
            'xStart': int(x0 + i * column_width),
            'xEnd': int(x0 + (i + 1) * column_width),
            'label': day_label
        })
    
    return columns


def detect_time_scale(image: np.ndarray, schedule_area: Tuple[int, int, int, int]) -> Dict[int, str]:
    """Detect time scale from left axis"""
    x0, y0, x1, y1 = schedule_area
    
    # Crop left 12% for time axis
    time_axis_width = int((x1 - x0) * 0.12)
    time_axis_roi = image[y0:y1, x0:x0+time_axis_width]
    
    # OCR time axis
    pil_time_axis = Image.fromarray(time_axis_roi)
    time_text = pytesseract.image_to_string(pil_time_axis, config='--psm 6')
    
    # Extract time labels and their approximate y-positions
    time_pattern = re.compile(r'(\d{1,2})\s*(AM|PM)', re.IGNORECASE)
    time_marks = {}
    
    lines = time_text.split('\n')
    for line_idx, line in enumerate(lines):
        match = time_pattern.search(line)
        if match:
            hours = int(match.group(1))
            period = match.group(2).upper()
            
            # Convert to 24-hour format
            if period == 'PM' and hours != 12:
                hours += 12
            if period == 'AM' and hours == 12:
                hours = 0
            
            # Estimate y-position (rough approximation based on line position)
            y_estimate = y0 + int((line_idx / len(lines)) * (y1 - y0))
            time_str = f"{hours:02d}:00"
            time_marks[y_estimate] = time_str
    
    return time_marks


def map_block_to_time(block: Dict[str, int], day_columns: List[Dict[str, Any]], 
                      time_marks: Dict[int, str], schedule_area: Tuple[int, int, int, int]) -> Tuple[int, str, str]:
    """Map block to day and time"""
    # Determine day by block center X
    block_center_x = block['x'] + block['w'] / 2
    day_of_week = 0
    
    for col in day_columns:
        if col['xStart'] <= block_center_x <= col['xEnd']:
            day_of_week = col['dayOfWeek']
            break
    
    # Determine time from block Y position
    block_top_y = block['y']
    block_bottom_y = block['y'] + block['h']
    
    # Interpolate time from time marks
    def y_to_time(y: int) -> str:
        if not time_marks:
            # Fallback: assume 6 AM to 10 PM, evenly spaced
            y0, _, _, y1 = schedule_area
            total_minutes = 16 * 60  # 16 hours
            ratio = (y - y0) / (y1 - y0) if y1 > y0 else 0
            minutes = int(ratio * total_minutes)
            hours = minutes // 60 + 6
            mins = minutes % 60
            return f"{hours:02d}:{mins:02d}"
        
        # Find closest time mark
        closest_y = min(time_marks.keys(), key=lambda k: abs(k - y))
        base_time = time_marks[closest_y]
        
        # Simple interpolation (could be improved)
        return base_time
    
    start_time = y_to_time(block_top_y)
    end_time = y_to_time(block_bottom_y)
    
    # Round to nearest 5 minutes
    def round_to_5min(time_str: str) -> str:
        h, m = map(int, time_str.split(':'))
        m = round(m / 5) * 5
        if m >= 60:
            h += 1
            m = 0
        return f"{h:02d}:{m:02d}"
    
    start_time = round_to_5min(start_time)
    end_time = round_to_5min(end_time)
    
    return day_of_week, start_time, end_time


def parse_course_info(text: str) -> Dict[str, Optional[str]]:
    """Parse course information from OCR text"""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # Extract class title (first line, remove course code if present)
    class_title = lines[0] if lines else "Untitled Class"
    class_code_pattern = re.compile(r'\b([A-Z]{2,6}[\s-]?\d{2,3})\b')
    class_title = class_code_pattern.sub('', class_title).strip() or lines[0] if lines else "Untitled Class"
    
    # Extract class code
    class_code_match = class_code_pattern.search(text)
    class_code = class_code_match.group(1) if class_code_match else None
    
    # Extract location
    location_patterns = [
        re.compile(r'\b(Room|Hall|Building|CAS|ENG|SCI|MATH|HUM)\s+([A-Z0-9\s-]+)', re.IGNORECASE),
        re.compile(r'\b([A-Z]{2,4}\s+\d{3,4})\b'),  # Building codes like "ENG 101"
    ]
    
    location = None
    for pattern in location_patterns:
        match = pattern.search(text)
        if match:
            location = match.group(0).strip()
            break
    
    return {
        'classTitle': class_title,
        'classCodeGuess': class_code,
        'locationGuess': location
    }


def calculate_confidence(has_day: bool, has_time: bool, has_text: bool, text_length: int) -> str:
    """Calculate confidence level"""
    if has_day and has_time and has_text and text_length > 5:
        return 'HI'
    if has_day and has_time and has_text:
        return 'MED'
    return 'LO'


def generate_debug_overlay(image: np.ndarray, schedule_area: Tuple[int, int, int, int],
                          day_columns: List[Dict[str, Any]], blocks: List[Dict[str, int]]) -> str:
    """Generate debug overlay image with bounding boxes"""
    # Create a copy for drawing
    debug_image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR) if len(image.shape) == 2 else image.copy()
    
    # Draw schedule area (green)
    x0, y0, x1, y1 = schedule_area
    cv2.rectangle(debug_image, (x0, y0), (x1, y1), (0, 255, 0), 3)
    
    # Draw day column boundaries (blue)
    for col in day_columns:
        cv2.line(debug_image, (col['xStart'], y0), (col['xStart'], y1), (255, 0, 0), 2)
    if day_columns:
        last_col = day_columns[-1]
        cv2.line(debug_image, (last_col['xEnd'], y0), (last_col['xEnd'], y1), (255, 0, 0), 2)
    
    # Draw detected blocks (red)
    for block in blocks:
        cv2.rectangle(debug_image, (block['x'], block['y']), 
                     (block['x'] + block['w'], block['y'] + block['h']), (0, 0, 255), 2)
    
    # Encode to base64
    _, buffer = cv2.imencode('.png', debug_image)
    image_base64 = base64.b64encode(buffer).decode('utf-8')
    
    return image_base64


def parse_grid_schedule(image_bytes: bytes, debug: bool = False) -> Dict[str, Any]:
    """Main parsing function"""
    warnings = []
    
    # Validate image bytes
    if not image_bytes or len(image_bytes) == 0:
        raise ValueError("Empty image data received")
    
    # Load image
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        # Try alternative decoding methods
        warnings.append("Failed to decode image with cv2.IMREAD_COLOR, trying other methods")
        # Try reading as grayscale first
        image = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        if image is not None:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
        
        if image is None:
            raise ValueError("Failed to decode image. Please ensure the file is a valid image format (PNG, JPG, etc.)")
    
    # Normalize image
    normalized, width, height = normalize_image(image)
    
    # Detect schedule area
    schedule_area = detect_schedule_area(normalized)
    if not schedule_area:
        warnings.append("Could not detect schedule area, using default bounds")
        schedule_area = (int(width * 0.12), int(height * 0.1), width, height)
    
    # Detect event blocks
    blocks = detect_event_blocks(normalized, schedule_area)
    if not blocks:
        warnings.append("No event blocks detected")
        return {
            'mode': 'grid_schedule',
            'blocks': [],
            'debug': None,
            'warnings': warnings
        }
    
    # Detect day columns
    day_columns = detect_day_columns(normalized, schedule_area)
    
    # Detect time scale
    time_marks = detect_time_scale(normalized, schedule_area)
    
    # Process each block
    schedule_blocks = []
    for block in blocks:
        # OCR block
        block_text = ocr_block(normalized, block)
        
        if not block_text.strip():
            continue
        
        # Map to day and time
        day_of_week, start_time, end_time = map_block_to_time(
            block, day_columns, time_marks, schedule_area
        )
        
        # Parse course info
        course_info = parse_course_info(block_text)
        
        # Calculate confidence
        confidence = calculate_confidence(
            True,  # has_day
            True,  # has_time
            len(block_text.strip()) > 0,  # has_text
            len(block_text.strip())  # text_length
        )
        
        schedule_blocks.append({
            'bbox': block,
            'text': block_text,
            'dayOfWeek': day_of_week,
            'startTime': start_time,
            'endTime': end_time,
            'classTitle': course_info['classTitle'],
            'classCodeGuess': course_info['classCodeGuess'],
            'locationGuess': course_info['locationGuess'],
            'confidence': confidence
        })
    
    # Sort by day then time
    schedule_blocks.sort(key=lambda b: (b['dayOfWeek'], b['startTime']))
    
    # Generate debug overlay if requested
    debug_info = None
    if debug:
        overlay_base64 = generate_debug_overlay(normalized, schedule_area, day_columns, blocks)
        debug_info = {
            'overlay_image_base64': overlay_base64,
            'detected_columns': day_columns,
            'detected_time_marks': [{'y': k, 'time': v} for k, v in time_marks.items()],
            'schedule_area': {'x0': schedule_area[0], 'y0': schedule_area[1], 
                            'x1': schedule_area[2], 'y1': schedule_area[3]}
        }
    
    return {
        'mode': 'grid_schedule',
        'blocks': schedule_blocks,
        'debug': debug_info,
        'warnings': warnings
    }
