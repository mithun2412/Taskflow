export default function BoardTabs({ activeView, setActiveView }) {
  const tabs = [
    { id: "SUMMARY", label: "Summary", icon: "📊" },
    { id: "BOARD", label: "Board", icon: "▦" },
    { id: "TIMELINE", label: "Timeline", icon: "📅" },
    { id: "REPORTS", label: "Reports", icon: "📈" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .board-tabs-wrapper {
          display: flex;
          align-items: center;
          padding: 0 20px;
          background: #fff;
          border-bottom: 1px solid #eef0f5;
          gap: 2px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .board-tabs-wrapper::-webkit-scrollbar { display: none; }

        .board-tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 12px 14px;
          border: none;
          background: none;
          font-size: 13.5px;
          font-weight: 500;
          color: #8b95a9;
          cursor: pointer;
          position: relative;
          white-space: nowrap;
          font-family: 'Plus Jakarta Sans', sans-serif;
          border-radius: 0;
          transition: color 0.15s;
        }

        .board-tab-btn::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 2px 2px 0 0;
          background: #4f8ef7;
          transform: scaleX(0);
          transition: transform 0.2s cubic-bezier(0.4,0,0.2,1);
        }

        .board-tab-btn:hover {
          color: #2d3452;
        }

        .board-tab-btn.active {
          color: #4f8ef7;
          font-weight: 600;
        }

        .board-tab-btn.active::after {
          transform: scaleX(1);
        }

        .tab-icon {
          font-size: 14px;
          opacity: 0.7;
        }

        .board-tab-btn.active .tab-icon {
          opacity: 1;
        }
      `}</style>

      <div className="board-tabs-wrapper">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`board-tab-btn ${activeView === tab.id ? "active" : ""}`}
            onClick={() => setActiveView(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </>
  );
}