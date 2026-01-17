export default function BoardToolbar({ onAddPeople }) {
  return (
    <>
      <style>{`
        .board-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .toolbar-btn {
          padding: 6px 10px;
          border-radius: 4px;
          border: 1px solid #dfe1e6;
          background: #fff;
          cursor: pointer;
        }

        .avatars {
          display: flex;
          gap: 6px;
        }

        .avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #0052cc;
          color: white;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
      `}</style>

      <div className="board-toolbar">
        <input placeholder="Search board" />

        <button className="toolbar-btn">Filter</button>

        {/* PEOPLE */}
        <div className="avatars">
          <div className="avatar">MM</div>
          <div className="avatar">M</div>
        </div>

        <button className="toolbar-btn" onClick={onAddPeople}>
          Add people
        </button>
      </div>
    </>
  );
}
