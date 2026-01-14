export default function BoardTabs({ activeView, setActiveView }) {
  const tabs = ["SUMMARY", "BOARD", "TIMELINE", "REPORTS"];

  return (
    <>
      <style>{`
        .board-tabs {
          display: flex;
          gap: 18px;
          padding: 0 16px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .board-tab {
          background: none;
          border: none;
          padding: 10px 0;
          font-size: 14px;
          cursor: pointer;
          color: #42526e;
        }

        .board-tab.active {
          border-bottom: 2px solid #0052cc;
          font-weight: 600;
          color: #0052cc;
        }
      `}</style>

      <div className="board-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`board-tab ${activeView === tab ? "active" : ""}`}
            onClick={() => setActiveView(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </>
  );
}
