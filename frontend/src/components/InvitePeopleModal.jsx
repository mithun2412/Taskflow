import { useEffect, useState } from "react";
import api from "../api/axios";

export default function InvitePeopleModal({ workspaceId, workspaceName, onClose, onSuccess }) {
  const [query,        setQuery]        = useState("");
  const [results,      setResults]      = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [role,         setRole]         = useState("MEMBER");
  const [loading,      setLoading]      = useState(false);
  const [adding,       setAdding]       = useState(false);
  const [done,         setDone]         = useState(false);
  const [error,        setError]        = useState("");

  // ── Search for users NOT yet in this workspace ──────────────────
  useEffect(() => {
    if (!query.trim() || !workspaceId) { setResults([]); return; }

    const delay = setTimeout(() => {
      setLoading(true);
      // ✅ correct endpoint: /search-user/ finds unregistered-to-workspace users
      api.get(`/search-user/?q=${encodeURIComponent(query)}&workspace=${workspaceId}`)
        .then(res  => setResults(res.data || []))
        .catch(()  => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(delay);
  }, [query, workspaceId]);

  const handleAdd = async () => {
    if (!selectedUser) return;
    setAdding(true);
    setError("");
    try {
      // ✅ sends workspace + email + role
      await api.post("/add-workspace-member/", {
        workspace: workspaceId,
        email:     selectedUser.email,
        role,
      });
      setDone(true);
      setTimeout(() => { if (onSuccess) onSuccess(); onClose(); }, 1400);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add user. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

        .im-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          animation: imFadeIn 0.2s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        @keyframes imFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes imSlideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }

        .im-box {
          width: 100%; max-width: 460px;
          background: #13151f;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 28px;
          position: relative;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
          animation: imSlideUp 0.25s cubic-bezier(0.16,1,0.3,1);
          margin: 16px;
        }

        .im-close {
          position: absolute; top: 16px; right: 16px;
          width: 28px; height: 28px; border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.4); font-size: 13px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s;
        }
        .im-close:hover { background: rgba(248,113,113,0.15); color: #f87171; border-color: rgba(248,113,113,0.3); }

        .im-eyebrow {
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #6366f1; margin-bottom: 8px;
        }

        .im-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 700; color: #fff;
          letter-spacing: -0.4px; margin-bottom: 4px;
        }

        .im-sub {
          font-size: 13px; color: rgba(255,255,255,0.35); margin-bottom: 24px;
        }

        .im-sub strong { color: rgba(255,255,255,0.6); }

        /* ── SEARCH ── */
        .im-search-wrap { position: relative; margin-bottom: 8px; }

        .im-search-icon {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.25); font-size: 14px; pointer-events: none;
        }

        .im-search {
          width: 100%; box-sizing: border-box;
          padding: 11px 12px 11px 36px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
          color: #fff; outline: none; transition: border-color 0.15s;
        }
        .im-search::placeholder { color: rgba(255,255,255,0.2); }
        .im-search:focus { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.06); }

        /* ── RESULTS ── */
        .im-results {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; overflow: hidden;
          max-height: 200px; overflow-y: auto;
          background: #1a1d27;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          margin-bottom: 12px;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        .im-result-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; cursor: pointer; transition: background 0.12s;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .im-result-row:last-child { border-bottom: none; }
        .im-result-row:hover { background: rgba(99,102,241,0.1); }

        .im-result-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0;
        }

        .im-result-info { flex: 1; min-width: 0; }
        .im-result-email { font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.8); }
        .im-result-username { font-size: 11.5px; color: rgba(255,255,255,0.3); margin-top: 1px; }

        .im-loading {
          display: flex; align-items: center; gap: 10px;
          padding: 14px; color: rgba(255,255,255,0.3); font-size: 13px;
        }

        .im-no-results {
          padding: 14px; text-align: center;
          color: rgba(255,255,255,0.25); font-size: 13px;
        }

        /* ── SELECTED CHIP ── */
        .im-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 10px; margin-bottom: 14px;
        }

        .im-chip-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
        }

        .im-chip-info { flex: 1; min-width: 0; }
        .im-chip-email { font-size: 13px; font-weight: 500; color: #818cf8; }
        .im-chip-name  { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 1px; }

        .im-chip-remove {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.25); font-size: 14px; padding: 2px;
          transition: color 0.15s; flex-shrink: 0;
        }
        .im-chip-remove:hover { color: #f87171; }

        /* ── ROLE SELECTOR ── */
        .im-role-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; color: rgba(255,255,255,0.25);
          margin-bottom: 8px; display: block;
        }

        .im-role-options {
          display: flex; gap: 8px; margin-bottom: 20px;
        }

        .im-role-option {
          flex: 1; padding: 10px 14px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 9px; cursor: pointer; transition: all 0.15s;
          text-align: center;
        }
        .im-role-option:hover { border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.06); }
        .im-role-option.selected {
          border-color: #6366f1;
          background: rgba(99,102,241,0.12);
        }

        .im-role-name {
          font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.7); margin-bottom: 3px;
        }
        .im-role-option.selected .im-role-name { color: #818cf8; }

        .im-role-desc {
          font-size: 11px; color: rgba(255,255,255,0.3); line-height: 1.4;
        }

        /* ── ERROR ── */
        .im-error {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 12px; border-radius: 8px;
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.2);
          color: #f87171; font-size: 13px; margin-bottom: 14px;
        }

        /* ── ACTIONS ── */
        .im-actions {
          display: flex; justify-content: flex-end; gap: 8px;
        }

        .im-cancel {
          padding: 9px 18px; border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.1);
          background: none; color: rgba(255,255,255,0.45);
          font-size: 13.5px; font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.15s;
        }
        .im-cancel:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); }

        .im-invite {
          padding: 9px 24px; border-radius: 9px; border: none;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; font-size: 13.5px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
          min-width: 100px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          box-shadow: 0 2px 10px rgba(99,102,241,0.3);
        }
        .im-invite:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(99,102,241,0.45); }
        .im-invite:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        /* ── SUCCESS ── */
        .im-success {
          display: flex; flex-direction: column; align-items: center;
          padding: 24px 0 8px; gap: 12px;
          animation: imFadeIn 0.25s ease;
        }
        .im-success-icon { font-size: 44px; }
        .im-success-text { font-size: 16px; font-weight: 600; color: #34d399; }
        .im-success-sub  { font-size: 13px; color: rgba(255,255,255,0.35); }

        /* ── SPINNER ── */
        .im-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff; border-radius: 50%;
          animation: imSpin 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes imSpin { to { transform: rotate(360deg) } }
      `}</style>

      <div className="im-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="im-box">
          <button className="im-close" onClick={onClose}>✕</button>

          {done ? (
            <div className="im-success">
              <div className="im-success-icon">🎉</div>
              <div className="im-success-text">Member added!</div>
              <div className="im-success-sub">
                {selectedUser?.email} has been added as <strong>{role}</strong>
              </div>
            </div>
          ) : (
            <>
              <p className="im-eyebrow">Workspace members</p>
              <h2 className="im-title">Invite people</h2>
              <p className="im-sub">
                Add members to <strong>{workspaceName || "this workspace"}</strong>.
                They'll see all projects inside it.
              </p>

              {/* Search */}
              <div className="im-search-wrap">
                <span className="im-search-icon">✉</span>
                <input
                  className="im-search"
                  placeholder="Search by email address…"
                  value={query}
                  autoFocus
                  onChange={e => {
                    setQuery(e.target.value);
                    setSelectedUser(null);
                    setError("");
                  }}
                />
              </div>

              {/* Results dropdown */}
              {!selectedUser && (loading || results.length > 0 || (query.trim() && !loading)) && (
                <div className="im-results">
                  {loading && (
                    <div className="im-loading">
                      <div className="im-spinner" /> Searching…
                    </div>
                  )}
                  {!loading && results.length === 0 && query.trim() && (
                    <div className="im-no-results">
                      No registered users found matching "{query}"
                    </div>
                  )}
                  {!loading && results.map(user => (
                    <div key={user.id} className="im-result-row"
                      onClick={() => {
                        setSelectedUser(user);
                        setQuery(user.email);
                        setResults([]);
                        setError("");
                      }}>
                      <div className="im-result-avatar">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="im-result-info">
                        <div className="im-result-email">{user.email}</div>
                        <div className="im-result-username">@{user.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected user chip */}
              {selectedUser && (
                <div className="im-chip">
                  <div className="im-chip-avatar">
                    {selectedUser.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="im-chip-info">
                    <div className="im-chip-email">{selectedUser.email}</div>
                    <div className="im-chip-name">@{selectedUser.username}</div>
                  </div>
                  <button className="im-chip-remove"
                    onClick={() => { setSelectedUser(null); setQuery(""); setError(""); }}>
                    ✕
                  </button>
                </div>
              )}

              {/* Role selector */}
              <span className="im-role-label">Assign role</span>
              <div className="im-role-options">
                <div className={`im-role-option ${role === "MEMBER" ? "selected" : ""}`}
                  onClick={() => setRole("MEMBER")}>
                  <div className="im-role-name">Member</div>
                  <div className="im-role-desc">Can view & edit tasks</div>
                </div>
                <div className={`im-role-option ${role === "ADMIN" ? "selected" : ""}`}
                  onClick={() => setRole("ADMIN")}>
                  <div className="im-role-name">Admin</div>
                  <div className="im-role-desc">Full workspace control</div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="im-error">
                  <span>⚠</span> {error}
                </div>
              )}

              {/* Actions */}
              <div className="im-actions">
                <button className="im-cancel" onClick={onClose}>Cancel</button>
                <button className="im-invite" onClick={handleAdd}
                  disabled={!selectedUser || adding}>
                  {adding
                    ? <><div className="im-spinner" /> Adding…</>
                    : `Invite as ${role}`
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}