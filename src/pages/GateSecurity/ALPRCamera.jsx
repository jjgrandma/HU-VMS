import { useState, useEffect, useRef } from 'react';
import './ALPRCamera.css';

const ALPR_SERVICE = 'http://localhost:5001';
const BASE_URL     = 'http://localhost:5000/api';
const token        = () => localStorage.getItem('token');
const authHeaders  = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

const ALPRCamera = () => {
  const videoRef            = useRef(null);
  const canvasRef           = useRef(null);
  const streamRef           = useRef(null);
  const [cameraActive, setCameraActive]     = useState(false);
  const [isDetecting, setIsDetecting]       = useState(false);
  const [detectedPlate, setDetectedPlate]   = useState(null);
  const [vehicleInfo, setVehicleInfo]       = useState(null);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [alprOnline, setAlprOnline]         = useState(false);
  const [error, setError]                   = useState('');
  const [actionLoading, setActionLoading]   = useState(false);
  const [toast, setToast]                   = useState(null);

  // Check if ALPR service is running
  useEffect(() => {
    fetch(`${ALPR_SERVICE}/health`)
      .then(r => r.json())
      .then(() => setAlprOnline(true))
      .catch(() => setAlprOnline(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Start webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
      setError('');
    } catch (err) {
      setError('Camera access denied. Please allow camera permission.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCameraActive(false);
    setDetectedPlate(null);
    setVehicleInfo(null);
  };

  // Capture frame from video and send to ALPR service
  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsDetecting(true);
    setError('');

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const base64Image = canvas.toDataURL('image/jpeg', 0.9);

    try {
      // Send to Python ALPR service
      const alprRes = await fetch(`${ALPR_SERVICE}/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });
      const alprData = await alprRes.json();

      if (!alprData.success || !alprData.best) {
        setError('No license plate detected. Try again.');
        setIsDetecting(false);
        return;
      }

      const plate = alprData.best;
      const confidence = alprData.candidates?.[0]?.confidence
        ? `${(alprData.candidates[0].confidence * 100).toFixed(1)}%`
        : 'N/A';

      setDetectedPlate({ plateNumber: plate, confidence });

      // Verify plate against DB
      const verifyRes = await fetch(`${BASE_URL}/security/verify/${plate}`, {
        headers: authHeaders(),
      });
      const verifyData = await verifyRes.json();
      setVehicleInfo(verifyData);

      // Add to history
      setDetectionHistory(prev => [{
        plateNumber: plate,
        confidence,
        time: new Date().toLocaleTimeString(),
        status: verifyData.status,
      }, ...prev].slice(0, 8));

    } catch (err) {
      setError(`Detection failed: ${err.message}`);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleEntry = async () => {
    if (!vehicleInfo) return;
    setActionLoading(true);
    try {
      await fetch(`${BASE_URL}/security/checkin`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          plateNumber:  detectedPlate.plateNumber,
          driverName:   vehicleInfo.driver?.name || vehicleInfo.trip?.assignedDriver || '',
          vehicleModel: vehicleInfo.vehicle?.model || '',
          tripId:       vehicleInfo.trip?._id || null,
          remarks:      `ALPR detected — confidence ${detectedPlate.confidence}`,
        }),
      });
      showToast(`✅ Entry recorded for ${detectedPlate.plateNumber}`);
      setDetectedPlate(null);
      setVehicleInfo(null);
    } catch (err) {
      showToast(`Failed: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExit = async () => {
    if (!detectedPlate) return;
    setActionLoading(true);
    try {
      await fetch(`${BASE_URL}/security/checkout`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          plateNumber: detectedPlate.plateNumber,
          remarks: `ALPR detected — confidence ${detectedPlate.confidence}`,
        }),
      });
      showToast(`✅ Exit recorded for ${detectedPlate.plateNumber}`);
      setDetectedPlate(null);
      setVehicleInfo(null);
    } catch (err) {
      showToast(`Failed: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!detectedPlate) return;
    setActionLoading(true);
    try {
      await fetch(`${BASE_URL}/security/report`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          plateNumber:   detectedPlate.plateNumber,
          description:   `Unauthorized vehicle detected by ALPR`,
          incidentType:  'unauthorized_vehicle',
          severity:      'medium',
        }),
      });
      showToast(`🚨 Unauthorized vehicle reported: ${detectedPlate.plateNumber}`, 'error');
      setDetectedPlate(null);
      setVehicleInfo(null);
    } catch (err) {
      showToast(`Failed: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const statusColor = {
    authorized:   '#22c55e',
    unauthorized: '#ef4444',
    pending:      '#f59e0b',
    'no-trip':    '#f59e0b',
    rejected:     '#ef4444',
    completed:    '#3b82f6',
  };

  return (
    <div className="alpr-camera-page">
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          color: toast.type === 'error' ? '#dc2626' : '#16a34a',
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          {toast.msg}
        </div>
      )}

      <div className="gate-page-header">
        <h2>ALPR Camera Detection</h2>
        <p>Automatic License Plate Recognition — AI-powered gate control</p>
        <span style={{
          display: 'inline-block', marginTop: 6, padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          background: alprOnline ? '#f0fdf4' : '#fef2f2',
          color: alprOnline ? '#16a34a' : '#dc2626',
          border: `1px solid ${alprOnline ? '#bbf7d0' : '#fecaca'}`,
        }}>
          {alprOnline ? '🟢 ALPR Service Online' : '🔴 ALPR Service Offline — start alpr-service/app.py'}
        </span>
      </div>

      <div className="alpr-camera-layout">
        {/* Camera Section */}
        <div className="camera-section">
          <div className="camera-preview-box">
            <video ref={videoRef} autoPlay playsInline muted
              style={{ width: '100%', borderRadius: 8, display: cameraActive ? 'block' : 'none' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {!cameraActive && (
              <div className="camera-placeholder">
                <span className="camera-icon">📷</span>
                <p>Camera not started</p>
                <p className="camera-status">Click "Start Camera" to begin</p>
              </div>
            )}

            {isDetecting && (
              <div className="scanning-animation" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: 8 }}>
                <div className="scan-line"></div>
                <p className="scanning-text" style={{ color: '#fff', marginTop: 12 }}>Scanning for license plates...</p>
              </div>
            )}
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 14px', borderRadius: 8, fontSize: 13, marginTop: 8 }}>
              {error}
            </div>
          )}

          <div className="camera-controls">
            {!cameraActive ? (
              <button className="gate-btn-primary" onClick={startCamera}>▶️ Start Camera</button>
            ) : (
              <>
                <button className="gate-btn-primary" onClick={captureAndDetect} disabled={isDetecting || !alprOnline}>
                  {isDetecting ? '⏳ Detecting...' : '🔍 Detect Plate'}
                </button>
                <button className="gate-btn-secondary" onClick={stopCamera}>⏹️ Stop Camera</button>
              </>
            )}
          </div>

          {/* Detection History */}
          {detectionHistory.length > 0 && (
            <div className="detection-history">
              <h4>Recent Detections</h4>
              <div className="history-list">
                {detectionHistory.map((item, i) => (
                  <div key={i} className="history-item">
                    <span className="history-plate">{item.plateNumber}</span>
                    <span style={{ fontSize: 11, color: statusColor[item.status] || '#6b7280', fontWeight: 600 }}>{item.status}</span>
                    <span className="history-time">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detection Result */}
        <div className="detection-result-section">
          {detectedPlate && vehicleInfo ? (
            <div className="detection-result-card">
              <div className="result-header">
                <h3>Detection Result</h3>
                <button className="btn-close-result" onClick={() => { setDetectedPlate(null); setVehicleInfo(null); }}>×</button>
              </div>

              <div className="result-plate-display">
                <div className="plate-visual">{detectedPlate.plateNumber}</div>
                <p className="detection-confidence">Confidence: {detectedPlate.confidence}</p>
              </div>

              {/* Vehicle Info */}
              {vehicleInfo.vehicle && (
                <div className="result-details">
                  <div className="result-row"><span className="result-label">Model:</span><span className="result-value">{vehicleInfo.vehicle.model}</span></div>
                  <div className="result-row"><span className="result-label">Type:</span><span className="result-value">{vehicleInfo.vehicle.type}</span></div>
                  <div className="result-row"><span className="result-label">Driver:</span><span className="result-value">{vehicleInfo.driver?.name || vehicleInfo.trip?.assignedDriver || '—'}</span></div>
                  <div className="result-row"><span className="result-label">Department:</span><span className="result-value">{vehicleInfo.trip?.department || '—'}</span></div>
                  <div className="result-row"><span className="result-label">Destination:</span><span className="result-value">{vehicleInfo.trip?.destination || '—'}</span></div>
                  {vehicleInfo.insideCampus !== undefined && (
                    <div className="result-row">
                      <span className="result-label">Currently:</span>
                      <span className="result-value" style={{ color: vehicleInfo.insideCampus ? '#f59e0b' : '#6b7280' }}>
                        {vehicleInfo.insideCampus ? '🏫 Inside Campus' : '🚗 Outside Campus'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Authorization Status */}
              <div style={{
                background: (statusColor[vehicleInfo.status] || '#6b7280') + '15',
                border: `1px solid ${statusColor[vehicleInfo.status] || '#6b7280'}`,
                borderRadius: 8, padding: '10px 14px', margin: '12px 0', fontSize: 13,
              }}>
                <strong style={{ color: statusColor[vehicleInfo.status] }}>
                  {vehicleInfo.status === 'authorized' ? '✅' : vehicleInfo.status === 'pending' ? '⏳' : '❌'} {vehicleInfo.status?.toUpperCase()}
                </strong>
                <p style={{ margin: '4px 0 0', color: '#374151' }}>{vehicleInfo.message}</p>
              </div>

              <div className="result-actions">
                <button className="gate-btn-success" onClick={handleEntry} disabled={actionLoading}>
                  ✓ Allow Entry
                </button>
                <button className="gate-btn-info" onClick={handleExit} disabled={actionLoading}>
                  → Allow Exit
                </button>
                <button className="gate-btn-danger" onClick={handleReject} disabled={actionLoading}>
                  ✗ Reject & Report
                </button>
              </div>
            </div>
          ) : (
            <div className="no-detection-placeholder">
              <span className="placeholder-icon">🔍</span>
              <p>No vehicle detected</p>
              <p className="placeholder-hint">
                {alprOnline
                  ? 'Start camera and click "Detect Plate" to scan'
                  : 'Start the ALPR service first: cd alpr-service && python app.py'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ALPRCamera;
