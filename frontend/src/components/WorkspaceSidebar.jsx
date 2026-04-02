import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

export default function WorkspaceSidebar({
  selectedWorkspace, setSelectedWorkspace,
  selectedProject,   setSelectedProject,
  reloadMembers,   // ✅ NEW: bumped by Projects.jsx after a successful invite
}) {
  const [workspaces,          setWorkspaces]          = useState([]);
  const [projects,            setProjects]            = useState([]);
  const [members,             setMembers]             = useState([]);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName,    setNewWorkspaceName]    = useState("");
  const [showCreateProject,   setShowCreateProject]   = useState(false);
  const [newProjectName,      setNewProjectName]      = useState("");
  const [collapsed,           setCollapsed]           = useState(false);
  const [membersExpanded,     setMembersExpanded]     = useState(true);
  const [activeMember,        setActiveMember]        = useState(null); // member whose popover is open

  const loadWorkspaces = useCallback(async () => {
    const res = await api.get("/workspaces/");
    setWorkspaces(res.data);
    if (res.data.length && !selectedWorkspace) setSelectedWorkspace(res.data[0]);
  }, [selectedWorkspace, setSelectedWorkspace]);

  const loadProjects = useCallback(async (workspaceId) => {
    const res = await api.get(`/projects/?workspace=${workspaceId}`);
    setProjects(res.data);
    if (res.data.length) setSelectedProject(res.data[0]);
    else setSelectedProject(null);
  }, [setSelectedProject]);

  const loadMembers = useCallback(async (workspaceId) => {
    try {
      const res = await api.get(`/workspace-members/?workspace=${workspaceId}`);
      setMembers(res.data);
    } catch {
      setMembers([]);
    }
  }, []);

  useEffect(() => { loadWorkspaces(); }, [loadWorkspaces]);

  // ✅ Re-fetch members whenever parent signals a new invite was completed
  useEffect(() => {
    if (selectedWorkspace && reloadMembers > 0) {
      loadMembers(selectedWorkspace.id);
    }
  }, [reloadMembers]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedWorkspace) {
      setProjects([]);
      setSelectedProject(null);
      setMembers([]);
      setActiveMember(null);
      loadProjects(selectedWorkspace.id);
      loadMembers(selectedWorkspace.id);
    }
  }, [selectedWorkspace?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const createWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    await api.post("/workspaces/", { name: newWorkspaceName });
    setNewWorkspaceName("");
    setShowCreateWorkspace(false);
    loadWorkspaces();
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    await api.post("/projects/", { name: newProjectName, workspace: selectedWorkspace.id });
    setNewProjectName("");
    setShowCreateProject(false);
    loadProjects(selectedWorkspace.id);
  };

  // Helper: get display name + email from member regardless of nesting shape
  // Handles both { user: { username, email }, role } and flat { username, email, role }
  const getMemberInfo = (m) => {
    if (m.user) {
      return {
        name:  m.user.username  || m.user.first_name || "Unknown",
        email: m.user.email     || "—",
        role:  m.role           || "member",
        id:    m.id,
      };
    }
    return {
      name:  m.username || m.name || "Unknown",
      email: m.email    || "—",
      role:  m.role     || "member",
      id:    m.id,
    };
  };

  const roleColor = (role) => {
    if (!role) return "#6b7280";
    const r = role.toLowerCase();
    if (r === "admin"  || r === "owner")   return "#818cf8";
    if (r === "editor" || r === "manager") return "#34d399";
    return "#9ca3af";
  };

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

        .section-label-left {
          display: flex; align-items: center; gap: 6px; cursor: pointer;
          user-select: none;
        }
        .section-chevron {
          font-size: 9px; color: rgba(255,255,255,0.2);
          transition: transform 0.2s;
          display: inline-block;
        }
        .section-chevron.open { transform: rotate(90deg); }

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

        /* ── Members ── */
        .member-item {
          display: flex; align-items: center; gap: 9px;
          padding: 6px 8px 6px 12px;
          border-radius: 8px; cursor: pointer; transition: all 0.15s; min-width: 0;
          position: relative;
        }
        .member-item:hover { background: rgba(255,255,255,0.04); }
        .member-item.active-popover { background: rgba(99,102,241,0.1); }

        .member-avatar {
          width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: #fff;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }

        .member-name {
          font-size: 12.5px; font-weight: 500; color: rgba(255,255,255,0.5);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          opacity: ${collapsed ? 0 : 1}; transition: opacity 0.15s;
          flex: 1; min-width: 0;
        }
        .member-item:hover .member-name,
        .member-item.active-popover .member-name { color: rgba(255,255,255,0.8); }

        /* Popover */
        .member-popover {
          position: absolute; left: calc(100% + 8px); top: 0;
          background: #1a1d27;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          padding: 14px 16px;
          min-width: 200px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.5);
          z-index: 300;
          animation: popIn 0.15s ease;
        }
        @keyframes popIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .popover-name {
          font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.85);
          margin-bottom: 4px;
        }
        .popover-email {
          font-size: 11.5px; color: rgba(255,255,255,0.35);
          margin-bottom: 10px; word-break: break-all;
        }
        .popover-role-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.03em;
          border: 1px solid; text-transform: capitalize;
        }
        .popover-dot {
          width: 5px; height: 5px; border-radius: 50%;
        }

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
          .ws-name, .proj-name, .member-name, .sidebar-bottom-item span:last-child,
          .sidebar-section-label, .create-input-row { opacity: 0 !important; }
          .collapse-btn { display: none; }
        }
      `}</style>

      <div className="sidebar" onClick={(e) => {
        // Close popover if clicking outside a member item
        if (!e.target.closest(".member-item")) setActiveMember(null);
      }}>
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

            {projects.length === 0 && (
              <div style={{
                fontSize: 12, color: "rgba(255,255,255,0.2)",
                padding: "6px 8px", fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}>
                No projects yet
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

        {/* ── MEMBERS (collapsible) ── */}
        {selectedWorkspace && !collapsed && (
          <>
            <div className="sidebar-section-label">
              <span
                className="section-label-left"
                onClick={() => setMembersExpanded(x => !x)}
              >
                <span className={`section-chevron ${membersExpanded ? "open" : ""}`}>▶</span>
                Members
                {members.length > 0 && (
                  <span style={{
                    fontSize: 9, background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.3)", borderRadius: 10,
                    padding: "1px 6px", fontWeight: 600,
                  }}>{members.length}</span>
                )}
              </span>
            </div>

            {membersExpanded && (
              <>
                {members.length === 0 && (
                  <div style={{
                    fontSize: 12, color: "rgba(255,255,255,0.2)",
                    padding: "6px 8px", fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}>
                    No members yet
                  </div>
                )}

                {members.map((m) => {
                  const info = getMemberInfo(m);
                  const color = roleColor(info.role);
                  const isOpen = activeMember?.id === info.id;

                  return (
                    <div
                      key={info.id}
                      className={`member-item ${isOpen ? "active-popover" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMember(isOpen ? null : info);
                      }}
                      title={info.name}
                    >
                      <div className="member-avatar">
                        {info.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="member-name">{info.name}</span>

                      {/* Popover */}
                      {isOpen && (
                        <div className="member-popover" onClick={e => e.stopPropagation()}>
                          <div className="popover-name">{info.name}</div>
                          <div className="popover-email">{info.email}</div>
                          <span
                            className="popover-role-badge"
                            style={{
                              color,
                              borderColor: color + "44",
                              background: color + "18",
                            }}
                          >
                            <span className="popover-dot" style={{ background: color }} />
                            {info.role}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
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