# ALPR Microservice

## Setup
```bash
cd alpr-service
pip install -r requirements.txt
python app.py
```

## Runs on: http://localhost:5001

## Endpoints
- GET  /health              — health check
- POST /detect              — detect plate from base64 image
- POST /stream/connect      — connect to external IP camera
- POST /stream/disconnect   — disconnect stream
- GET  /stream/detect       — detect from latest stream frame

## External Camera
Supports any IP camera that provides:
- MJPEG snapshot URL: http://192.168.x.x/snapshot.jpg
- RTSP stream (via snapshot endpoint)
