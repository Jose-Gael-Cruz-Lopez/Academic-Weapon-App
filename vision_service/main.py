"""
FastAPI service for grid schedule parsing
"""
from fastapi import FastAPI, File, UploadFile, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from typing import Optional
import uvicorn
from parser import parse_grid_schedule
from schemas import ParseGridScheduleResponse

app = FastAPI(title="Grid Schedule Parser", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=400,
        content={
            "mode": "grid_schedule",
            "blocks": [],
            "debug": None,
            "warnings": [f"Request validation error: {str(exc.errors())}"]
        }
    )


@app.get("/")
async def root():
    return {"message": "Grid Schedule Parser Service", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/parse-grid-schedule")
async def parse_grid_schedule_endpoint(
    file: UploadFile = File(...),
    debug: Optional[bool] = Query(False, description="Include debug overlay image")
):
    """
    Parse a weekly grid schedule image and extract schedule blocks.
    
    - **file**: Image file (PNG, JPG, etc.)
    - **debug**: If true, include debug overlay image in response
    """
    try:
        print(f"Received file upload: filename={file.filename}, content_type={file.content_type}")
        
        # Read file bytes
        image_bytes = await file.read()
        
        print(f"Read {len(image_bytes)} bytes from file")
        
        if not image_bytes or len(image_bytes) == 0:
            return {
                "mode": "grid_schedule",
                "blocks": [],
                "debug": None,
                "warnings": ["Empty file received"]
            }
        
        # Parse grid schedule
        result = parse_grid_schedule(image_bytes, debug=debug)
        
        # Convert blocks to ScheduleBlock models (Pydantic will validate)
        from schemas import ScheduleBlock, DebugInfo
        validated_blocks = []
        for block in result['blocks']:
            try:
                validated_blocks.append(ScheduleBlock(**block))
            except Exception as e:
                print(f"Warning: Failed to validate block: {e}")
                print(f"Block data: {block}")
                # Skip invalid blocks but continue processing
        
        validated_debug = None
        if result.get('debug'):
            try:
                validated_debug = DebugInfo(**result['debug'])
            except Exception as e:
                print(f"Warning: Failed to validate debug info: {e}")
        
        response_data = {
            "mode": result['mode'],
            "blocks": [block.dict() for block in validated_blocks],
            "debug": validated_debug.dict() if validated_debug else None,
            "warnings": result.get('warnings', [])
        }
        
        print(f"Returning {len(validated_blocks)} blocks")
        return response_data
    
    except Exception as e:
        import traceback
        error_msg = f"Error parsing grid schedule: {str(e)}"
        print(f"Error: {error_msg}")
        print(traceback.format_exc())
        return {
            "mode": "grid_schedule",
            "blocks": [],
            "debug": None,
            "warnings": [error_msg]
        }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5055, reload=True)
