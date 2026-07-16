"""
EcoSort AI — YOLOv8 Model Wrapper
Provides a clean interface for loading and running inference, with easy
model replacement. Drop a new .pt file into models/ and update MODEL_PATH.
"""
from typing import List
import numpy as np
from config import MODEL_PATH, CONFIDENCE_THRESHOLD, NMS_THRESHOLD, INPUT_SIZE, CATEGORIES

try:
    from ultralytics import YOLO
    _ULTRALYTICS_AVAILABLE = True
except ImportError:
    _ULTRALYTICS_AVAILABLE = False
    YOLO = None  # type: ignore


class Detection:
    """Single detection result."""
    def __init__(self, x: float, y: float, w: float, h: float,
                 label: str, category: str, confidence: float):
        self.x = x          # normalized 0-1
        self.y = y
        self.w = w
        self.h = h
        self.label = label
        self.category = category
        self.confidence = confidence

    def to_dict(self) -> dict:
        return {
            "x": round(self.x, 4), "y": round(self.y, 4),
            "w": round(self.w, 4), "h": round(self.h, 4),
            "label": self.label, "category": self.category,
            "confidence": round(self.confidence, 4),
        }


class WasteDetector:
    """Wraps a YOLOv8 model for waste classification inference."""

    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.conf_threshold = CONFIDENCE_THRESHOLD
        self.nms_threshold = NMS_THRESHOLD
        self.input_size = INPUT_SIZE
        self.categories = CATEGORIES
        self._model = None

    def load(self):
        """Lazy-load the YOLO model on first use."""
        if self._model is None:
            if not _ULTRALYTICS_AVAILABLE:
                raise RuntimeError(
                    "ultralytics is not installed. Run: pip install ultralytics"
                )
            self._model = YOLO(self.model_path)
        return self._model

    def predict(self, frame: np.ndarray) -> List[Detection]:
        """Run inference on a single BGR frame and return detections."""
        model = self.load()
        results = model(
            frame, conf=self.conf_threshold, iou=self.nms_threshold,
            imgsz=self.input_size, verbose=False,
        )
        return self._parse_results(results[0], frame.shape)

    def _parse_results(self, result, frame_shape) -> List[Detection]:
        h, w = frame_shape[:2]
        detections = []
        if result.boxes is None:
            return detections

        for box in result.boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            label = self.categories[cls_id] if cls_id < len(self.categories) else "other"
            detections.append(Detection(
                x=x1 / w, y=y1 / h,
                w=(x2 - x1) / w, h=(y2 - y1) / h,
                label=label.capitalize(),
                category=label,
                confidence=conf,
            ))
        return detections

    def draw_boxes(self, frame: np.ndarray, detections: List[Detection]) -> np.ndarray:
        """Draw bounding boxes on the frame using OpenCV."""
        import cv2
        h, w = frame.shape[:2]
        for det in detections:
            x1, y1 = int(det.x * w), int(det.y * h)
            x2, y2 = int((det.x + det.w) * w), int((det.y + det.h) * h)
            color = (0, 255, 0)
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            label = f"{det.label} {det.confidence:.0%}"
            cv2.rectangle(frame, (x1, y1 - 24), (x1 + len(label) * 10, y1), color, -1)
            cv2.putText(frame, label, (x1 + 4, y1 - 6),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        return frame


# Singleton instance
detector = WasteDetector()
