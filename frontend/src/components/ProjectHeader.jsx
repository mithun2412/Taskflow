export default function ProjectHeader({ name }) {
  return (
    <>
      <style>{`
        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: white;
        }

        .project-title {
          font-size: 20px;
          font-weight: 600;
        }

        .project-actions button {
          margin-left: 8px;
          background: #f4f5f7;
          border: none;
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>

      <div className="project-header">
        <div className="project-title">{name}</div>

        <div className="project-actions">
          <button>Share</button>
          <button>⚡</button>
          <button>⋯</button>
        </div>
      </div>
    </>
  );
}
