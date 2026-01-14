export default function KanbanBoard() {
  const columns = ["TO DO", "IN PROGRESS", "IN REVIEW", "DONE"];

  return (
    <>
      <style>{`
        .kanban-board {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: #f4f5f7;
          min-height: 60vh;
        }

        .kanban-column {
          background: #ebecf0;
          border-radius: 6px;
          padding: 12px;
          width: 260px;
        }

        .kanban-column h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
        }

        .kanban-task {
          background: white;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 8px;
          font-size: 14px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
      `}</style>

      <div className="kanban-board">
        {columns.map(col => (
          <div key={col} className="kanban-column">
            <h4>{col}</h4>
            <div className="kanban-task">Sample task</div>
          </div>
        ))}
      </div>
    </>
  );
}
