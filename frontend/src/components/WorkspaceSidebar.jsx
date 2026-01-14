import { useEffect, useState } from "react";
import api from "../api/axios";

export default function WorkspaceSidebar({
  selectedWorkspace,
  setSelectedWorkspace
}) {
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);

  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  /* ---------- LOAD WORKSPACES ---------- */
  const loadWorkspaces = async () => {
    const res = await api.get("/workspaces/");
    setWorkspaces(res.data);

    if (res.data.length && !selectedWorkspace) {
      setSelectedWorkspace(res.data[0]);
    }
  };

  /* ---------- LOAD PROJECTS FOR WORKSPACE ---------- */
  const loadProjects = async (workspaceId) => {
    const res = await api.get(`/projects/?workspace=${workspaceId}`);
    setProjects(res.data);
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      loadProjects(selectedWorkspace.id);
    }
  }, [selectedWorkspace]);

  /* ---------- CREATE WORKSPACE (ADMIN ONLY) ---------- */
  const createWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;

    await api.post("/workspaces/", { name: newWorkspaceName });
    setNewWorkspaceName("");
    setShowCreateWorkspace(false);
    loadWorkspaces();
  };

  /* ---------- CREATE PROJECT (ADMIN ONLY) ---------- */
  const createProject = async () => {
    if (!newProjectName.trim()) return;

    await api.post("/projects/", {
      name: newProjectName,
      workspace: selectedWorkspace.id
    });

    setNewProjectName("");
    setShowCreateProject(false);
    loadProjects(selectedWorkspace.id);
  };

  /* ---------- ADMIN CHECK ---------- */
  const isAdmin = workspaces.some(ws => ws.is_admin);

  return (
    <>
      <style>{`
        .workspace-sidebar {
          width: 280px;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          padding: 12px;
          font-size: 14px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 10px 0;
          font-weight: 600;
        }

        .item {
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
        }

        .item:hover {
          background: #f4f5f7;
        }

        .item.active {
          background: #e9f2ff;
          color: #0052cc;
          font-weight: 600;
        }

        .add-btn {
          border: none;
          background: none;
          cursor: pointer;
          font-size: 18px;
        }

        .create-box {
          display: flex;
          gap: 6px;
          margin-bottom: 6px;
        }

        .create-box input {
          flex: 1;
          padding: 6px;
        }
      `}</style>

      <div className="workspace-sidebar">
        {/* WORKSPACES */}
        <div className="section-header">
          <span>Workspaces</span>
          {isAdmin && (
            <button
              className="add-btn"
              onClick={() => setShowCreateWorkspace(!showCreateWorkspace)}
            >
              +
            </button>
          )}
        </div>

        {showCreateWorkspace && isAdmin && (
          <div className="create-box">
            <input
              placeholder="Workspace name"
              value={newWorkspaceName}
              onChange={e => setNewWorkspaceName(e.target.value)}
            />
            <button onClick={createWorkspace}>Add</button>
          </div>
        )}

        {workspaces.map(ws => (
          <div
            key={ws.id}
            className={`item ${
              selectedWorkspace?.id === ws.id ? "active" : ""
            }`}
            onClick={() => setSelectedWorkspace(ws)}
          >
            {ws.name}
          </div>
        ))}

        {/* PROJECTS / TEAMS */}
        {selectedWorkspace && (
          <>
            <div className="section-header" style={{ marginTop: 16 }}>
              <span>Teams</span>
              {isAdmin && (
                <button
                  className="add-btn"
                  onClick={() => setShowCreateProject(!showCreateProject)}
                >
                  +
                </button>
              )}
            </div>

            {showCreateProject && isAdmin && (
              <div className="create-box">
                <input
                  placeholder="Team name"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                />
                <button onClick={createProject}>Add</button>
              </div>
            )}

            {projects.map(p => (
              <div key={p.id} className="item">
                {p.name}
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
