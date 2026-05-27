import logging
import os
import sys
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Logging — configured up-front so startup logs are guaranteed to surface in
# uvicorn / Docker / HuggingFace Space stdout. Uses the same format uvicorn
# itself uses so output stays consistent.
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout,
    force=True,
)
logger = logging.getLogger("roadwatch.ai")

app = FastAPI(title="RoadWatch AI Microservice")

# ---------------------------------------------------------------------------
# Model path — single source of truth.
#
# The trained RDD2022 YOLOv8m weights MUST be packaged into the image at
# this path. There is intentionally NO fallback to a generic yolov8m.pt /
# yolo11n.pt — if the trained file is missing, the service must fail loudly
# at startup so the deployment is never silently serving generic detections.
# ---------------------------------------------------------------------------
DEFAULT_MODEL_PATH = os.environ.get(
    "MODEL_PATH",
    "model/rrd_baseline/weights/best.pt",
)
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
_loaded_model_path: Optional[str] = None
_loaded_model_classes: dict = {}


def _resolve_model_path() -> str:
    """Return the absolute path to the trained weights, or raise.

    No fallback. No auto-download. If the file is not present, the deployment
    is broken and must fail fast.
    """
    if not DEFAULT_MODEL_PATH:
        raise FileNotFoundError(
            "MODEL_PATH is empty. Set it to the trained road-damage weights file."
        )

    abs_path = os.path.abspath(DEFAULT_MODEL_PATH)
    if not os.path.isfile(abs_path):
        raise FileNotFoundError(
            f"Trained YOLO weights not found at '{abs_path}'. "
            "The road-damage best.pt must be baked into the image at "
            "model/rrd_baseline/weights/best.pt. Refusing to start to avoid "
            "silent fallback to a generic model."
        )
    return abs_path


def get_model():
    global _model, _loaded_model_path, _loaded_model_classes
    if _model is None:
        from ultralytics import YOLO

        path = _resolve_model_path()
        size_mb = os.path.getsize(path) / (1024 * 1024)
        logger.info("Loading YOLO model")
        logger.info("  model_path = %s", path)
        logger.info("  model_size = %.2f MB", size_mb)

        _model = YOLO(path)
        _loaded_model_path = path
        _loaded_model_classes = dict(getattr(_model, "names", {}) or {})

        logger.info("Model loaded successfully")
        logger.info("  num_classes = %d", len(_loaded_model_classes))
        logger.info("  class_names = %s", _loaded_model_classes)
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
    logger.info("=" * 60)
    logger.info("RoadWatch AI service starting")
    logger.info("  configured MODEL_PATH = %s", DEFAULT_MODEL_PATH)
    logger.info("  conf_threshold        = %s", CONF_THRESHOLD)
    logger.info("=" * 60)
    try:
        get_model()
        logger.info("YOLO model ready — service is serving trained RDD weights.")
    except Exception:
        logger.exception(
            "FATAL: model load failed at startup. "
            "Refusing to serve traffic with a missing/invalid model."
        )
        raise


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
    model_path = _loaded_model_path or DEFAULT_MODEL_PATH
    try:
        model_exists = os.path.isfile(model_path)
    except (TypeError, ValueError):
        model_exists = False
    return {
        "status": "healthy",
        "model_loaded": _model is not None,
        "model_path": model_path,
        "model_exists": model_exists,
        "class_names": _loaded_model_classes,
    }
