import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRequest, getCurrentUser } from '../../api/api';
import './SubmitVehicleRequest.css';

// Purpose categories grouped by type
const PURPOSE_CATEGORIES = [
  {
    group: '🌾 Agricultural Activities',
    items: [
      'Farm Field Work',
      'Harvest & Crop Collection',
      'Livestock Transport',
      'Seed & Fertilizer Supply',
      'Irrigation Equipment',
      'Pesticide/Herbicide Application',
      'Greenhouse Activity',
      'Soil & Water Testing',
      'Animal Husbandry',
      'Veterinary Field Visit',
    ],
  },
  {
    group: '🔬 Research & Academic',
    items: [
      'Field Research / Survey',
      'Data Collection',
      'Lab Specimen Transport',
      'Biodiversity Study',
      'Geological Survey',
      'Student Field Trip / Excursion',
      'Academic Conference',
      'Workshop / Seminar / Training',
    ],
  },
  {
    group: '🏛️ Official & Administrative',
    items: [
      'Official Meeting / Delegation',
      'Government Visit',
      'Airport / Station Pickup',
      'VIP / Guest Transport',
      'Document Delivery',
      'Procurement / Market Purchase',
    ],
  },
  {
    group: '🏗️ Logistics & Construction',
    items: [
      'Construction Material Transport',
      'Equipment Delivery',
      'Cargo / Goods Transport',
      'Maintenance Supply',
    ],
  },
  {
    group: '🎓 Student & Campus Life',
    items: [
      'Sports Event / Tournament',
      'Cultural Event / Festival',
      'Graduation / Ceremony',
      'Club / Association Activity',
      'Community Service',
    ],
  },
  {
    group: '🏥 Health & Medical',
    items: [
      'Medical / Health Checkup',
      'Blood Donation',
      'Vaccination Campaign',
      'Emergency Medical',
    ],
  },
  {
    group: '📦 Other',
    items: ['Other (specify in notes)'],
  },
];

