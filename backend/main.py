"""
EcoSort AI — FastAPI Application
REST API for waste detection: image, video, and live webcam stream inference.
"""
import io
import time
import uuid
from pathlib import Path

import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from config import (
    API_HOST, API_PORT, CORS_ORIGINS, UPLOAD_DIR, OUTPUT_DIR,
    MAX_UPLOAD_MB, CO2_FACTORS, RECYCLABLE,
)
from model import detector, Detection

app = FastAPI(
    title="EcoSort AI API",
    description="AI-powered real-time waste classification using YOLOv8",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.mount("/outputs", StaticFiles(directory=str(OUTPUT_DIR)), name="outputs")


@app.get("/")
async def root():
    return {"status": "ok", "service": "EcoSort AI API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": detector._model is not None}


@app.get("/categories")
async def categories():
    """Return supported waste categories and metadata."""
    from config import CATEGORIES
    return {
        "categories": [
            {
                "key": c,
                "label": c.capitalize(),
                "recyclable": c in RECYCLABLE,
                "co2_per_kg": CO2_FACTORS.get(c, 0),
            }
            for c in CATEGORIES
        ]
    }


def _read_image(file: UploadFile) -> np.ndarray:
    data = file.file.read()
    if len(data) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(413, f"File exceeds {MAX_UPLOAD_MB}MB limit")
    arr = np.frombuffer(data, np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(400, "Could not decode image")
    return frame


@app.post("/api/v1/detect/image")
async def detect_image(file: UploadFile = File(...)):
    """Run waste detection on an uploaded image. Returns JSON + annotated image."""
    frame = _read_image(file)
    detections = detector.predict(frame)
    annotated = detector.draw_boxes(frame.copy(), detections)

    # save annotated output
    out_name = f"{uuid.uuid4().hex}.jpg"
    out_path = OUTPUT_DIR / out_name
    cv2.imwrite(str(out_path), annotated)

    primary = max(detections, key=lambda d: d.confidence) if detections else None
    return {
        "detections": [d.to_dict() for d in detections],
        "total": len(detections),
        "primary_category": primary.category if primary else "other",
        "primary_confidence": primary.confidence if primary else 0,
        "annotated_image_url": f"/outputs/{out_name}",
    }


@app.post("/api/v1/detect/image/annotated")
async def detect_image_annotated(file: UploadFile = File(...)):
    """Run detection and return the annotated image directly."""
    frame = _read_image(file)
    detections = detector.predict(frame)
    annotated = detector.draw_boxes(frame.copy(), detections)
    _, buf = cv2.imencode(".jpg", annotated)
    return StreamingResponse(io.BytesIO(buf.tobytes()), media_type="image/jpeg")


@app.post("/api/v1/detect/video")
async def detect_video(file: UploadFile = File(...)):
    """Process an uploaded video frame-by-frame. Returns annotated video URL."""
    data = file.file.read()
    if len(data) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(413, f"File exceeds {MAX_UPLOAD_MB}MB limit")

    in_path = UPLOAD_DIR / f"{uuid.uuid4().hex}.mp4"
    with open(in_path, "wb") as f:
        f.write(data)

    out_name = f"{uuid.uuid4().hex}.mp4"
    out_path = OUTPUT_DIR / out_name

    cap = cv2.VideoCapture(str(in_path))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 640)
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 480)
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(str(out_path), fourcc, fps, (w, h))

    all_detections = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        dets = detector.predict(frame)
        all_detections.extend(dets)
        annotated = detector.draw_boxes(frame, dets)
        writer.write(annotated)

    cap.release()
    writer.release()
    in_path.unlink(missing_ok=True)

    counts: dict[str, int] = {}
    for d in all_detections:
        counts[d.category] = counts.get(d.category, 0) + 1

    return {
        "total_frames_processed": True,
        "total_detections": len(all_detections),
        "category_counts": counts,
        "output_video_url": f"/outputs/{out_name}",
    }


@app.websocket("/ws/detect/stream")
async def detect_stream(ws: WebSocket):
    """WebSocket endpoint for live webcam frame-by-frame detection.
    Client sends JPEG frames; server returns JSON detections per frame.
    """
    await ws.accept()
    try:
        while True:
            data = await ws.receive_bytes()
            arr = np.frombuffer(data, np.uint8)
            frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if frame is None:
                continue
            t0 = time.time()
            dets = detector.predict(frame)
            fps = 1.0 / max(time.time() - t0, 0.001)
            await ws.send_json({
                "detections": [d.to_dict() for d in dets],
                "total": len(dets),
                "fps": round(fps, 1),
                "timestamp": time.time(),
            })
    except Exception:
        pass


def impact_estimate(category: str, confidence: float) -> dict:
    """Estimate recycled kg and CO2 savings for a detection."""
    kg = 0.12 * confidence
    co2 = kg * CO2_FACTORS.get(category, 0)
    return {"estimated_kg": round(kg, 3), "co2_saved_kg": round(co2, 3)}


@app.post("/api/v1/impact")
async def impact(category: str, confidence: float):
    return impact_estimate(category, confidence)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=API_HOST, port=API_PORT)
