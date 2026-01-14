export default function BoardToolbar() {
  return (
    <>
      <style>{`
        .board-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: white;
        }

        .board-toolbar input {
          padding: 6px 10px;
          border-radius: 4px;
          border: 1px solid #dfe1e6;
        }

        .board-toolbar button {
          background: #f4f5f7;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        }

        .complete-sprint {
          margin-left: auto;
          background: #0052cc !important;
          color: white;
        }
      `}</style>

      <div className="board-toolbar">
        <input placeholder="Search board" />
        <button>Filter</button>
        <button className="complete-sprint">Complete sprint</button>
      </div>
    </>
  );
}
