import { useEffect, useState } from "react";
import api from "../api/axios";

export default function WorkspaceSidebar({
  selectedWorkspace, setSelectedWorkspace,
  selectedProject,   setSelectedProject,
}) {
  const [workspaces,          setWorkspaces]          = useState([]);
  const [projects,            setProjects]            = useState([]);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName,    setNewWorkspaceName]    = useState("");
  const [showCreateProject,   setShowCreateProject]   = useState(false);
  const [newProjectName,      setNewProjectName]      = useState("");
  const [collapsed,           setCollapsed]           = useState(false);

  const loadWorkspaces = async () => {
    const res = await api.get("/workspaces/");
    setWorkspaces(res.data);
    if (res.data.length && !selectedWorkspace) setSelectedWorkspace(res.data[0]);
  };

  const loadProjects = async (workspaceId) => {
    const res = await api.get(`/projects/?workspace=${workspaceId}`);
    setProjects(res.data);
    // auto-select first project so a board loads immediately
    if (res.data.length) setSelectedProject(res.data[0]);
  };

  useEffect(() => { loadWorkspaces(); }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      setProjects([]);
      setSelectedProject(null);
      loadProjects(selectedWorkspace.id);
    }
  }, [selectedWorkspace?.id]);

  const createWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    await api.post("/workspaces/", { name: newWorkspaceName });
    setNewWorkspaceName(""); setShowCreateWorkspace(false); loadWorkspaces();
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    await api.post("/projects/", { name: newProjectName, workspace: selectedWorkspace.id });
    setNewProjectName(""); setShowCreateProject(false);
    loadProjects(selectedWorkspace.id);
  };

  // ✅ use per-workspace is_admin (not any workspace)
  const isAdmin = selectedWorkspace?.is_admin;
  const wsColors = ["#4f8ef7","#7c5cfc","#10b981","#f59e0b","#ef4444","#ec4899"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .sidebar {
          width: ${collapsed ? "60px" : "260px"};
          min-height: calc(100vh - 56px);
          background: #0f1117;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column;
          padding: ${collapsed ? "12px 8px" : "16px 12px"};
          transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative; flex-shrink: 0;
        }

        .collapse-btn {
          position: absolute; top: 16px; right: 10px;
          width: 24px; height: 24px; border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: rgba(255,255,255,0.3); transition: all 0.15s; z-index: 10;
        }
        .collapse-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }

        .sidebar-section-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.25);
          padding: 0 6px; margin: 18px 0 6px; white-space: nowrap;
          opacity: ${collapsed ? 0 : 1}; transition: opacity 0.15s;
          display: flex; align-items: center; justify-content: space-between;
        }

        .section-add-btn {
          width: 18px; height: 18px; border-radius: 4px; border: none;
          background: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; line-height: 1; color: rgba(255,255,255,0.25);
          transition: all 0.15s;
        }
        .section-add-btn:hover { background: rgba(255,255,255,0.08); color: #818cf8; }

        .ws-item {
          display: flex; align-items: center; gap: 10px; padding: 8px 8px;
          border-radius: 8px; cursor: pointer; transition: all 0.15s;
          position: relative; overflow: hidden; min-width: 0;
        }
        .ws-item:hover  { background: rgba(255,255,255,0.05); }
        .ws-item.active { background: rgba(99,102,241,0.15); }

        .ws-avatar {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
        }

        .ws-name {
          font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.6);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          opacity: ${collapsed ? 0 : 1}; transition: opacity 0.15s;
        }
        .ws-item.active .ws-name { color: #818cf8; font-weight: 600; }

        .active-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #818cf8;
          margin-left: auto; flex-shrink: 0;
          opacity: ${collapsed ? 0 : 1}; transition: opacity 0.15s;
        }

        /* ── PROJECT ITEMS ── */
        .proj-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 8px 8px 14px;
          border-radius: 8px; cursor: pointer; transition: all 0.15s; min-width: 0;
        }
        .proj-item:hover  { background: rgba(255,255,255,0.04); }
        .proj-item.active { background: rgba(99,102,241,0.12); }

        .proj-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(255,255,255,0.15); flex-shrink: 0;
          transition: background 0.15s;
        }
        .proj-item:hover  .proj-dot { background: #818cf8; }
        .proj-item.active .proj-dot { background: #818cf8; }

        .proj-name {
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.45);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          opacity: ${collapsed ? 0 : 1}; transition: opacity 0.15s;
        }
        .proj-item.active .proj-name { color: #818cf8; font-weight: 600; }

        .create-input-row {
          display: flex; gap: 6px; margin-bottom: 6px; padding: 0 4px;
          opacity: ${collapsed ? 0 : 1};
          pointer-events: ${collapsed ? "none" : "all"};
          transition: opacity 0.15s;
        }
        .create-input {
          flex: 1; padding: 6px 10px;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 7px;
          background: rgba(255,255,255,0.05); font-size: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #fff; outline: none; min-width: 0; transition: border-color 0.15s;
        }
        .create-input::placeholder { color: rgba(255,255,255,0.2); }
        .create-input:focus { border-color: rgba(99,102,241,0.5); }

        .create-add-btn {
          padding: 6px 12px; border-radius: 7px; border: none;
          background: #6366f1; color: #fff; font-size: 12px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; white-space: nowrap; transition: background 0.15s;
        }
        .create-add-btn:hover { background: #4f46e5; }

        .sidebar-bottom {
          margin-top: auto; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px;
        }
        .sidebar-bottom-item {
          display: flex; align-items: center; gap: 10px; padding: 8px 8px;
          border-radius: 8px; cursor: pointer; font-size: 13px;
          color: rgba(255,255,255,0.3); font-weight: 400; transition: all 0.15s;
        }
        .sidebar-bottom-item:hover { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.7); }
        .sidebar-bottom-item span:last-child {
          opacity: ${collapsed ? 0 : 1}; transition: opacity 0.15s; white-space: nowrap;
        }

        @media (max-width: 640px) {
          .sidebar { width: 56px !important; }
          .ws-name, .proj-name, .sidebar-bottom-item span:last-child,
          .sidebar-section-label, .create-input-row { opacity: 0 !important; }
          .collapse-btn { display: none; }
        }
      `}</style>

      <div className="sidebar">
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}>
          {collapsed ? "›" : "‹"}
        </button>

        {/* WORKSPACES */}
        <div className="sidebar-section-label" style={{ marginTop: collapsed ? 36 : 8 }}>
          <span>Workspaces</span>
          {isAdmin && !collapsed && (
            <button className="section-add-btn"
              onClick={() => setShowCreateWorkspace(!showCreateWorkspace)}>+</button>
          )}
        </div>

        {showCreateWorkspace && isAdmin && (
          <div className="create-input-row">
            <input className="create-input" placeholder="Workspace name…"
              value={newWorkspaceName}
              onChange={e => setNewWorkspaceName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createWorkspace()} autoFocus />
            <button className="create-add-btn" onClick={createWorkspace}>Add</button>
          </div>
        )}

        {workspaces.map((ws, i) => (
          <div key={ws.id}
            className={`ws-item ${selectedWorkspace?.id === ws.id ? "active" : ""}`}
            onClick={() => setSelectedWorkspace(ws)} title={ws.name}>
            <div className="ws-avatar" style={{ background: wsColors[i % wsColors.length] }}>
              {ws.name.charAt(0).toUpperCase()}
            </div>
            <span className="ws-name">{ws.name}</span>
            {selectedWorkspace?.id === ws.id && <div className="active-dot" />}
          </div>
        ))}

        {/* PROJECTS */}
        {selectedWorkspace && (
          <>
            <div className="sidebar-section-label">
              <span>Projects</span>
              {isAdmin && !collapsed && (
                <button className="section-add-btn"
                  onClick={() => setShowCreateProject(!showCreateProject)}>+</button>
              )}
            </div>

            {showCreateProject && isAdmin && (
              <div className="create-input-row">
                <input className="create-input" placeholder="Project name…"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createProject()} autoFocus />
                <button className="create-add-btn" onClick={createProject}>Add</button>
              </div>
            )}

            {projects.map(p => (
              <div key={p.id}
                className={`proj-item ${selectedProject?.id === p.id ? "active" : ""}`}
                onClick={() => setSelectedProject(p)} title={p.name}>
                <div className="proj-dot" />
                <span className="proj-name">{p.name}</span>
              </div>
            ))}
          </>
        )}

        {/* BOTTOM NAV */}
        <div className="sidebar-bottom">
          {[
            { icon: "⚙️", label: "Settings" },
            { icon: "📁", label: "Archive" },
            { icon: "🗑️", label: "Trash" },
          ].map(item => (
            <div key={item.label} className="sidebar-bottom-item" title={item.label}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}