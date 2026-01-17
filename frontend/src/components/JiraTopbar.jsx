export default function JiraTopBar({ onCreateClick }) {
  return (
    <>
      <style>{`
        .jira-topbar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 10px 16px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }
        .jira-logo {
          font-weight: 600;
          color: #0052cc;
          font-size: 18px;
        }
        .jira-search {
          flex: 1;
          padding: 6px 10px;
          border-radius: 4px;
          border: 1px solid #dfe1e6;
        }
        .jira-create {
          background: #0052cc;
          color: white;
          border: none;
          padding: 6px 14px;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
        }
      `}</style>

      <div className="jira-topbar">
        <div className="jira-logo">TaskFlow</div>
        <input className="jira-search" placeholder="Search" />
        <button className="jira-create" onClick={onCreateClick}>
          + Create
        </button>
      </div>
    </>
  );
}
