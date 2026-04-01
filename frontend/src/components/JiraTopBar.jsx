import { useState } from "react";

export default function JiraTopBar({ onCreateClick }) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .topbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 20px;
          height: 56px;
          background: #1a1f36;
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .topbar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 17px;
          color: #fff;
          letter-spacing: -0.3px;
          white-space: nowrap;
          text-decoration: none;
        }

        .logo-icon {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #4f8ef7, #7c5cfc);
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 800;
          color: white;
          flex-shrink: 0;
        }

        .topbar-nav {
          display: flex;
          align-items: center;
          gap: 2px;
          margin-left: 8px;
        }

        .nav-item {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.65);
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          border: none;
          background: none;
        }

        .nav-item:hover {
          color: #fff;
          background: rgba(255,255,255,0.08);
        }

        .search-wrapper {
          flex: 1;
          max-width: 400px;
          margin-left: auto;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.35);
          font-size: 14px;
          pointer-events: none;
        }

        .topbar-search {
          width: 100%;
          padding: 7px 12px 7px 32px;
          border-radius: 8px;
          border: 1.5px solid ${searchFocused ? 'rgba(79,142,247,0.7)' : 'rgba(255,255,255,0.12)'};
          background: rgba(255,255,255,0.07);
          color: #fff;
          font-size: 13.5px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .topbar-search::placeholder {
          color: rgba(255,255,255,0.3);
        }

        .topbar-search:focus {
          background: rgba(255,255,255,0.1);
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: 8px;
        }

        .icon-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: none;
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.15s;
        }

        .icon-btn:hover {
          background: rgba(255,255,255,0.13);
          color: #fff;
        }

        .create-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #4f8ef7, #7c5cfc);
          color: white;
          font-size: 13.5px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(79,142,247,0.35);
        }

        .create-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(79,142,247,0.45);
        }

        .create-btn:active {
          transform: translateY(0);
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316, #ec4899);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.15);
          transition: border-color 0.15s;
        }

        .avatar:hover {
          border-color: rgba(255,255,255,0.4);
        }

        @media (max-width: 768px) {
          .topbar-nav { display: none; }
          .search-wrapper { max-width: 180px; }
        }
      `}</style>

      <div className="topbar">
        <a className="topbar-logo">
          <div className="logo-icon">T</div>
          TaskFlow
        </a>

        <div className="topbar-nav">
          <button className="nav-item">My Work</button>
          <button className="nav-item">Projects</button>
          <button className="nav-item">Teams</button>
        </div>

        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="topbar-search"
            placeholder="Search tasks, projects…"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        <div className="topbar-right">
          <button className="icon-btn" title="Notifications">🔔</button>
          <button className="icon-btn" title="Help">?</button>
          <button className="create-btn" onClick={onCreateClick}>
            + Create
          </button>
          <div className="avatar" title="Profile">U</div>
        </div>
      </div>
    </>
  );
}