# Environment Variables

## Frontend (.env)

These are pre-populated in the hosted environment and local `.env`:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

## Backend (backend/.env) — for standalone deployment

```
# Model
MODEL_PATH=models/yolov8n-waste.pt
CONF_THRESHOLD=0.4
NMS_THRESHOLD=0.45
MODEL_INPUT_SIZE=640

# API
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173

# Uploads
MAX_UPLOAD_MB=100

# JWT (placeholder)
JWT_SECRET=change-this-in-production
JWT_EXPIRY_HOURS=24
```
