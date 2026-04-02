export default function ProjectHeader({ name, onInviteClick, isAdmin }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .project-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: #fff;
          border-bottom: 1px solid #eef0f5;
          font-family: 'Plus Jakarta Sans', sans-serif;
          flex-wrap: wrap;
          gap: 10px;
        }

        .project-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .project-ws-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #4f8ef7, #7c5cfc);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700; color: white;
          flex-shrink: 0;
        }

        .project-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a1f36;
          letter-spacing: -0.3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .project-badge {
          padding: 2px 10px;
          background: #eff4ff;
          color: #4f8ef7;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 600;
          white-space: nowrap;
        }

        .project-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          border: 1.5px solid #eef0f5;
          background: #fff;
          color: #5a627a;
          font-size: 13px;
          font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .action-btn:hover {
          border-color: #c7d3f5;
          background: #f5f7ff;
          color: #2d3452;
        }

        /* ✅ Invite button — always visible when workspace is selected */
        .invite-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 8px;
          border: 1.5px solid rgba(99,102,241,0.35);
          background: rgba(99,102,241,0.08);
          color: #6366f1;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .invite-btn:hover {
          background: rgba(99,102,241,0.15);
          border-color: #6366f1;
          color: #4f46e5;
        }

        .action-icon-btn {
          width: 34px; height: 34px;
          border-radius: 8px;
          border: 1.5px solid #eef0f5;
          background: #fff;
          color: #8b95a9;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          font-size: 15px;
          transition: all 0.15s;
        }

        .action-icon-btn:hover {
          border-color: #c7d3f5;
          background: #f5f7ff;
          color: #4f8ef7;
        }

        @media (max-width: 600px) {
          .project-badge { display: none; }
          .action-btn span { display: none; }
          .invite-btn span:last-child { display: none; }
        }
      `}</style>

      <div className="project-header">
        <div className="project-left">
          <div className="project-ws-icon">
            {(name || "S").charAt(0).toUpperCase()}
          </div>
          <div className="project-title">{name || "Select a workspace"}</div>
          {name && name !== "Select workspace" && (
            <div className="project-badge">Active</div>
          )}
        </div>

        <div className="project-actions">
          {/* ✅ Invite button — shown whenever a workspace is active */}
          {onInviteClick && (
            <button className="invite-btn" onClick={onInviteClick}>
              <span>👥</span> <span>Invite</span>
            </button>
          )}

          <button className="action-btn">
            <span>🔗</span> <span>Share</span>
          </button>
          <button className="action-icon-btn" title="Automations">⚡</button>
          <button className="action-icon-btn" title="More options">⋯</button>
        </div>
      </div>
    </>
  );
}