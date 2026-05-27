FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Install CPU-only torch first so ultralytics doesn't pull in the multi-GB
# CUDA wheels. HuggingFace basic Spaces are CPU-only, and image-size limits
# make the GPU build impractical there.
RUN pip install --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cpu \
    torch==2.2.2 torchvision==0.17.2 && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

# Trained RDD2022 weights — single source of truth.
# The image MUST contain this file. If it does not, the build fails below.
ENV MODEL_PATH=model/rrd_baseline/weights/best.pt
ENV AI_CONF_THRESHOLD=0.25

# ---------------------------------------------------------------------------
# Build-time validation: prove the trained weights are baked into the image.
# Fails the build (non-zero exit) if best.pt is missing or implausibly small,
# so a broken image can never reach HuggingFace / production.
# ---------------------------------------------------------------------------
RUN echo "=== RoadWatch AI build-time model validation ===" && \
    echo "MODEL_PATH=$MODEL_PATH" && \
    if [ ! -f "$MODEL_PATH" ]; then \
        echo "FATAL: $MODEL_PATH is missing from the build context." >&2; \
        echo "Listing model/ tree for diagnostics:" >&2; \
        ls -laR model/ >&2 || true; \
        exit 1; \
    fi && \
    SIZE_BYTES=$(stat -c%s "$MODEL_PATH") && \
    SIZE_MB=$((SIZE_BYTES / 1024 / 1024)) && \
    echo "Model file present: $MODEL_PATH (${SIZE_MB} MB, ${SIZE_BYTES} bytes)" && \
    if [ "$SIZE_BYTES" -lt 1000000 ]; then \
        echo "FATAL: $MODEL_PATH is suspiciously small (${SIZE_BYTES} bytes)." >&2; \
        echo "This usually means Git LFS pointer files were committed instead" >&2; \
        echo "of the real weights. Refusing to build." >&2; \
        exit 1; \
    fi && \
    sha256sum "$MODEL_PATH" && \
    echo "=== Model validation OK ==="

# Make absolutely sure no legacy generic weights are present in the image.
# If they are, ultralytics could pick them up via misconfiguration. Belt &
# suspenders alongside .dockerignore.
RUN rm -f model/yolov8m.pt model/yolo11n.pt model/rrd_baseline/rdd_baseline/run1/weights/last.pt && \
    echo "Legacy weights purged from image."

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
