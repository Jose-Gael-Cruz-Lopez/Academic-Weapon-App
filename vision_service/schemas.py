"""
Type definitions for grid schedule parsing
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class BoundingBox(BaseModel):
    x: int
    y: int
    w: int
    h: int


class ScheduleBlock(BaseModel):
    bbox: Dict[str, int]  # {x, y, w, h} as dict
    text: str
    dayOfWeek: int  # 0-6 (Sunday-Saturday)
    startTime: str  # "HH:MM"
    endTime: str  # "HH:MM"
    classTitle: str
    classCodeGuess: Optional[str] = None
    locationGuess: Optional[str] = None
    confidence: str  # "HI" | "MED" | "LO"


class DebugInfo(BaseModel):
    overlay_image_base64: Optional[str] = None
    detected_columns: Optional[List[Dict[str, Any]]] = None
    detected_time_marks: Optional[List[Dict[str, Any]]] = None
    schedule_area: Optional[Dict[str, int]] = None


class ParseGridScheduleResponse(BaseModel):
    mode: str = "grid_schedule"
    blocks: List[ScheduleBlock]
    debug: Optional[DebugInfo] = None
    warnings: List[str] = []
