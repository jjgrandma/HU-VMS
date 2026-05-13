"""
HU-VMS ALPR Microservice
Automatic License Plate Recognition using YOLOv8 + EasyOCR
Runs on port 5001 — completely independent from the main Node.js server
"""

import sys

try:
    from flask import Flask, request, jsonify
except ImportError as e:
    print(f"[ERROR] Flask not installed: {e}")
    print("[ERROR] Install with: pip install flask")
    sys.exit(1)

try:
    from flask_cors import CORS
except ImportError:
    print("[WARNING] flask_cors not installed. Install with: pip install flask-cors")
    def CORS(app):
        pass

import cv2
import numpy as np
import easyocr
import base64
import re
import os
import threading
import time
import urllib.request

app = Flask(__name__)
CORS(app)

# ── Initialize EasyOCR ──────────────────────────────────────
print("[ALPR] Loading EasyOCR...")
reader = easyocr.Reader(['en'], gpu=False, verbose=False)
print("[ALPR] EasyOCR ready.")

# ── Try to load YOLOv8 ─────────────────────────────────────
yolo_model = None
try:
    from ultralytics import YOLO
    # Priority: 1) locally trained plate model, 2) yolov8n pretrained
    model_paths = [
        'best.pt',                    # trained model from notebook output
        'license_plate_detector.pt',  # common name
        'runs/detect/train/weights/best.pt',  # default YOLO output path
        'yolov8n.pt',                 # fallback: general YOLOv8 nano
    ]
    for path in model_paths:
        if os.path.exists(path):
            yolo_model = YOLO(path)
            print(f"[ALPR] YOLOv8 loaded from: {path}")
            break
    if yolo_model is None:
        # Auto-download yolov8n as fallback
        yolo_model = YOLO('yolov8n.pt')
        print("[ALPR] YOLOv8n downloaded and loaded (fallback).")
except Exception as e:
    print(f"[ALPR] YOLOv8 not available ({e}), using EasyOCR only.")

# ── External camera stream ──────────────────────────────────
ext_stream = {'url': None, 'active': False, 'last_frame': None}
stream_thread = None


def clean_plate(text):
    """Normalize plate text — remove noise, keep alphanumeric and dash."""
    text = text.upper().strip()
    text = re.sub(r'[^A-Z0-9\-]', '', text)
    # Ethiopian plate patterns: AA-12345, HU-2456, etc.
    return text


def detect_plate_yolo(img_bgr):
    """Use YOLOv8 to detect license plate region, then OCR."""
    if yolo_model is None:
        return None, img_bgr  # fallback

    results = yolo_model(img_bgr, verbose=False)
    best_crop = None
    best_conf = 0

    for r in results:
        for box in r.boxes:
            # Class 2 = car, but we want any detected region
            conf = float(box.conf[0])
            if conf < 0.3:
                continue
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            # Crop region
            crop = img_bgr[y1:y2, x1:x2]
            if crop.size == 0:
                continue
            # Prefer wide, short crops (plate-like aspect ratio)
            h, w = crop.shape[:2]
            if w > 0 and h > 0 and (w / h) > 1.5 and conf > best_conf:
                best_conf = conf
                best_crop = crop

    return best_crop, img_bgr


def preprocess_for_ocr(img_bgr):
    """Enhance image for better OCR accuracy."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    # Upscale small images
    h, w = gray.shape
    if w < 200:
        scale = 200 / w
        gray = cv2.resize(gray, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)
    # Contrast enhancement
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    # Threshold
    _, thresh = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)


def run_ocr(img_bgr):
    """Run EasyOCR on image, return best plate candidates."""
    results = reader.readtext(img_bgr)
    candidates = []
    for (bbox, text, conf) in results:
        cleaned = clean_plate(text)
        if len(cleaned) >= 3 and conf > 0.25:
            candidates.append({'text': cleaned, 'confidence': round(conf, 3)})
    candidates.sort(key=lambda x: x['confidence'], reverse=True)
    return candidates


def decode_base64_image(b64_str):
    """Decode base64 image to OpenCV BGR array."""
    if ',' in b64_str:
        b64_str = b64_str.split(',')[1]
    img_bytes = base64.b64decode(b64_str)
    img_array = np.frombuffer(img_bytes, dtype=np.uint8)
    return cv2.imdecode(img_array, cv2.IMREAD_COLOR)


def fetch_stream_frames():
    """Background thread for external IP camera."""
    while ext_stream['active']:
        try:
            resp = urllib.request.urlopen(ext_stream['url'], timeout=5)
            img_array = np.asarray(bytearray(resp.read()), dtype=np.uint8)
            frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            if frame is not None:
                ext_stream['last_frame'] = frame
        except Exception as e:
            print(f"[ALPR] Stream error: {e}")
        time.sleep(0.5)


# ── Routes ──────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'HU-VMS ALPR',
        'yolo': yolo_model is not None,
        'ocr': True,
    })


@app.route('/detect-plate', methods=['POST'])
def detect_plate():
    """
    Main ALPR endpoint.
    Accepts: { "image": "data:image/jpeg;base64,..." }
    Returns: { "plate": "HU-2456", "confidence": 0.92, "candidates": [...] }
    """
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400

        img = decode_base64_image(data['image'])
        if img is None:
            return jsonify({'error': 'Invalid image data'}), 400

        # Step 1: Try YOLO plate detection
        plate_crop, full_img = detect_plate_yolo(img)

        # Step 2: OCR on cropped plate (or full image if no crop)
        target = plate_crop if plate_crop is not None else full_img
        processed = preprocess_for_ocr(target)
        candidates = run_ocr(processed)

        # Step 3: If no results on crop, try full image
        if not candidates and plate_crop is not None:
            processed_full = preprocess_for_ocr(full_img)
            candidates = run_ocr(processed_full)

        best = candidates[0]['text'] if candidates else None

        return jsonify({
            'success': True,
            'plate': best,
            'confidence': candidates[0]['confidence'] if candidates else 0,
            'candidates': candidates[:5],
            'yolo_used': yolo_model is not None and plate_crop is not None,
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/detect', methods=['POST'])
def detect_legacy():
    """Legacy endpoint — same as /detect-plate for backward compatibility."""
    return detect_plate()


@app.route('/stream/connect', methods=['POST'])
def connect_stream():
    global stream_thread
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({'error': 'URL required'}), 400
    ext_stream['url'] = url
    ext_stream['active'] = True
    if stream_thread is None or not stream_thread.is_alive():
        stream_thread = threading.Thread(target=fetch_stream_frames, daemon=True)
        stream_thread.start()
    return jsonify({'success': True, 'message': f'Connected to {url}'})


@app.route('/stream/disconnect', methods=['POST'])
def disconnect_stream():
    ext_stream['active'] = False
    ext_stream['url'] = None
    ext_stream['last_frame'] = None
    return jsonify({'success': True})


@app.route('/stream/detect', methods=['GET'])
def detect_from_stream():
    frame = ext_stream.get('last_frame')
    if frame is None:
        return jsonify({'error': 'No frame from stream'}), 404
    processed = preprocess_for_ocr(frame)
    candidates = run_ocr(processed)
    return jsonify({
        'success': True,
        'plate': candidates[0]['text'] if candidates else None,
        'confidence': candidates[0]['confidence'] if candidates else 0,
        'candidates': candidates[:5],
    })


if __name__ == '__main__':
    print("[ALPR] Starting HU-VMS ALPR service on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=False, threaded=True)
