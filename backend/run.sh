#!/usr/bin/env bash
# EcoSort AI Backend — startup script
set -e
cd "$(dirname "$0")"
pip install -r requirements.txt
echo "Starting EcoSort AI backend on https://ai-waste-detection.onrender.com"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
