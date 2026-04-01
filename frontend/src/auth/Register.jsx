import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "./authService";

export default function Register() {
  const [username, setUsername]               = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]                     = useState("");
  const [loading, setLoading]                 = useState(false);
  const [success, setSuccess]                 = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError("Registration failed. Username or email may already be taken.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8)  score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very strong"][strength];
  const strengthColor = ["", "#f87171", "#fb923c", "#facc15", "#4ade80", "#34d399"][strength];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100vh;
          display: flex;
          background: #0a0a0f;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .auth-left {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
          overflow: hidden;
        }

        .auth-left-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 50%, rgba(99,102,241,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 80%, rgba(236,72,153,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 60% 20%, rgba(34,211,238,0.08) 0%, transparent 60%),
            #0a0a0f;
        }

        .auth-left-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }

        .auth-left-content {
          position: relative;
          z-index: 2;
          max-width: 460px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 56px;
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-icon svg { width: 18px; height: 18px; fill: white; }

        .brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .hero-headline {
          font-family: 'Syne', sans-serif;
          font-size: clamp(36px, 4vw, 52px);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin-bottom: 20px;
        }

        .hero-headline span {
          background: linear-gradient(90deg, #818cf8, #ec4899 60%, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: 16px;
          color: rgba(255,255,255,0.45);
          line-height: 1.7;
          font-weight: 300;
          margin-bottom: 48px;
          max-width: 360px;
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .step-item:last-child { border-bottom: none; }

        .step-num {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #818cf8;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .step-text { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.5; }
        .step-text strong { color: rgba(255,255,255,0.8); font-weight: 500; display: block; margin-bottom: 2px; }

        /* ── RIGHT PANEL ── */
        .auth-right {
          width: 500px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 52px;
          background: rgba(255,255,255,0.02);
          border-left: 1px solid rgba(255,255,255,0.06);
          position: relative;
          overflow-y: auto;
        }

        .auth-right::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent);
        }

        .auth-form-wrap {
          width: 100%;
          animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .form-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #6366f1;
          margin-bottom: 12px;
        }

        .form-title {
          font-family: 'Syne', sans-serif;
          font-size: 30px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.8px;
          margin-bottom: 8px;
        }

        .form-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 36px;
          font-weight: 300;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .field-wrap { position: relative; }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.5px;
          color: rgba(255,255,255,0.5);
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .field-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          outline: none;
          transition: all 0.2s ease;
          caret-color: #6366f1;
        }

        .field-input::placeholder { color: rgba(255,255,255,0.2); }

        .field-input:focus {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .field-input.has-error {
          border-color: rgba(248,113,113,0.4);
          background: rgba(248,113,113,0.04);
        }

        /* password strength */
        .strength-bar-wrap {
          display: flex;
          gap: 4px;
          margin-top: 8px;
          align-items: center;
        }

        .strength-segment {
          flex: 1;
          height: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.08);
          transition: background 0.3s ease;
        }

        .strength-label {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          margin-top: 4px;
          transition: color 0.3s;
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 8px;
          color: #f87171;
          font-size: 13px;
          margin-bottom: 20px;
        }

        .auth-success {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.2);
          border-radius: 8px;
          color: #34d399;
          font-size: 13px;
          margin-bottom: 20px;
        }

        .submit-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.2px;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .submit-btn:hover:not(:disabled)::before { opacity: 1; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.35); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .terms-note {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          text-align: center;
          margin-top: 16px;
          line-height: 1.6;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }

        .auth-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }

        .auth-divider-text {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          white-space: nowrap;
        }

        .switch-text {
          text-align: center;
          font-size: 14px;
          color: rgba(255,255,255,0.35);
        }

        .switch-link {
          color: #818cf8;
          cursor: pointer;
          font-weight: 500;
          transition: color 0.2s;
        }

        .switch-link:hover { color: #a5b4fc; }

        @media (max-width: 900px) {
          .auth-left { display: none; }
          .auth-right { width: 100%; border-left: none; }
        }
      `}</style>

      <div className="auth-root">
        {/* ── LEFT ── */}
        <div className="auth-left">
          <div className="auth-left-bg" />
          <div className="auth-left-grid" />
          <div className="auth-left-content">
            <div className="brand-logo">
              <div className="brand-icon">
                <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <span className="brand-name">TaskFlow</span>
            </div>
            <h1 className="hero-headline">
              Your team,<br />
              <span>one workspace.</span>
            </h1>
            <p className="hero-sub">
              Set up in minutes. Invite your team, assign roles, and start shipping — all in one place.
            </p>
            <div className="steps-list">
              {[
                { n: "01", title: "Create your account",      sub: "Free to get started, no credit card needed" },
                { n: "02", title: "Set up your workspace",    sub: "Invite teammates and assign roles" },
                { n: "03", title: "Build your first board",   sub: "Default Kanban columns ready instantly" },
                { n: "04", title: "Start collaborating",      sub: "Assign tasks, comment, track progress" },
              ].map(s => (
                <div className="step-item" key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-text">
                    <strong>{s.title}</strong>
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <p className="form-eyebrow">Get started</p>
            <h2 className="form-title">Create account</h2>
            <p className="form-subtitle">Join your team on TaskFlow</p>

            {error && (
              <div className="auth-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            {success && (
              <div className="auth-success">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Account created! Redirecting to login...
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <div className="field-row">
                  <div className="field-wrap">
                    <label className="field-label">Username</label>
                    <input
                      className="field-input"
                      placeholder="john_doe"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>
                  <div className="field-wrap">
                    <label className="field-label">Email</label>
                    <input
                      className="field-input"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="field-wrap">
                  <label className="field-label">Password</label>
                  <input
                    className="field-input"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  {password && (
                    <>
                      <div className="strength-bar-wrap">
                        {[1,2,3,4,5].map(i => (
                          <div
                            key={i}
                            className="strength-segment"
                            style={{ background: i <= strength ? strengthColor : undefined }}
                          />
                        ))}
                      </div>
                      <p className="strength-label" style={{ color: strength > 0 ? strengthColor : undefined }}>
                        {strengthLabel}
                      </p>
                    </>
                  )}
                </div>

                <div className="field-wrap">
                  <label className="field-label">Confirm Password</label>
                  <input
                    className={`field-input${confirmPassword && confirmPassword !== password ? " has-error" : ""}`}
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading || success}>
                {loading && <span className="spinner" />}
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="terms-note">
              By creating an account you agree to our terms of service.
            </p>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">already have an account?</span>
              <div className="auth-divider-line" />
            </div>

            <p className="switch-text">
              <span className="switch-link" onClick={() => navigate("/login")}>
                ← Sign in instead
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}