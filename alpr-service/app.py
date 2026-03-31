from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import easyocr
import base64
import re
import urllib.request
import threading
import time

app = Flask(__name__)
CORS(app)

# Initialize EasyOCR reader (English)
reader = easyocr.Reader(['en'], gpu=False)

# External camera stream state
external_stream = {'url': None, 'active': False, 'last_frame': None}
stream_thread = None


def clean_plate(text):
    """Clean and normalize plate number text."""
    text = text.upper().strip()
    # Remove common OCR noise characters
    text = re.sub(r'[^A-Z0-9\-]', '', text)
    # Ethiopian plate format: AA-12345 or similar
    return text


def detect_plate_from_image(img_array):
    """Run OCR on image and extract plate number."""
    results = reader.readtext(img_array)
    candidates = []
    for (bbox, text, confidence) in results:
        cleaned = clean_plate(text)
        if len(cleaned) >= 4 and confidence > 0.3:
            candidates.append({'text': cleaned, 'confidence': round(confidence, 3)})
    # Sort by confidence
    candidates.sort(key=lambda x: x['confidence'], reverse=True)
    return candidates


def fetch_external_stream():
    """Background thread to fetch frames from external IP camera."""
    while external_stream['active']:
        try:
            url = external_stream['url']
            if not url:
                time.sleep(1)
                continue
            # Support MJPEG stream or snapshot URL
            resp = urllib.request.urlopen(url, timeout=5)
            img_array = np.asarray(bytearray(resp.read()), dtype=np.uint8)
            frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            if frame is not None:
                external_stream['last_frame'] = frame
        except Exception as e:
            print(f'Stream error: {e}')
        time.sleep(0.5)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'ALPR'})


@app.route('/detect', methods=['POST'])
def detect():
    """
    Detect plate from base64 image.
    Body: { "image": "data:image/jpeg;base64,..." }
    """
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400

        # Decode base64 image
        img_data = data['image']
        if ',' in img_data:
            img_data = img_data.split(',')[1]

        img_bytes = base64.b64decode(img_data)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({'error': 'Invalid image'}), 400

        # Preprocess: grayscale + contrast enhancement
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        enhanced = cv2.equalizeHist(gray)
        img_processed = cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)

        candidates = detect_plate_from_image(img_processed)

        if not candidates:
            # Try original image
            candidates = detect_plate_from_image(img)

        return jsonify({
            'success': True,
            'candidates': candidates,
            'best': candidates[0]['text'] if candidates else None,
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/stream/connect', methods=['POST'])
def connect_stream():
    """Connect to external IP camera stream."""
    global stream_thread
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({'error': 'URL required'}), 400

    external_stream['url'] = url
    external_stream['active'] = True

    if stream_thread is None or not stream_thread.is_alive():
        stream_thread = threading.Thread(target=fetch_external_stream, daemon=True)
        stream_thread.start()

    return jsonify({'success': True, 'message': f'Connected to {url}'})


@app.route('/stream/disconnect', methods=['POST'])
def disconnect_stream():
    """Disconnect external stream."""
    external_stream['active'] = False
    external_stream['url'] = None
    external_stream['last_frame'] = None
    return jsonify({'success': True, 'message': 'Disconnected'})


@app.route('/stream/detect', methods=['GET'])
def detect_from_stream():
    """Detect plate from latest external stream frame."""
    frame = external_stream.get('last_frame')
    if frame is None:
        return jsonify({'error': 'No frame available from stream'}), 404

    candidates = detect_plate_from_image(frame)
    return jsonify({
        'success': True,
        'candidates': candidates,
        'best': candidates[0]['text'] if candidates else None,
    })


if __name__ == '__main__':
    print('Starting ALPR service on port 5001...')
    app.run(host='0.0.0.0', port=5001, debug=False)
