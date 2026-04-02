import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function JiraTopBar({ onCreateClick, onInviteClick, selectedWorkspace }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [currentUser,   setCurrentUser]   = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/me/")
      .then(r => setCurrentUser(r.data))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const isAdmin = selectedWorkspace?.is_admin;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

        .topbar {
          display: flex; align-items: center; gap: 12px;
          padding: 0 20px; height: 56px;
          background: #0f1117;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky; top: 0; z-index: 50;
          font-family: 'Plus Jakarta Sans', sans-serif;
          flex-shrink: 0;
        }

        .topbar-logo {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Syne', sans-serif;
          font-weight: 700; font-size: 17px; color: #fff;
          letter-spacing: -0.3px; white-space: nowrap;
          text-decoration: none; cursor: pointer;
        }

        .logo-icon {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800; color: white; flex-shrink: 0;
        }

        .topbar-nav {
          display: flex; align-items: center; gap: 2px; margin-left: 8px;
        }

        .nav-item {
          padding: 6px 12px; border-radius: 6px;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.45); cursor: pointer;
          transition: all 0.15s; white-space: nowrap; border: none; background: none;
        }
        .nav-item:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.07); }

        .search-wrapper {
          flex: 1; max-width: 360px; margin-left: auto; position: relative;
        }

        .search-icon {
          position: absolute; left: 10px; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.25); font-size: 13px; pointer-events: none;
        }

        .topbar-search {
          width: 100%;
          padding: 7px 12px 7px 30px;
          border-radius: 8px;
          border: 1px solid ${`rgba(255,255,255,0.08)`};
          background: rgba(255,255,255,0.05);
          color: #fff; font-size: 13px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none; transition: all 0.2s; box-sizing: border-box;
        }
        .topbar-search::placeholder { color: rgba(255,255,255,0.2); }
        .topbar-search:focus {
          border-color: rgba(99,102,241,0.4);
          background: rgba(99,102,241,0.06);
        }

        .topbar-right {
          display: flex; align-items: center; gap: 8px; margin-left: 8px;
        }

        .icon-btn {
          width: 32px; height: 32px; border-radius: 8px; border: none;
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.45);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 15px; transition: all 0.15s;
        }
        .icon-btn:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }

        /* Invite button — only shown to admins */
        .invite-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 8px;
          border: 1px solid rgba(99,102,241,0.3);
          background: rgba(99,102,241,0.1);
          color: #818cf8; font-size: 13px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.15s; white-space: nowrap;
        }
        .invite-btn:hover { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.5); }

        .create-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 16px; border-radius: 8px; border: none;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; font-size: 13px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
          box-shadow: 0 2px 8px rgba(99,102,241,0.3);
        }
        .create-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(99,102,241,0.45); }
        .create-btn:active { transform: translateY(0); }

        .avatar-wrap { position: relative; }

        .avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #f97316, #ec4899);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: white;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.1);
          transition: border-color 0.15s;
        }
        .avatar:hover { border-color: rgba(255,255,255,0.3); }

        .avatar-menu {
          position: absolute; top: 38px; right: 0;
          background: #1a1d27;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 6px;
          min-width: 160px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          z-index: 200;
          animation: menuIn 0.15s ease;
        }
        @keyframes menuIn { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:translateY(0) } }

        .avatar-menu-item {
          padding: 8px 12px; border-radius: 7px; cursor: pointer;
          font-size: 13px; color: rgba(255,255,255,0.6);
          transition: all 0.12s;
        }
        .avatar-menu-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.9); }
        .avatar-menu-item.danger:hover { background: rgba(248,113,113,0.1); color: #f87171; }

        .avatar-menu-user {
          padding: 8px 12px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 4px;
        }
        .avatar-menu-name  { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }
        .avatar-menu-email { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 1px; }

        @media (max-width: 768px) {
          .topbar-nav { display: none; }
          .search-wrapper { max-width: 160px; }
          .invite-btn span { display: none; }
        }
      `}</style>

      <TopBarContent
        searchFocused={searchFocused}
        setSearchFocused={setSearchFocused}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onCreateClick={onCreateClick}
        onInviteClick={onInviteClick}
        handleLogout={handleLogout}
        selectedWorkspace={selectedWorkspace}
      />
    </>
  );
}

// Separated so style tag doesn't re-render on state changes
function TopBarContent({ searchFocused, setSearchFocused, currentUser, isAdmin,
  onCreateClick, onInviteClick, handleLogout, selectedWorkspace }) {

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="topbar">
      <a className="topbar-logo">
        <div className="logo-icon">⚡</div>
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

        {/* ✅ Invite button — only visible to workspace admins */}
        {isAdmin && selectedWorkspace && (
          <button className="invite-btn" onClick={onInviteClick} title="Invite people">
            👥 <span>Invite</span>
          </button>
        )}

        <button className="create-btn" onClick={onCreateClick}>
          + Create
        </button>

        {/* Avatar + dropdown */}
        <div className="avatar-wrap">
          <div className="avatar" title={currentUser?.username || "Profile"}
            onClick={() => setMenuOpen(o => !o)}>
            {currentUser?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>

          {menuOpen && (
            <div className="avatar-menu" onMouseLeave={() => setMenuOpen(false)}>
              {currentUser && (
                <div className="avatar-menu-user">
                  <div className="avatar-menu-name">{currentUser.username}</div>
                  <div className="avatar-menu-email">{currentUser.email}</div>
                </div>
              )}
              <div className="avatar-menu-item">Profile</div>
              <div className="avatar-menu-item">Settings</div>
              <div className="avatar-menu-item danger" onClick={handleLogout}>
                Sign out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}