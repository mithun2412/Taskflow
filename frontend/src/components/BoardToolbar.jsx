import { useState } from "react";

const MOCK_MEMBERS = [
  { initials: "MM", color: "linear-gradient(135deg,#4f8ef7,#7c5cfc)" },
  { initials: "M",  color: "linear-gradient(135deg,#f97316,#ec4899)" },
  { initials: "AK", color: "linear-gradient(135deg,#10b981,#4f8ef7)" },
];

export default function BoardToolbar({ onAddPeople }) {
  const [searchVal, setSearchVal] = useState("");
  const [activeFilter, setActiveFilter] = useState(false);
  const [activeGroup, setActiveGroup]   = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .board-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #fff;
          border-bottom: 1px solid #eef0f5;
          font-family: 'Plus Jakarta Sans', sans-serif;
          flex-wrap: wrap;
        }

        /* ---- search ---- */
        .toolbar-search-wrap {
          position: relative;
          flex: 0 1 220px;
          min-width: 120px;
        }

        .toolbar-search-icon {
          position: absolute;
          left: 10px; top: 50%;
          transform: translateY(-50%);
          font-size: 13px;
          color: #b0b9cc;
          pointer-events: none;
        }

        .toolbar-search {
          width: 100%; box-sizing: border-box;
          padding: 7px 10px 7px 30px;
          border: 1.5px solid #e2e5ef;
          border-radius: 9px;
          font-size: 13px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1a1f36;
          background: #f8f9fc;
          outline: none;
          transition: all 0.18s;
        }

        .toolbar-search::placeholder { color: #b0b9cc; }

        .toolbar-search:focus {
          border-color: #4f8ef7;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(79,142,247,0.1);
        }

        /* ---- divider ---- */
        .toolbar-divider {
          width: 1px;
          height: 22px;
          background: #eef0f5;
          flex-shrink: 0;
        }

        /* ---- icon/text buttons ---- */
        .t-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1.5px solid #e2e5ef;
          background: #fff;
          color: #5a627a;
          font-size: 13px;
          font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .t-btn:hover {
          border-color: #c7d3f5;
          background: #f5f7ff;
          color: #2d3452;
        }

        .t-btn.active {
          border-color: #4f8ef7;
          background: #eff4ff;
          color: #4f8ef7;
        }

        .t-btn-icon { font-size: 14px; }

        /* ---- avatars ---- */
        .toolbar-avatars {
          display: flex;
          align-items: center;
        }

        .t-avatar {
          width: 30px; height: 30px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff;
          border: 2.5px solid #fff;
          margin-left: -8px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          position: relative;
          box-shadow: 0 1px 4px rgba(0,0,0,0.12);
        }

        .t-avatar:first-child { margin-left: 0; }

        .t-avatar:hover {
          transform: translateY(-2px) scale(1.08);
          box-shadow: 0 4px 10px rgba(0,0,0,0.18);
          z-index: 2;
        }

        .t-avatar-more {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: #f0f2f8;
          border: 2.5px solid #fff;
          margin-left: -8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 10.5px; font-weight: 700; color: #7a839a;
          cursor: pointer;
          transition: background 0.15s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        .t-avatar-more:hover { background: #e2e5ef; }

        /* ---- add people ---- */
        .add-people-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px;
          border-radius: 9px;
          border: none;
          background: linear-gradient(135deg, #4f8ef7, #7c5cfc);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(79,142,247,0.28);
          transition: all 0.18s;
          white-space: nowrap;
          margin-left: auto;
        }

        .add-people-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(79,142,247,0.38);
        }

        .add-people-btn:active { transform: none; }

        @media (max-width: 600px) {
          .toolbar-search-wrap { flex: 1; }
          .t-btn span { display: none; }
          .add-people-btn span { display: none; }
          .toolbar-divider { display: none; }
        }
      `}</style>

      <div className="board-toolbar">
        {/* Search */}
        <div className="toolbar-search-wrap">
          <span className="toolbar-search-icon">🔍</span>
          <input
            className="toolbar-search"
            placeholder="Search board…"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
          />
        </div>

        <div className="toolbar-divider" />

        {/* Filter */}
        <button
          className={`t-btn ${activeFilter ? "active" : ""}`}
          onClick={() => setActiveFilter(f => !f)}
        >
          <span className="t-btn-icon">⚙</span>
          <span>Filter</span>
          {activeFilter && <span style={{ fontSize:10, marginLeft:2 }}>✕</span>}
        </button>

        {/* Group by */}
        <button
          className={`t-btn ${activeGroup ? "active" : ""}`}
          onClick={() => setActiveGroup(g => !g)}
        >
          <span className="t-btn-icon">⊟</span>
          <span>Group by</span>
        </button>

        <div className="toolbar-divider" />

        {/* Member avatars */}
        <div className="toolbar-avatars">
          {MOCK_MEMBERS.map((m, i) => (
            <div
              key={i}
              className="t-avatar"
              style={{ background: m.color }}
              title={m.initials}
            >
              {m.initials}
            </div>
          ))}
          <div className="t-avatar-more" title="More members">+4</div>
        </div>

        {/* Add people */}
        <button className="add-people-btn" onClick={onAddPeople}>
          <span>👤</span>
          <span>Add people</span>
        </button>
      </div>
    </>
  );
}