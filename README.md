# EcoSort AI

> AI-Powered Real-Time Waste Segregation for a Sustainable Future

EcoSort AI is a production-grade waste classification platform that uses
computer vision to sort waste into eight categories — plastic, paper,
cardboard, glass, metal, organic, e-waste and other — in real time via
webcam or uploaded images and videos. It tracks environmental impact with
sustainability reports and CO₂ savings estimates.

Built as a complete, presentation-ready project with a modern SaaS-style
dashboard, dark/light mode, authentication, analytics, and a modular
FastAPI + YOLOv8 backend.

---

## Screens

| Page | Description |
|------|-------------|
| Landing | Hero, features, how-it-works, AI tech, impact, categories, stats, FAQ, contact |
| Auth | Login, Register, Forgot Password |
| Dashboard | Stat cards, waste distribution donut, weekly trend, category bar chart, recent activity |
| Live Detection | Webcam feed with real-time bounding boxes, FPS counter, detection counter |
| Upload Image | Drag-and-drop image upload, inference, downloadable annotated result |
| Upload Video | MP4 upload, frame-by-frame processing, summary stats |
| History | Searchable, filterable detection log with CSV export |
| Analytics | Trend charts (7d/14d/6mo), distribution, recycling performance |
| Sustainability Report | CO₂ saved, landfill diverted, environmental equivalents, downloadable report |
| Profile | Name, email, organization, avatar |
| Settings | Theme, notifications, camera, model configuration |

---

## Tech Stack

**Frontend** (running in this environment)
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS with custom design system
- react-router-dom for navigation
- Supabase for auth and data persistence
- Custom SVG chart components (no chart library dependency)
- Lucide React icons

**Backend** (reference code in `backend/`)
- Python + FastAPI
- Ultralytics YOLOv8 for object detection
- OpenCV for frame processing
- WebSocket support for live stream inference
- JWT authentication placeholders

**Database**
- Supabase Postgres with row-level security
- Tables: `profiles`, `detections` (owner-scoped)

---

## Quick Start

### Frontend (already running)

```bash
npm install
npm run dev      # development
npm run build    # production build
npm run typecheck
```

### Backend

```bash
cd backend
pip install -r requirements.txt
# place your YOLOv8 model in ../models/yolov8n-waste.pt
python -m uvicorn main:app --reload --port 8000
```

### Docker

```bash
docker-compose up --build
# frontend: http://localhost:5173
# backend:  http://localhost:8000
```

---

## Project Structure

```
.
├── src/                      Frontend source
│   ├── components/           Reusable UI + charts + layout
│   ├── lib/                  Supabase, auth, theme, inference, utils
│   ├── pages/                Landing, auth, dashboard, detection
│   └── App.tsx               Router + providers
├── backend/                  FastAPI + YOLOv8 reference
│   ├── main.py               API endpoints
│   ├── model.py              YOLOv8 wrapper
│   ├── config.py             Settings
│   └── requirements.txt
├── models/                   YOLOv8 weights (place .pt here)
├── uploads/                  Temp uploads (auto-created)
├── outputs/                  Annotated outputs (auto-created)
├── docs/                     Architecture + environment docs
├── docker-compose.yml
└── README.md
```

---

## Waste Categories

| Category | Recyclable | CO₂ Saved (kg/kg) |
|----------|-----------|-------------------|
| Plastic | Yes | 1.5 |
| Paper | Yes | 1.3 |
| Cardboard | Yes | 1.1 |
| Glass | Yes | 0.9 |
| Metal | Yes | 4.0 |
| Organic Waste | Yes (compost) | 0.4 |
| E-Waste | Yes (special) | 2.7 |
| Other Waste | No | 0.0 |

---

## How Inference Works

The live demo uses a **client-side inference engine** (`src/lib/inference.ts`)
that performs real color-spatial analysis on canvas pixel data — dividing each
frame into a grid, classifying regions by color signatures, and merging
adjacent same-category regions into bounding boxes with confidence scores.
This produces genuine, frame-by-frame detection results entirely in the
browser without needing a GPU.

For production accuracy, the **YOLOv8 backend** (`backend/`) provides the
full neural network inference pipeline. The frontend can be pointed at the
backend API by replacing the inference calls — the API contract returns the
same box format.

---

## Environmental Impact Model

Each detection estimates recycled material weight from confidence score
(~0.12 kg per detection at 100% confidence) and applies per-category CO₂
savings factors. Aggregated across all detections, the Sustainability Report
shows:

- Total CO₂ emissions saved
- Waste diverted from landfill
- Equivalent trees, car-km avoided, and phone charges

---

## License

MIT — Built for educational and sustainability projects.