// Agricultural purposes that don't need a fixed destination
const AGRI_PURPOSES = [
  'Farm Field Work', 'Harvest & Crop Collection', 'Livestock Transport',
  'Seed & Fertilizer Supply', 'Irrigation Equipment', 'Pesticide/Herbicide Application',
  'Greenhouse Activity', 'Soil & Water Testing', 'Animal Husbandry', 'Veterinary Field Visit',
];
const detectVehicleType = (purpose, passengers, notes) => {
  const p = (purpose + ' ' + notes).toLowerCase();
  const pax = Number(passengers) || 1;

  // ── Emergency / Medical ──────────────────────────────────
  if (/emergency|urgent|ambulance|medical|patient|hospital|sick|accident|injury/.test(p))
    return { type: 'Van', reason: 'Emergency/medical trip — Van for quick response', icon: '🚑' };

  // ── Agricultural & Farm Activities ───────────────────────
  if (/farm|farming|harvest|crop|seed|fertilizer|irrigation|tractor|livestock|cattle|sheep|goat|poultry|animal husbandry|agri|plantation|field work|soil|compost|pesticide|herbicide|greenhouse/.test(p)) {
    if (/livestock|cattle|sheep|goat|poultry|animal/.test(p))
      return { type: 'Truck', reason: 'Livestock/animal transport — Truck recommended', icon: '🐄' };
    if (/harvest|crop|seed|fertilizer|compost|pesticide|herbicide/.test(p))
      return { type: 'Truck', reason: 'Agricultural materials/supplies — Truck recommended', icon: '🌾' };
    return { type: 'Pickup', reason: 'Agricultural field activity — Pickup recommended for farm access', icon: '🚜' };
  }

  // ── Veterinary Activities ─────────────────────────────────
  if (/veterinary|vet|animal clinic|vaccination|deworming|treatment|specimen|sample|lab animal/.test(p))
    return { type: 'Van', reason: 'Veterinary activity — Van for equipment and animals', icon: '🐾' };

  // ── Research & Field Studies ──────────────────────────────
  if (/research|survey|data collection|field study|experiment|sampling|soil test|water test|biodiversity|ecology|geology|mapping/.test(p)) {
    return pax > 8
      ? { type: 'Bus', reason: 'Research field trip with large team — Bus recommended', icon: '🔬' }
      : { type: 'Pickup', reason: 'Research/field study — Pickup for off-road access', icon: '🔬' };
  }

  // ── Laboratory & Scientific ───────────────────────────────
  if (/laboratory|lab|specimen|sample|chemical|reagent|equipment|instrument|microscope/.test(p))
    return { type: 'Van', reason: 'Lab equipment/specimen transport — Van for safe handling', icon: '🧪' };

  // ── Construction & Infrastructure ────────────────────────
  if (/construction|building|cement|sand|gravel|iron|steel|pipe|wire|material|supply|supplies|equipment|machinery/.test(p))
    return { type: 'Truck', reason: 'Construction materials — Truck recommended', icon: '🏗️' };

  // ── Cargo / Goods ─────────────────────────────────────────
  if (/cargo|goods|freight|luggage|package|box|furniture|load|delivery|procurement|purchase|market|store/.test(p)) {
    return pax <= 3
      ? { type: 'Truck', reason: 'Cargo/goods transport — Truck recommended', icon: '🚛' }
      : { type: 'Van', reason: 'Mixed cargo and passengers — Van recommended', icon: '🚐' };
  }

  // ── Academic & Events ─────────────────────────────────────
  if (/graduation|ceremony|convocation|inauguration|event|exhibition|fair|festival/.test(p)) {
    return pax > 20
      ? { type: 'Bus', reason: 'Large event — Bus for group transport', icon: '🎓' }
      : { type: 'Minibus', reason: 'Academic event — Minibus recommended', icon: '🎓' };
  }

  if (/conference|meeting|workshop|seminar|training|delegation|official visit/.test(p)) {
    return pax > 8
      ? { type: 'Minibus', reason: 'Conference/delegation — Minibus recommended', icon: '🤝' }
      : { type: 'Car', reason: 'Small delegation/meeting — Car recommended', icon: '🚗' };
  }

  // ── Sports & Recreation ───────────────────────────────────
  if (/sport|game|match|tournament|competition|athletics|football|basketball|volleyball/.test(p))
    return { type: 'Bus', reason: 'Sports event — Bus for team transport', icon: '⚽' };

  // ── Student Activities ────────────────────────────────────
  if (/student|class|excursion|tour|visit|trip|club|association/.test(p)) {
    return pax > 20
      ? { type: 'Bus', reason: `${pax} students — Bus recommended`, icon: '🎒' }
      : pax > 8
        ? { type: 'Minibus', reason: `${pax} students — Minibus recommended`, icon: '🎒' }
        : { type: 'Van', reason: `${pax} students — Van recommended`, icon: '🎒' };
  }

  // ── Airport / Station ─────────────────────────────────────
  if (/airport|station|pickup|drop|arrival|departure|guest|visitor|vip/.test(p))
    return { type: 'Car', reason: 'Airport/station pickup — Car recommended', icon: '✈️' };

  // ── Medical / Health ──────────────────────────────────────
  if (/health|clinic|pharmacy|medicine|blood|donation|checkup|screening/.test(p))
    return { type: 'Van', reason: 'Health/medical activity — Van recommended', icon: '🏥' };

  // ── Passenger count fallback ──────────────────────────────
  if (pax > 30) return { type: 'Bus',     reason: `${pax} passengers — Bus required for large groups`, icon: '🚌' };
  if (pax > 20) return { type: 'Bus',     reason: `${pax} passengers — Bus recommended`, icon: '🚌' };
  if (pax > 8)  return { type: 'Minibus', reason: `${pax} passengers — Minibus recommended`, icon: '🚐' };
  if (pax > 4)  return { type: 'Van',     reason: `${pax} passengers — Van recommended`, icon: '🚐' };
  return { type: 'Car', reason: `${pax} passenger(s) — Car is sufficient`, icon: '🚗' };
};

