"""
EcoSort AI — Backend Configuration
Central settings for the FastAPI + YOLOv8 waste classification service.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# --- Model ---
MODEL_PATH = os.getenv("MODEL_PATH", str(BASE_DIR.parent / "models" / "yolov8n-waste.pt"))
CONFIDENCE_THRESHOLD = float(os.getenv("CONF_THRESHOLD", "0.4"))
NMS_THRESHOLD = float(os.getenv("NMS_THRESHOLD", "0.45"))
INPUT_SIZE = int(os.getenv("MODEL_INPUT_SIZE", "640"))

# Waste categories (must match the frontend category keys)
CATEGORIES = [
    "plastic", "paper", "cardboard", "glass",
    "metal", "organic", "ewaste", "other",
]

# CO2 savings factor per kg recycled (kg CO2 / kg material)
CO2_FACTORS = {
    "plastic": 1.5, "paper": 1.3, "cardboard": 1.1, "glass": 0.9,
    "metal": 4.0, "organic": 0.4, "ewaste": 2.7, "other": 0.0,
}
RECYCLABLE = {"plastic", "paper", "cardboard", "glass", "metal", "organic", "ewaste"}

# --- API ---
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# --- Uploads ---
UPLOAD_DIR = BASE_DIR.parent / "uploads"
OUTPUT_DIR = BASE_DIR.parent / "outputs"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "100"))

# --- JWT (placeholder for standalone auth) ---
JWT_SECRET = os.getenv("JWT_SECRET", "ecosort-dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "24"))
