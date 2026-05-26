import os
import logging
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel

logger = logging.getLogger(__name__)

app = FastAPI(title="RoadWatch AI Microservice")

# Trained RDD weights (YOLOv8m on RDD2022)
DEFAULT_MODEL_PATH = os.environ.get(
    "MODEL_PATH",
    "model/rrd_baseline/rdd_baseline/run1/weights/best.pt",
)
FALLBACK_MODEL_PATH = os.environ.get("FALLBACK_MODEL_PATH", "model/yolov8m.pt")
CONF_THRESHOLD = float(os.environ.get("AI_CONF_THRESHOLD", "0.25"))

# Map dataset class names -> backend DecisionEngine labels
LABEL_MAP = {
    "pothole": "pothole",
    "longitudinal crack": "crack",
    "transverse crack": "crack",
    "alligator crack": "crack",
    "other corruption": "surface_damage",
    "broken_divider": "broken_divider",
    "street_lighting": "street_lighting",
    # Extended civic-tech labels (RoadWatch national governance)
    "waterlogging": "waterlogging",
    "water logging": "waterlogging",
    "flooded": "waterlogging",
    "lane_damage": "lane_damage",
    "lane damage": "lane_damage",
    "lane marking": "lane_damage",
    "faded lane": "lane_damage",
    "debris": "debris",
    "obstruction": "debris",
    "road obstruction": "debris",
}

_model = None


def _resolve_model_path() -> str:
    candidates = [DEFAULT_MODEL_PATH, FALLBACK_MODEL_PATH, "model/best.pt"]
    for path in candidates:
        if path and os.path.isfile(path):
            return path
    raise FileNotFoundError(
        f"No YOLO weights found. Tried: {candidates}. "
        "Place best.pt under ai_service/model/ or set MODEL_PATH."
    )


def get_model():
    global _model
    if _model is None:
        from ultralytics import YOLO

        path = _resolve_model_path()
        logger.info("Loading YOLO model from %s", path)
        _model = YOLO(path)
    return _model


class BoundingBox(BaseModel):
    xMin: float
    yMin: float
    xMax: float
    yMax: float


class DetectionResult(BaseModel):
    label: str
    confidence: float
    bbox: BoundingBox
    rawLabel: Optional[str] = None


class AnalysisResponse(BaseModel):
    success: bool
    detections: List[DetectionResult]
    message: Optional[str] = None


def _normalize_label(raw: str) -> str:
    key = (raw or "").strip().lower()
    return LABEL_MAP.get(key, LABEL_MAP.get(raw, "surface_damage"))


def _run_inference(image_bytes: bytes) -> AnalysisResponse:
    import tempfile

    model = get_model()
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp.write(image_bytes)
        tmp_path = tmp.name

    try:
        results = model.predict(
            source=tmp_path,
            conf=CONF_THRESHOLD,
            verbose=False,
        )
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

    detections: List[DetectionResult] = []
    if not results:
        return AnalysisResponse(success=True, detections=[], message="No results")

    result = results[0]
    names = result.names or {}
    boxes = result.boxes

    if boxes is None or len(boxes) == 0:
        return AnalysisResponse(success=True, detections=[], message="No defects detected")

    for box in boxes:
        cls_id = int(box.cls[0])
        raw_label = names.get(cls_id, str(cls_id))
        conf = float(box.conf[0])
        xyxy = box.xyxy[0].tolist()
        detections.append(
            DetectionResult(
                label=_normalize_label(raw_label),
                rawLabel=raw_label,
                confidence=round(conf, 4),
                bbox=BoundingBox(
                    xMin=xyxy[0],
                    yMin=xyxy[1],
                    xMax=xyxy[2],
                    yMax=xyxy[3],
                ),
            )
        )

    detections.sort(key=lambda d: d.confidence, reverse=True)
    return AnalysisResponse(success=True, detections=detections)


async def _read_upload(image: UploadFile) -> bytes:
    data = await image.read()
    if not data:
        raise ValueError("Empty image upload")
    return data


@app.on_event("startup")
async def startup():
    try:
        get_model()
        logger.info("YOLO model ready")
    except Exception as e:
        logger.error("Model load failed at startup: %s", e)


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(image: UploadFile = File(...)):
    try:
        data = await _read_upload(image)
        return _run_inference(data)
    except Exception as e:
        logger.exception("Inference failed")
        return AnalysisResponse(success=False, detections=[], message=str(e))


@app.post("/analyze_surface", response_model=AnalysisResponse)
async def analyze_surface(image: UploadFile = File(...)):
    return await analyze(image)


@app.post("/analyze_infrastructure", response_model=AnalysisResponse)
async def analyze_infrastructure(image: UploadFile = File(...)):
    return await analyze(image)


@app.get("/health")
def health_check():
    model_ok = False
    model_path = None
    try:
        model_path = _resolve_model_path()
        model_ok = os.path.isfile(model_path)
    except FileNotFoundError:
        pass
    return {
        "status": "healthy",
        "model_loaded": _model is not None,
        "model_path": model_path,
        "model_exists": model_ok,
    }
