import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const handleCTA = () => {
    navigate(token ? "/projects" : "/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .hero-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0a0a0f;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
          padding: 80px 24px;
        }

        /* ── BACKGROUND LAYERS ── */
        .hero-bg-glow {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 50% 0%,   rgba(99,102,241,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 20% 80%,  rgba(236,72,153,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 60%,  rgba(34,211,238,0.07) 0%, transparent 60%);
          pointer-events: none;
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 100% 80% at 50% 50%, black 20%, transparent 80%);
          pointer-events: none;
        }

        /* floating orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: float 8s ease-in-out infinite;
        }

        .orb-1 {
          width: 320px; height: 320px;
          background: rgba(99,102,241,0.12);
          top: -80px; left: -80px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 240px; height: 240px;
          background: rgba(236,72,153,0.10);
          bottom: -60px; right: -60px;
          animation-delay: -3s;
        }

        .orb-3 {
          width: 180px; height: 180px;
          background: rgba(34,211,238,0.07);
          top: 40%; right: 10%;
          animation-delay: -5s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-24px) scale(1.04); }
        }

        /* ── CONTENT ── */
        .hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 780px;
          animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px 6px 8px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 100px;
          margin-bottom: 36px;
          animation: fadeUp 0.8s 0.1s cubic-bezier(0.16,1,0.3,1) both;
        }

        .badge-dot {
          width: 20px; height: 20px;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .badge-dot svg { width: 10px; height: 10px; fill: white; }

        .badge-text {
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.3px;
        }

        .badge-text span {
          color: #818cf8;
          font-weight: 600;
        }

        .hero-headline {
          font-family: 'Syne', sans-serif;
          font-size: clamp(44px, 7vw, 80px);
          font-weight: 800;
          color: #fff;
          line-height: 1.05;
          letter-spacing: -2.5px;
          margin-bottom: 24px;
          animation: fadeUp 0.8s 0.15s cubic-bezier(0.16,1,0.3,1) both;
        }

        .hero-headline .grad {
          background: linear-gradient(90deg, #818cf8 0%, #ec4899 55%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-headline .dim {
          color: rgba(255,255,255,0.35);
        }

        .hero-sub {
          font-size: clamp(16px, 2vw, 19px);
          color: rgba(255,255,255,0.45);
          line-height: 1.75;
          font-weight: 300;
          max-width: 560px;
          margin-bottom: 48px;
          animation: fadeUp 0.8s 0.22s cubic-bezier(0.16,1,0.3,1) both;
        }

        /* ── ACTIONS ── */
        .hero-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeUp 0.8s 0.3s cubic-bezier(0.16,1,0.3,1) both;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 28px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.1px;
          text-decoration: none;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .btn-primary:hover::before { opacity: 1; }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(99,102,241,0.4);
        }
        .btn-primary:active { transform: translateY(0); }

        .btn-primary svg { width: 16px; height: 16px; }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: rgba(255,255,255,0.6);
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-ghost:hover {
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.9);
          background: rgba(255,255,255,0.04);
        }

        /* ── STATS STRIP ── */
        .hero-stats {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 0;
          margin-top: 80px;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
          background: rgba(255,255,255,0.02);
          animation: fadeUp 0.8s 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }

        .stat-item {
          padding: 20px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          border-right: 1px solid rgba(255,255,255,0.06);
        }

        .stat-item:last-child { border-right: none; }

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
        }

        .stat-value span {
          background: linear-gradient(90deg, #818cf8, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          font-weight: 400;
          white-space: nowrap;
        }

        /* ── FEATURE PILLS ── */
        .hero-pills {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 32px;
          animation: fadeUp 0.8s 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 100px;
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          font-weight: 400;
          transition: all 0.2s;
        }

        .pill:hover {
          background: rgba(99,102,241,0.08);
          border-color: rgba(99,102,241,0.2);
          color: rgba(255,255,255,0.7);
        }

        .pill-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #ec4899);
        }

        @media (max-width: 600px) {
          .hero-stats { flex-direction: column; }
          .stat-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .stat-item:last-child { border-bottom: none; }
          .hero-headline { letter-spacing: -1.5px; }
        }
      `}</style>

      <div className="hero-root">
        <div className="hero-bg-glow" />
        <div className="hero-grid" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* ── MAIN CONTENT ── */}
        <div className="hero-content">
          <div className="hero-badge">
            <div className="badge-dot">
              <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span className="badge-text">
              Introducing <span>TaskFlow</span> — built for modern teams
            </span>
          </div>

          <h1 className="hero-headline">
            Plan.<br />
            <span className="grad">Track.</span>{" "}
            <span className="dim">Deliver.</span>
          </h1>

          <p className="hero-sub">
            TaskFlow gives your team a single workspace to manage sprints,
            assign tasks, and ship faster — without the chaos.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={handleCTA}>
              {token ? "Go to Dashboard" : "Get Started — it's free"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>

            {!token && (
              <button className="btn-ghost" onClick={() => navigate("/login")}>
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="hero-stats">
          {[
            { value: "Kanban",  accent: false, label: "Drag-and-drop boards" },
            { value: "Sprints", accent: true,  label: "Built-in sprint planning" },
            { value: "Roles",   accent: false, label: "Admin & member access" },
            { value: "Live",    accent: true,  label: "Activity logs & comments" },
          ].map(s => (
            <div className="stat-item" key={s.label}>
              <div className="stat-value">
                {s.accent ? <span>{s.value}</span> : s.value}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── FEATURE PILLS ── */}
        <div className="hero-pills">
          {[
            "Task assignment", "Subtasks", "Priority levels",
            "Story points", "Comments", "Role-based access",
          ].map(p => (
            <div className="pill" key={p}>
              <div className="pill-dot" />
              {p}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}