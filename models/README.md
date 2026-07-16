# YOLOv8 Waste Detection Models

Place your trained YOLOv8 model files in this directory.

## Default model

```
yolov8n-waste.pt   (nano — fastest, recommended for real-time webcam)
```

## Training your own model

1. Collect a waste image dataset labeled with 8 classes:
   plastic, paper, cardboard, glass, metal, organic, ewaste, other

2. Convert to YOLO format and create a `data.yaml`:
   ```yaml
   path: ./dataset
   train: images/train
   val: images/val
   nc: 8
   names: ['plastic','paper','cardboard','glass','metal','organic','ewaste','other']
   ```

3. Train:
   ```bash
   yolo detect model=yolov8n.pt data=data.yaml epochs=100 imgsz=640
   ```

4. Copy the resulting `best.pt` to this folder as `yolov8n-waste.pt`.

## Swapping models

Update `MODEL_PATH` in `backend/config.py` or set the `MODEL_PATH`
environment variable to point to your new `.pt` file. No frontend changes
needed — the API contract stays the same.

## Public waste datasets

- **TrashNet**: 2,527 images across 6 classes (kaggle.com/asdasdasasdas/garbage-classification)
- **Waste Classification**: (github.com/garythung/trashnet)
- **TACO Trash Annotations in Context**: (github.com/pedropro/TACO)
