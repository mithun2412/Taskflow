import { useEffect, useState } from "react";
import api from "../api/axios";

export default function InvitePeopleModal({ workspaceId, onClose, onSuccess }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  /* ---------------- SEARCH USERS ---------------- */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(() => {
      setLoading(true);

      api
        .get(`/users/search/?q=${encodeURIComponent(query)}`)
        .then(res => setResults(res.data || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  /* ---------------- ADD USER ---------------- */
  const handleAdd = async () => {
    if (!selectedUser) {
      alert("Please select a user from the list");
      return;
    }

    setAdding(true);

    try {
      await api.post("/add-workspace-member/", {
        workspace: workspaceId,
        email: selectedUser.email,
      });

      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add user");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <style>{`
        .invite-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .invite-modal {
          width: 420px;
          background: white;
          border-radius: 8px;
          padding: 20px;
          position: relative;
        }

        .search-box {
          width: 100%;
          padding: 8px;
          border: 1px solid #DFE1E6;
          border-radius: 4px;
        }

        .results {
          border: 1px solid #DFE1E6;
          margin-top: 4px;
          border-radius: 4px;
          max-height: 160px;
          overflow-y: auto;
          background: white;
        }

        .result-item {
          padding: 8px;
          cursor: pointer;
        }

        .result-item:hover {
          background: #F4F5F7;
        }

        .loading {
          padding: 8px;
          font-size: 12px;
          color: #6B778C;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 16px;
        }
      `}</style>

      <div className="invite-backdrop">
        <div className="invite-modal">
          <h3>Add people</h3>

          <input
            className="search-box"
            placeholder="Search registered email"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedUser(null);
            }}
          />

          {loading && <div className="loading">Searching…</div>}

          {!loading && results.length > 0 && (
            <div className="results">
              {results.map(user => (
                <div
                  key={user.id}
                  className="result-item"
                  onClick={() => {
                    setSelectedUser(user);
                    setQuery(user.email);
                    setResults([]);
                  }}
                >
                  {user.email}
                </div>
              ))}
            </div>
          )}

          <div className="actions">
            <button onClick={onClose}>Cancel</button>
            <button
              onClick={handleAdd}
              disabled={!selectedUser || adding}
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
