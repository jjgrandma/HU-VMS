import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ShieldX, Camera, Upload, Scan, RefreshCw, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import './ALPRModule.css';

const ALPR_URL = 'http://localhost:5001';
const BASE_URL = 'http://localhost:5000/api';
const token    = () => localStorage.getItem('token');

export default function ALPRModule() {
  const [alprOnline, setAlprOnline]   = useState(false);
  const [cameraOn, setCameraOn]       = useState(false);
  const [scanning, setScanning]       = useState(false);
  const [verifying, setVerifying]     = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectedPlate, setDetectedPlate] = useState(null);
  const [candidates, setCandidates]   = useState([]);
  const [verifyResult, setVerifyResult] = useState(null);
  const [toast, setToast]             = useState(null);
  const [checkinDone, setCheckinDone] = useState(false);

  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef   = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Check ALPR service health
  useEffect(() => {
    const check = () => fetch(`${ALPR_URL}/health`).then(r => r.json()).then(d => setAlprOnline(d.status === 'ok')).catch(() => setAlprOnline(false));
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  // Start camera
  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('Camera not available. Use image upload instead.', 'error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setCameraOn(true);
      // Set srcObject after element mounts
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', true);
          videoRef.current.play().catch(console.error);
        }
      }, 100);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        showToast('Camera permission denied. Allow camera in browser settings.', 'error');
      } else if (err.name === 'NotFoundError') {
        showToast('No camera found on this device.', 'error');
      } else {
        showToast(`Camera error: ${err.message}. Use image upload instead.`, 'error');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setCameraOn(false);
  };

  // Capture frame from camera
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result);
      setDetectedPlate(null);
      setVerifyResult(null);
      setCandidates([]);
      setCheckinDone(false);
    };
    reader.readAsDataURL(file);
  };

  // Run ALPR detection
  const runDetection = async (imageBase64) => {
    setScanning(true);
    setDetectedPlate(null);
    setVerifyResult(null);
    setCandidates([]);
    setCheckinDone(false);

    try {
      const res  = await fetch(`${ALPR_URL}/detect-plate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 }),
      });
      const data = await res.json();

      if (data.plate) {
        setDetectedPlate(data.plate);
        setCandidates(data.candidates || []);
        showToast(`Plate detected: ${data.plate}`);
        // Auto-verify
        await verifyPlate(data.plate);
      } else {
        showToast('No plate detected. Try a clearer image.', 'error');
      }
    } catch {
      showToast('ALPR service unavailable. Start alpr-service/app.py', 'error');
    } finally {
      setScanning(false);
    }
  };

  // Scan from camera
  const scanFromCamera = async () => {
    const img = captureFrame();
    if (!img) return;
    setCapturedImage(img);
    stopCamera();
    await runDetection(img);
  };

  // Scan from uploaded image
  const scanFromImage = async () => {
    if (!capturedImage) { showToast('Upload an image first', 'error'); return; }
    await runDetection(capturedImage);
  };

  // Verify plate against DB
  const verifyPlate = async (plate) => {
    setVerifying(true);
    try {
      const res  = await fetch(`${BASE_URL}/security/verify/${plate}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      setVerifyResult(data);
    } catch { showToast('Verification failed', 'error'); }
    finally { setVerifying(false); }
  };

  // Check-in
  const handleCheckin = async () => {
    if (!verifyResult) return;
    try {
      const res = await fetch(`${BASE_URL}/security/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          plateNumber:  verifyResult.plateNumber,
          driverName:   verifyResult.trip?.assignedDriver || verifyResult.driver?.name || '',
          vehicleModel: verifyResult.vehicle?.model || '',
          tripId:       verifyResult.trip?._id,
          remarks:      'ALPR auto-detected',
        }),
      });
      if (res.ok) { setCheckinDone(true); showToast('Check-in recorded!'); }
    } catch { showToast('Check-in failed', 'error'); }
  };

  const reset = () => {
    setCapturedImage(null); setDetectedPlate(null);
    setVerifyResult(null); setCandidates([]);
    setCheckinDone(false); setScanning(false);
    if (cameraOn) stopCamera();
  };

  const isAllowed = verifyResult?.authorized;

  return (
    <div className="alpr-page">
      {toast && <div className={`alpr-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="alpr-page-header">
        <div>
          <h2>ALPR — AI Plate Recognition</h2>
          <p>Automatic license plate detection using YOLOv8 + OCR</p>
        </div>
        <div className={`alpr-service-badge ${alprOnline ? 'online' : 'offline'}`}>
          {alprOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          ALPR Service: {alprOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {!alprOnline && (
        <div className="alpr-offline-banner">
          <AlertTriangle size={18} />
          <div>
            <strong>ALPR service is not running.</strong>
            <span> Start it with: <code>cd alpr-service && python app.py</code></span>
          </div>
        </div>
      )}

      <div className="alpr-layout">
        {/* Left: Input */}
        <div className="alpr-input-panel">
          <h3>📸 Image Input</h3>

          {/* Camera unavailable notice */}
          {!navigator.mediaDevices && (
            <div style={{ background:'#fef3c7', border:'1px solid #fde68a', borderRadius:8, padding:'10px 14px', marginBottom:10, fontSize:12, color:'#92400e' }}>
              ⚠ Camera requires HTTPS. Use <strong>image upload</strong> instead, or enable insecure origins in Chrome flags.
            </div>
          )}

          {/* Camera */}
          <div className="alpr-camera-section">
            <div className="alpr-video-wrap">
              {cameraOn
                ? <video
                    ref={(el) => {
                      videoRef.current = el;
                      if (el && streamRef.current && !el.srcObject) {
                        el.srcObject = streamRef.current;
                        el.play().catch(console.error);
                      }
                    }}
                    autoPlay playsInline muted className="alpr-video"
                  />
                : capturedImage
                  ? <img src={capturedImage} alt="Captured" className="alpr-video" />
                  : <div className="alpr-video-placeholder"><Camera size={48} /><p>Camera or upload image</p></div>
              }
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <div className="alpr-input-actions">
              {!cameraOn ? (
                <button className="alpr-btn camera" onClick={startCamera}>
                  <Camera size={16} /> Start Camera
                </button>
              ) : (
                <>
                  <button className="alpr-btn scan" onClick={scanFromCamera} disabled={scanning || !alprOnline}>
                    {scanning ? <><RefreshCw size={16} className="spin" /> Scanning...</> : <><Scan size={16} /> Capture & Scan</>}
                  </button>
                  <button className="alpr-btn stop" onClick={stopCamera}>Stop</button>
                </>
              )}
              <button className="alpr-btn upload" onClick={() => fileRef.current.click()}>
                <Upload size={16} /> Upload Image
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </div>

            {capturedImage && !cameraOn && (
              <button className="alpr-btn scan full-width" onClick={scanFromImage} disabled={scanning || !alprOnline}>
                {scanning ? <><RefreshCw size={16} className="spin" /> Scanning...</> : <><Scan size={16} /> Recognize Plate</>}
              </button>
            )}
          </div>

          {/* Candidates */}
          {candidates.length > 0 && (
            <div className="alpr-candidates">
              <h4>OCR Candidates</h4>
              {candidates.map((c, i) => (
                <div key={i} className={`alpr-candidate ${i === 0 ? 'best' : ''}`}
                  onClick={() => { setDetectedPlate(c.text); verifyPlate(c.text); }}>
                  <span className="alpr-candidate-plate">{c.text}</span>
                  <span className="alpr-candidate-conf">{Math.round(c.confidence * 100)}%</span>
                  {i === 0 && <span className="alpr-best-tag">Best</span>}
                </div>
              ))}
            </div>
          )}

          {(capturedImage || detectedPlate) && (
            <button className="alpr-btn reset" onClick={reset}>🔄 Reset</button>
          )}
        </div>

        {/* Right: Result */}
        <div className="alpr-result-panel">
          {!detectedPlate && !verifying && (
            <div className="alpr-waiting">
              <Scan size={64} color="#d1d5db" />
              <p>Scan a vehicle to see results</p>
            </div>
          )}

          {verifying && (
            <div className="alpr-waiting">
              <div className="alpr-spinner" />
              <p>Verifying plate...</p>
            </div>
          )}

          {detectedPlate && !verifying && (
            <>
              {/* Detected Plate */}
              <div className="alpr-plate-display">
                <div className="alpr-plate-label">Detected Plate</div>
                <div className="alpr-plate-number">{detectedPlate}</div>
              </div>

              {/* Gate Decision */}
              {verifyResult && (
                <div className={`alpr-decision ${isAllowed ? 'allow' : 'block'}`}>
                  <div className="alpr-decision-icon">
                    {isAllowed ? <ShieldCheck size={48} /> : <ShieldX size={48} />}
                  </div>
                  <div className="alpr-decision-text">
                    {isAllowed ? 'ALLOW ENTRY' : 'BLOCK ENTRY'}
                  </div>
                  <div className="alpr-decision-reason">{verifyResult.message}</div>
                </div>
              )}

              {/* Vehicle Details */}
              {verifyResult?.vehicle && (
                <div className="alpr-detail-card">
                  <div className="alpr-detail-title">🚗 Vehicle Information</div>
                  <div className="alpr-detail-grid">
                    {[
                      ['Plate',     verifyResult.vehicle.plateNumber],
                      ['Model',     verifyResult.vehicle.model],
                      ['Type',      verifyResult.vehicle.type],
                      ['Fuel',      verifyResult.vehicle.fuelLevel != null ? `${verifyResult.vehicle.fuelLevel}%` : '—'],
                      ['Status',    verifyResult.vehicle.status],
                    ].map(([l, v]) => (
                      <div key={l} className="alpr-detail-row">
                        <span className="alpr-detail-label">{l}</span>
                        <span className="alpr-detail-value">{v || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Driver Details */}
              {verifyResult?.driver && (
                <div className="alpr-detail-card">
                  <div className="alpr-detail-title">👤 Driver</div>
                  <div className="alpr-detail-grid">
                    {[
                      ['Name',    verifyResult.driver.name],
                      ['Phone',   verifyResult.driver.phone || '—'],
                      ['License', verifyResult.driver.licenseNumber || '—'],
                      ['Status',  verifyResult.driver.status],
                    ].map(([l, v]) => (
                      <div key={l} className="alpr-detail-row">
                        <span className="alpr-detail-label">{l}</span>
                        <span className="alpr-detail-value">{v || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trip Details */}
              {verifyResult?.trip && (
                <div className="alpr-detail-card">
                  <div className="alpr-detail-title">📋 Trip</div>
                  <div className="alpr-detail-grid">
                    {[
                      ['Destination', verifyResult.trip.destination],
                      ['Date',        verifyResult.trip.date],
                      ['Driver',      verifyResult.trip.assignedDriver || '—'],
                      ['Status',      verifyResult.trip.status],
                      ['Purpose',     verifyResult.trip.purpose || '—'],
                    ].map(([l, v]) => (
                      <div key={l} className="alpr-detail-row">
                        <span className="alpr-detail-label">{l}</span>
                        <span className="alpr-detail-value">{v || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Check-in button */}
              {isAllowed && !checkinDone && (
                <button className="alpr-checkin-btn" onClick={handleCheckin}>
                  ✅ Record Check-In
                </button>
              )}
              {checkinDone && (
                <div className="alpr-checkin-done">✅ Check-in recorded successfully</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
