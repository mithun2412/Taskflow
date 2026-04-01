import { useEffect, useState } from "react";
import api from "../api/axios";

export default function InvitePeopleModal({ workspaceId, onClose, onSuccess }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const delay = setTimeout(() => {
      setLoading(true);
      api.get(`/users/search/?q=${encodeURIComponent(query)}`)
        .then(res => setResults(res.data || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  const handleAdd = async () => {
    if (!selectedUser) return;
    setAdding(true);
    try {
      await api.post("/add-workspace-member/", {
        workspace: workspaceId,
        email: selectedUser.email,
      });
      setDone(true);
      setTimeout(() => { if (onSuccess) onSuccess(); onClose(); }, 1200);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add user");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(15,20,40,0.55);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(3px);
          animation: fadeIn 0.2s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

        .modal-box {
          width: 100%;
          max-width: 440px;
          background: #fff;
          border-radius: 16px;
          padding: 28px;
          position: relative;
          box-shadow: 0 24px 60px rgba(15,20,40,0.22);
          animation: slideUp 0.22s ease;
          margin: 16px;
        }

        .modal-close {
          position: absolute;
          top: 16px; right: 16px;
          width: 30px; height: 30px;
          border-radius: 8px;
          border: none;
          background: #f5f6fb;
          color: #8b95a9;
          font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }

        .modal-close:hover { background: #eef0f5; color: #2d3452; }

        .modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a1f36;
          letter-spacing: -0.2px;
          margin: 0 0 4px;
        }

        .modal-sub {
          font-size: 13.5px;
          color: #8b95a9;
          margin: 0 0 20px;
        }

        .search-input-wrap {
          position: relative;
          margin-bottom: 4px;
        }

        .search-prefix {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%);
          font-size: 15px;
          pointer-events: none;
          color: #b0b9cc;
        }

        .invite-search {
          width: 100%; box-sizing: border-box;
          padding: 10px 12px 10px 36px;
          border: 1.5px solid #e2e5ef;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1a1f36;
          outline: none;
          transition: border-color 0.15s;
        }

        .invite-search:focus { border-color: #4f8ef7; }

        .results-list {
          border: 1.5px solid #eef0f5;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 6px;
          max-height: 180px;
          overflow-y: auto;
          scrollbar-width: thin;
          background: #fff;
          box-shadow: 0 4px 16px rgba(0,0,0,0.07);
        }

        .result-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          cursor: pointer;
          transition: background 0.12s;
        }

        .result-row:hover { background: #f5f6fb; }

        .result-avatar {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f8ef7, #7c5cfc);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #fff;
          flex-shrink: 0;
        }

        .result-email {
          font-size: 13.5px;
          color: #2d3452;
          font-weight: 500;
        }

        .loading-text {
          font-size: 13px;
          color: #aab0c0;
          padding: 10px 14px;
          display: flex; align-items: center; gap: 8px;
        }

        .spinner {
          width: 14px; height: 14px;
          border: 2px solid #e2e5ef;
          border-top-color: #4f8ef7;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg) } }

        .selected-user-chip {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 12px;
          background: #eff4ff;
          border: 1.5px solid #c7d3f5;
          border-radius: 10px;
          margin-top: 10px;
          font-size: 13px;
          color: #3360cc;
          font-weight: 500;
        }

        .chip-remove {
          margin-left: auto;
          cursor: pointer;
          color: #8b95a9;
          font-size: 14px;
          transition: color 0.15s;
        }

        .chip-remove:hover { color: #ef4444; }

        .modal-actions {
          display: flex; justify-content: flex-end; gap: 8px;
          margin-top: 20px;
        }

        .cancel-btn {
          padding: 9px 18px;
          border-radius: 9px;
          border: 1.5px solid #eef0f5;
          background: #fff;
          color: #5a627a;
          font-size: 13.5px;
          font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
        }

        .cancel-btn:hover { background: #f5f6fb; }

        .invite-btn {
          padding: 9px 20px;
          border-radius: 9px;
          border: none;
          background: linear-gradient(135deg, #4f8ef7, #7c5cfc);
          color: #fff;
          font-size: 13.5px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(79,142,247,0.3);
          min-width: 90px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        .invite-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(79,142,247,0.4);
        }

        .invite-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .success-state {
          display: flex; flex-direction: column; align-items: center;
          padding: 20px 0 8px;
          gap: 10px;
          animation: fadeIn 0.2s ease;
        }

        .success-icon {
          font-size: 40px;
        }

        .success-text {
          font-size: 15px;
          font-weight: 600;
          color: #10b981;
        }
      `}</style>

      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-box">
          <button className="modal-close" onClick={onClose}>✕</button>

          {done ? (
            <div className="success-state">
              <div className="success-icon">🎉</div>
              <div className="success-text">Member added successfully!</div>
            </div>
          ) : (
            <>
              <div className="modal-title">Invite people</div>
              <div className="modal-sub">Search by email to add members to this workspace</div>

              <div className="search-input-wrap">
                <span className="search-prefix">✉</span>
                <input
                  className="invite-search"
                  placeholder="Search by email address…"
                  value={query}
                  autoFocus
                  onChange={e => { setQuery(e.target.value); setSelectedUser(null); }}
                />
              </div>

              {loading && (
                <div className="results-list">
                  <div className="loading-text"><div className="spinner" /> Searching…</div>
                </div>
              )}

              {!loading && results.length > 0 && !selectedUser && (
                <div className="results-list">
                  {results.map(user => (
                    <div key={user.id} className="result-row" onClick={() => { setSelectedUser(user); setQuery(user.email); setResults([]); }}>
                      <div className="result-avatar">{user.email.charAt(0).toUpperCase()}</div>
                      <div className="result-email">{user.email}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedUser && (
                <div className="selected-user-chip">
                  <div style={{ width:22,height:22,borderRadius:"50%",background:"linear-gradient(135deg,#4f8ef7,#7c5cfc)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0 }}>
                    {selectedUser.email.charAt(0).toUpperCase()}
                  </div>
                  {selectedUser.email}
                  <span className="chip-remove" onClick={() => { setSelectedUser(null); setQuery(""); }}>✕</span>
                </div>
              )}

              <div className="modal-actions">
                <button className="cancel-btn" onClick={onClose}>Cancel</button>
                <button
                  className="invite-btn"
                  onClick={handleAdd}
                  disabled={!selectedUser || adding}
                >
                  {adding ? <><div className="spinner" style={{borderColor:"rgba(255,255,255,0.3)",borderTopColor:"#fff"}} /> Adding…</> : "Invite"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}