import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ShieldCheck, AlertTriangle } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import busLogo from "../../assets/bus.png";
import "./ForceChangePassword.css";

const BASE = "http://localhost:5000/api";

// Password requirement checker
function Req({ met, label }) {
  return (
    <div className={`fcp-req ${met ? "fcp-req-met" : ""}`}>
      {met ? <CheckCircle size={13} /> : <XCircle size={13} />}
      {label}
    </div>
  );
}

export default function ForceChangePassword() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [current,  setCurrent]  = useState("");
  const [newPw,    setNewPw]    = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [showCon,  setShowCon]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  // Requirements
  const reqs = {
    length:    newPw.length >= 8,
    uppercase: /[A-Z]/.test(newPw),
    lowercase: /[a-z]/.test(newPw),
    number:    /[0-9]/.test(newPw),
    special:   /[!@#$%^&*(),.?":{}|<>]/.test(newPw),
    different: newPw.length > 0 && newPw !== current,
  };

  const allMet      = Object.values(reqs).every(Boolean);
  const pwMatch     = newPw && newPw === confirm;
  const metCount    = Object.values(reqs).filter(Boolean).length;
  const strength    = metCount <= 2 ? "weak" : metCount <= 4 ? "medium" : "strong";
  const strengthPct = `${Math.round((metCount / 6) * 100)}%`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!current)  { setError("Please enter your current (temporary) password."); return; }
    if (!allMet)   { setError("New password does not meet all requirements."); return; }
    if (!pwMatch)  { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to change password."); return; }

      // Clear the flag in local state so the user isn't redirected again
      const updatedUser = { ...user, mustChangePassword: false };
      setUser(updatedUser);
      setSuccess(true);

      // Redirect to their dashboard after 2 seconds
      setTimeout(() => {
        const routes = {
          ADMIN:               "/admin/dashboard",
          TRANSPORT:           "/transport/dashboard",
          DRIVER:              "/driver/dashboard",
          USER:                "/user/dashboard",
          FUEL_OFFICER:        "/fuel/dashboard",
          GATE_OFFICER:        "/gate/dashboard",
          MAINTENANCE_OFFICER: "/maintenance/dashboard",
          DEAN:                "/dean/requests",
        };
        navigate(routes[user?.role] || "/login");
      }, 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="fcp-page">
        <div className="fcp-card fcp-card-success">
          <div className="fcp-success-icon"><ShieldCheck size={48} /></div>
          <h2>Password Updated</h2>
          <p>Your password has been changed successfully. Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fcp-page">
      <div className="fcp-card">

        {/* Logo */}
        <div className="fcp-logo-wrap">
          <img src={busLogo} alt="HU-VMS" className="fcp-logo" />
        </div>

        {/* Title */}
        <div className="fcp-title-wrap">
          <div className="fcp-badge">
            <AlertTriangle size={14} />
            Action Required
          </div>
          <h2>Set Your New Password</h2>
          <p>
            Your account was given a temporary password by the administrator.
            You must set a new personal password before continuing.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="fcp-error">
            <XCircle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Current (temporary) password */}
          <div className="fcp-field">
            <label>Temporary Password</label>
            <div className="fcp-input-wrap">
              <Lock size={16} className="fcp-input-icon" />
              <input
                type={showCur ? "text" : "password"}
                value={current}
                onChange={e => { setCurrent(e.target.value); setError(""); }}
                placeholder="Enter the temporary password"
                autoFocus
              />
              <button type="button" className="fcp-eye" onClick={() => setShowCur(v => !v)}>
                {showCur ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="fcp-field">
            <label>New Password</label>
            <div className="fcp-input-wrap">
              <Lock size={16} className="fcp-input-icon" />
              <input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={e => { setNewPw(e.target.value); setError(""); }}
                placeholder="Create a strong password"
              />
              <button type="button" className="fcp-eye" onClick={() => setShowNew(v => !v)}>
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength bar */}
            {newPw && (
              <div className="fcp-strength">
                <div className="fcp-strength-bar">
                  <div
                    className={`fcp-strength-fill fcp-strength-${strength}`}
                    style={{ width: strengthPct }}
                  />
                </div>
                <span className={`fcp-strength-label fcp-strength-${strength}`}>
                  {strength.charAt(0).toUpperCase() + strength.slice(1)}
                </span>
              </div>
            )}

            {/* Requirements */}
            <div className="fcp-reqs">
              <Req met={reqs.length}    label="At least 8 characters" />
              <Req met={reqs.uppercase} label="One uppercase letter" />
              <Req met={reqs.lowercase} label="One lowercase letter" />
              <Req met={reqs.number}    label="One number" />
              <Req met={reqs.special}   label="One special character" />
              <Req met={reqs.different} label="Different from temporary password" />
            </div>
          </div>

          {/* Confirm password */}
          <div className="fcp-field">
            <label>Confirm New Password</label>
            <div className="fcp-input-wrap">
              <Lock size={16} className="fcp-input-icon" />
              <input
                type={showCon ? "text" : "password"}
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(""); }}
                placeholder="Re-enter your new password"
              />
              <button type="button" className="fcp-eye" onClick={() => setShowCon(v => !v)}>
                {showCon ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirm && (
              <div className={`fcp-match ${pwMatch ? "fcp-match-ok" : "fcp-match-err"}`}>
                {pwMatch
                  ? <><CheckCircle size={13} />Passwords match</>
                  : <><XCircle size={13} />Passwords do not match</>}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="fcp-submit"
            disabled={loading || !allMet || !pwMatch || !current}
          >
            {loading ? (
              <><span className="fcp-spinner" />Updating Password…</>
            ) : (
              <><ShieldCheck size={16} />Set New Password</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
