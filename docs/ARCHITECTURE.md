# EcoSort AI — Documentation

## Architecture Overview

```
EcoSort AI
├── frontend/          React + TypeScript + Tailwind CSS (this repo root)
├── backend/           Python FastAPI + YOLOv8 inference service
├── models/            YOLOv8 .pt model weights
├── uploads/           Temporary uploaded files (auto-created)
├── outputs/           Annotated detection outputs (auto-created)
├── assets/            Static assets and brand graphics
└── docs/              This documentation
```

## Frontend (live in this environment)

- **Stack**: React 18, TypeScript, Vite, Tailwind CSS, react-router-dom
- **Auth**: Supabase email/password authentication
- **Database**: Supabase Postgres with row-level security
- **Inference**: Client-side color-spatial analysis engine (real bounding boxes +
  confidence scores from actual pixel data) — see `src/lib/inference.ts`
- **Pages**: Landing, Login, Register, Forgot Password, Dashboard, Live
  Detection, Image Upload, Video Upload, History, Analytics, Sustainability
  Report, Profile, Settings

## Backend (reference implementation)

- **Stack**: Python, FastAPI, OpenCV, Ultralytics YOLOv8
- **Endpoints**:
  | Method | Path | Description |
  |--------|------|-------------|
  | GET | `/` | Health check |
  | GET | `/health` | Service + model status |
  | GET | `/categories` | Supported waste categories |
  | POST | `/api/v1/detect/image` | Detect on uploaded image → JSON + annotated URL |
  | POST | `/api/v1/detect/image/annotated` | Detect → return annotated JPEG directly |
  | POST | `/api/v1/detect/video` | Process uploaded video → annotated video URL |
  | WS | `/ws/detect/stream` | Live webcam frame stream → per-frame detections |
  | POST | `/api/v1/impact` | CO₂ + recycled kg estimate for a detection |

## Connecting frontend to backend

The frontend ships with a built-in inference engine so it works standalone.
To use the YOLOv8 backend instead, replace the calls in
`src/lib/inference.ts` with `fetch` calls to the API endpoints above.

## Database schema

- `profiles` — user display name, organization, avatar (linked to auth.users)
- `detections` — per-user detection records (category, confidence, source,
  bounding boxes, timestamp) with owner-scoped RLS policies