const UNIT_TYPE_LABELS = {
  DEPARTMENT: 'Department',
  COLLEGE: 'College Office',
  CAFETERIA: 'Cafeteria',
  CLINIC: 'Clinic',
  AGRICULTURAL_ACTIVITY: 'Agricultural Activity',
  OTHER: 'Other',
};

const SubmitVehicleRequest = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const isDepartment = currentUser?.unitType === 'DEPARTMENT';
  const unitLabel = UNIT_TYPE_LABELS[currentUser?.unitType] || null;

  const [formData, setFormData] = useState({
    purpose: '',
    date: '',
    time: '',
    destination: '',
    passengers: 1,
    priority: 'normal',
    additionalNotes: '',
    // Optional department field — pre-filled from user profile
    requestingDepartment: currentUser?.unitName || currentUser?.department || '',
  });

  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  // Auto-detect vehicle type whenever purpose, passengers, or notes change
  useEffect(() => {
    if (formData.purpose || formData.passengers > 1 || formData.additionalNotes) {
      const result = detectVehicleType(formData.purpose, formData.passengers, formData.additionalNotes);
      setSuggestion(result);
    } else {
      setSuggestion(null);
    }
  }, [formData.purpose, formData.passengers, formData.additionalNotes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const isAgri = AGRI_PURPOSES.includes(formData.purpose);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.purpose)     newErrors.purpose     = 'Purpose is required';
    if (!formData.date)        newErrors.date        = 'Date is required';
    if (!formData.time)        newErrors.time        = 'Time is required';
    // Destination optional for agricultural activities
    if (!isAgri && !formData.destination) newErrors.destination = 'Destination is required';
    if (!isAgri && formData.passengers < 1) newErrors.passengers = 'At least 1 passenger required';
    const selectedDate = new Date(formData.date);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (selectedDate < today) newErrors.date = 'Date cannot be in the past';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setSubmitting(true);
    try {
      await createRequest({
        requester:         currentUser?.name || 'Unknown',
        requesterUsername: currentUser?.username || '',
        department:        formData.requestingDepartment || currentUser?.department || 'N/A',
        destination:       formData.destination || (isAgri ? 'University Farm, Haramaya' : ''),
        purpose:           formData.purpose,
        date:              `${formData.date} ${formData.time}`,
        passengers:        Number(formData.passengers),
        priority:          formData.priority,
        vehicleType:       suggestion?.type || 'Car',
        specialRequirements: formData.additionalNotes,
        unitType:          currentUser?.unitType  || null,
        unitName:          currentUser?.unitName  || null,
        collegeName:       currentUser?.collegeName || null,
      });
      alert('✅ Vehicle request submitted! The transport officer will review it.');
      navigate('/user/my-requests');
    } catch (err) {
      alert(`Failed to submit: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="request-form-page">
      <h1 className="page-title">Submit Vehicle Request</h1>

      {/* Approval route info — read-only, shown when unitType is set */}
      {unitLabel && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          background: isDepartment ? '#eff6ff' : '#f0fdf4',
          border: `1px solid ${isDepartment ? '#bfdbfe' : '#bbf7d0'}`,
          borderRadius: 12, padding: '14px 20px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Your Unit</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
              {unitLabel}{currentUser?.unitName ? ` — ${currentUser.unitName}` : ''}
            </span>
          </div>
          <div style={{ width: 1, height: 32, background: isDepartment ? '#bfdbfe' : '#bbf7d0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Approval Route</span>
            {isDepartment ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 10px', borderRadius: 20 }}>You</span>
                <span style={{ color: '#94a3b8' }}>→</span>
                <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 10px', borderRadius: 20 }}>College Dean</span>
                <span style={{ color: '#94a3b8' }}>→</span>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 10px', borderRadius: 20 }}>Transport Officer</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 10px', borderRadius: 20 }}>You</span>
                <span style={{ color: '#94a3b8' }}>→</span>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 10px', borderRadius: 20 }}>Transport Officer</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            <div className="form-group">
              <label className="form-label">Purpose <span className="required">*</span></label>
              <select name="purpose" value={formData.purpose} onChange={handleChange}
                className={`form-select ${errors.purpose ? 'error' : ''}`}>
                <option value="">Select purpose...</option>
                {PURPOSE_CATEGORIES.map(cat => (
                  <optgroup key={cat.group} label={cat.group}>
                    {cat.items.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {errors.purpose && <p className="error-message">{errors.purpose}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="form-select">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Destination {isAgri ? <span style={{ fontSize:12, color:'#16a34a', fontWeight:500 }}>(Optional for farm activities)</span> : <span className="required">*</span>}
              </label>
              <input type="text" name="destination" value={formData.destination} onChange={handleChange}
                placeholder={isAgri ? 'e.g., University Farm, Haramaya Campus (optional)' : 'Enter destination'}
                className={`form-input ${errors.destination ? 'error' : ''}`} />
              {errors.destination && <p className="error-message">{errors.destination}</p>}
              {isAgri && !formData.destination && (
                <p style={{ fontSize:12, color:'#16a34a', marginTop:4 }}>
                  🌾 Agricultural activity — destination defaults to University Farm if not specified
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Number of Passengers {isAgri ? <span style={{ fontSize:12, color:'#16a34a', fontWeight:500 }}>(Optional for farm activities)</span> : <span className="required">*</span>}
              </label>
              <input type="number" name="passengers" value={formData.passengers} onChange={handleChange}
                min="0" max="100"
                placeholder={isAgri ? 'Optional — enter if workers are travelling' : ''}
                className={`form-input ${errors.passengers ? 'error' : ''}`} />
              {errors.passengers && <p className="error-message">{errors.passengers}</p>}
              {isAgri && (
                <p style={{ fontSize:12, color:'#16a34a', marginTop:4 }}>
                  🌾 Leave as 0 if this is a cargo/material-only trip
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Date <span className="required">*</span></label>
              <input type="date" name="date" value={formData.date} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`form-input ${errors.date ? 'error' : ''}`} />
              {errors.date && <p className="error-message">{errors.date}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Time <span className="required">*</span></label>
              <input type="time" name="time" value={formData.time} onChange={handleChange}
                className={`form-input ${errors.time ? 'error' : ''}`} />
              {errors.time && <p className="error-message">{errors.time}</p>}
            </div>

            <div className="form-group full-width">
              <label className="form-label">Additional Notes (Optional)</label>
              <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleChange}
                rows="3" placeholder="Any special requirements, cargo details, or instructions..."
                className="form-textarea" />
            </div>

            {/* Optional department field */}
            <div className="form-group full-width">
              <label className="form-label">
                Requesting Department
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400, marginLeft: 6 }}>(Optional — helps identify your unit)</span>
              </label>
              <input
                type="text"
                name="requestingDepartment"
                value={formData.requestingDepartment}
                onChange={handleChange}
                placeholder="e.g. Computer Science, Animal Sciences..."
                className="form-input"
                style={{ background: formData.requestingDepartment && currentUser?.unitName === formData.requestingDepartment ? '#f0fdf4' : undefined }}
              />
              {currentUser?.unitName && formData.requestingDepartment === currentUser.unitName && (
                <p style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
                  ✅ Auto-filled from your profile — you can change it if submitting on behalf of another unit
                </p>
              )}
              {currentUser?.collegeName && (
                <p style={{ fontSize: 12, color: '#6366f1', marginTop: 4 }}>
                  🏛️ College: <strong>{currentUser.collegeName}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Smart Vehicle Suggestion */}
          {suggestion && (
            <div className="vehicle-suggestion-card">
              <div className="suggestion-icon">{suggestion.icon}</div>
              <div className="suggestion-body">
                <div className="suggestion-title">
                  System Recommendation: <strong>{suggestion.type}</strong>
                </div>
                <div className="suggestion-reason">{suggestion.reason}</div>
                <div className="suggestion-note">
                  The transport officer will assign the best available vehicle based on this recommendation.
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
            <button type="button" onClick={() => navigate('/user/dashboard')} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitVehicleRequest;
