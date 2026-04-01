import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

const STATUS_CONFIG = {
  TODO:        { label: "To Do",       color: "#5a627a", bg: "#f0f2f8",  dot: "#aab0c0" },
  IN_PROGRESS: { label: "In Progress", color: "#4f8ef7", bg: "#eff4ff",  dot: "#4f8ef7" },
  IN_REVIEW:   { label: "In Review",   color: "#7c5cfc", bg: "#f3f0ff",  dot: "#7c5cfc" },
  DONE:        { label: "Done",        color: "#10b981", bg: "#ecfdf5",  dot: "#10b981" },
};

const PRIORITY_CONFIG = {
  LOW:    { label: "Low",    icon: "↓", color: "#10b981", bg: "#ecfdf5" },
  MEDIUM: { label: "Medium", icon: "→", color: "#f59e0b", bg: "#fffbeb" },
  HIGH:   { label: "High",   icon: "↑", color: "#ef4444", bg: "#fef2f2" },
};

export default function CreateTaskModal({ task, workspaceId, onClose, onCreated }) {
  const isEdit = Boolean(task);
  const modalRef = useRef(null);

  const [error, setError]                     = useState("");
  const [teams, setTeams]                     = useState([]);
  const [users, setUsers]                     = useState([]);
  const [showStatusMenu, setShowStatusMenu]   = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [submitting, setSubmitting]           = useState(false);
  const [descFocused, setDescFocused]         = useState(false);
  const [activeTab, setActiveTab]             = useState("details");

  const wsId = task?.workspace || workspaceId;

  const [form, setForm] = useState({
    workspace: wsId || "",
    team: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    assignees: [],
    status: "TODO",
    is_published: false,
  });

  /* prefill edit */
  useEffect(() => {
    if (!task) return;
    setForm({
      workspace: task.workspace,
      team: task.team || "",
      title: task.title,
      description: task.description || "",
      priority: task.priority || "MEDIUM",
      assignees: task.assignees?.map(a => a.id) || [],
      status: task.status || "TODO",
      is_published: task.is_published || false,
    });
  }, [task]);

  /* load teams + users */
  useEffect(() => {
    if (!wsId) return;
    api.get(`/projects/?workspace=${wsId}`).then(r => setTeams(r.data)).catch(() => {});
    api.get(`/users/?workspace=${wsId}`).then(r => setUsers(r.data)).catch(() => {});
  }, [wsId]);

  /* close on backdrop */
  const handleBackdrop = e => { if (e.target === e.currentTarget) onClose(); };

  /* close dropdowns on outside click */
  useEffect(() => {
    const handler = e => {
      if (!modalRef.current?.contains(e.target)) {
        setShowStatusMenu(false);
        setShowPriorityMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Esc to close */
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleAssignee = e => {
    const v = Number(e.target.value);
    setForm(p => ({ ...p, assignees: v ? [v] : [] }));
  };

  const submit = async (publish = false) => {
    setError("");
    if (!form.title.trim()) { setError("Summary is required"); return; }
    setSubmitting(true);
    const payload = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      assignees: form.assignees,
      status: form.status,
      team: form.team,
      is_published: publish ? true : form.is_published,
    };
    try {
      if (isEdit) await api.patch(`/tasks/${task.id}/`, payload);
      else await api.post("/tasks/", payload);
      onCreated();
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const status   = STATUS_CONFIG[form.status]    || STATUS_CONFIG.TODO;
  const priority = PRIORITY_CONFIG[form.priority] || PRIORITY_CONFIG.MEDIUM;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .ctm-backdrop {
          position: fixed; inset: 0;
          background: rgba(15,20,40,0.55);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
          animation: ctmFadeIn 0.18s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 16px;
        }

        @keyframes ctmFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes ctmSlideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes btnSpin    { to { transform: rotate(360deg) } }

        .ctm-modal {
          width: 100%; max-width: 720px;
          max-height: 90vh;
          background: #fff;
          border-radius: 16px;
          display: flex; flex-direction: column;
          box-shadow: 0 28px 64px rgba(15,20,40,0.24);
          animation: ctmSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1);
          overflow: hidden;
        }

        /* HEADER */
        .ctm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 22px 14px;
          border-bottom: 1px solid #eef0f5;
          gap: 10px; flex-wrap: wrap;
        }

        .ctm-header-left {
          display: flex; align-items: center; gap: 10px;
        }

        .ctm-type-badge {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 10px;
          background: #eff4ff; color: #4f8ef7;
          border-radius: 6px;
          font-size: 11.5px; font-weight: 700;
          letter-spacing: 0.04em; text-transform: uppercase;
        }

        .ctm-id {
          font-size: 14px; font-weight: 700; color: #1a1f36;
          letter-spacing: -0.2px;
        }

        .ctm-header-right {
          display: flex; align-items: center; gap: 8px;
        }

        /* STATUS PILL */
        .status-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 20px;
          font-size: 12.5px; font-weight: 700;
          cursor: pointer; border: none;
          transition: filter 0.15s; position: relative;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .status-pill:hover { filter: brightness(0.94); }

        .status-dot { width: 7px; height: 7px; border-radius: 50%; }

        .status-dropdown {
          position: absolute; top: calc(100% + 6px); right: 0;
          background: #fff; border: 1.5px solid #eef0f5;
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(15,20,40,0.14);
          z-index: 60; min-width: 160px; overflow: hidden;
          animation: ctmFadeIn 0.12s ease;
        }

        .status-option {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 14px; cursor: pointer;
          font-size: 13px; font-weight: 500; color: #2d3452;
          transition: background 0.12s;
        }
        .status-option:hover { background: #f5f6fb; }

        /* PUBLISH / CLOSE */
        .publish-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 14px; border-radius: 8px; border: none;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; font-size: 12.5px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; box-shadow: 0 2px 8px rgba(16,185,129,0.3);
          transition: all 0.15s;
        }
        .publish-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16,185,129,0.38); }

        .published-chip {
          font-size: 12px; font-weight: 700; color: #10b981;
          background: #ecfdf5; padding: 5px 12px; border-radius: 20px;
        }

        .ctm-close-btn {
          width: 32px; height: 32px; border-radius: 8px;
          border: 1.5px solid #eef0f5; background: #fff; color: #8b95a9;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; cursor: pointer; transition: all 0.15s;
        }
        .ctm-close-btn:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }

        /* TABS */
        .ctm-tabs {
          display: flex; padding: 0 22px;
          border-bottom: 1px solid #eef0f5;
          background: #fafbff;
        }

        .ctm-tab {
          padding: 10px 16px; font-size: 13px; font-weight: 500;
          color: #8b95a9; border: none; background: none;
          cursor: pointer; position: relative;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: color 0.15s;
        }
        .ctm-tab::after {
          content: ''; position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px; border-radius: 2px 2px 0 0;
          background: #4f8ef7;
          transform: scaleX(0); transition: transform 0.18s;
        }
        .ctm-tab.active { color: #4f8ef7; font-weight: 600; }
        .ctm-tab.active::after { transform: scaleX(1); }

        /* BODY */
        .ctm-body { display: flex; flex: 1; overflow: hidden; }

        .ctm-main {
          flex: 1; padding: 20px 22px;
          overflow-y: auto; scrollbar-width: thin;
          scrollbar-color: #d8dced transparent;
          display: flex; flex-direction: column; gap: 18px;
        }

        .ctm-sidebar {
          width: 210px; flex-shrink: 0;
          border-left: 1px solid #eef0f5;
          padding: 18px 16px;
          overflow-y: auto; background: #fafbff;
          display: flex; flex-direction: column; gap: 16px;
        }

        /* FORM */
        .field-group { display: flex; flex-direction: column; gap: 5px; }

        .field-label {
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em; color: #aab0c0;
        }

        .f-input, .f-select, .f-textarea {
          padding: 9px 12px;
          border: 1.5px solid #e2e5ef; border-radius: 9px;
          font-size: 13.5px; font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1a1f36; outline: none; transition: all 0.15s;
          background: #fff; width: 100%; box-sizing: border-box;
        }
        .f-input:focus, .f-select:focus, .f-textarea:focus {
          border-color: #4f8ef7;
          box-shadow: 0 0 0 3px rgba(79,142,247,0.1);
        }

        .f-input.title-f {
          font-size: 15px; font-weight: 600;
          border-color: transparent; background: #f5f6fb;
          padding: 11px 14px;
        }
        .f-input.title-f:focus { background: #fff; border-color: #4f8ef7; }
        .f-input.title-f::placeholder { color: #c0c7d8; font-weight: 500; }

        .f-textarea {
          resize: vertical; min-height: 96px; line-height: 1.65;
        }
        .f-textarea.desc-idle {
          border-color: transparent; background: #f5f6fb; cursor: text;
        }
        .f-textarea.desc-idle:hover { border-color: #e2e5ef; background: #f0f2f8; }

        /* PRIORITY BTN */
        .priority-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 12px; border-radius: 9px;
          border: 1.5px solid #e2e5ef; background: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.15s;
          position: relative; width: 100%;
        }
        .priority-btn:hover { border-color: #c7d3f5; background: #f5f7ff; }

        .p-badge {
          padding: 2px 9px; border-radius: 20px;
          font-size: 12px; font-weight: 700;
        }

        .priority-dropdown {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: #fff; border: 1.5px solid #eef0f5; border-radius: 10px;
          box-shadow: 0 8px 24px rgba(15,20,40,0.14);
          z-index: 60; overflow: hidden;
          animation: ctmFadeIn 0.12s ease;
        }

        .p-option {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 14px; cursor: pointer;
          font-size: 13px; font-weight: 500; color: #2d3452;
          transition: background 0.12s;
        }
        .p-option:hover { background: #f5f6fb; }

        /* SIDEBAR */
        .sb-field { display: flex; flex-direction: column; gap: 5px; }

        .sb-label {
          font-size: 10.5px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em; color: #b0b9cc;
        }

        .sb-select {
          padding: 7px 10px; border: 1.5px solid #e2e5ef; border-radius: 8px;
          font-size: 12.5px; font-family: 'Plus Jakarta Sans', sans-serif;
          color: #2d3452; outline: none; background: #fff;
          cursor: pointer; transition: border-color 0.15s;
          width: 100%; box-sizing: border-box;
        }
        .sb-select:focus { border-color: #4f8ef7; }

        .sb-assignee-row { display: flex; align-items: center; gap: 7px; }

        .sb-avatar {
          width: 26px; height: 26px; border-radius: 50%;
          background: linear-gradient(135deg, #4f8ef7, #7c5cfc);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0;
        }

        .sb-divider { border-top: 1px solid #eef0f5; margin: 2px 0; }

        .sb-meta-row { display: flex; flex-direction: column; gap: 3px; }
        .sb-meta-val { font-size: 12.5px; font-weight: 600; color: #5a627a; }
        .sb-meta-sub { font-size: 12px; color: #8b95a9; }

        /* ERROR */
        .ctm-error {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px;
          background: #fef2f2; border: 1.5px solid #fecaca;
          border-radius: 9px; font-size: 13px; color: #ef4444; font-weight: 500;
        }

        /* FOOTER */
        .ctm-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 22px; border-top: 1px solid #eef0f5;
          background: #fafbff; gap: 10px; flex-wrap: wrap;
        }

        .footer-hint { font-size: 12px; color: #c0c7d8; }

        .footer-actions { display: flex; gap: 8px; }

        .cancel-btn {
          padding: 8px 18px; border-radius: 9px;
          border: 1.5px solid #e2e5ef; background: #fff; color: #5a627a;
          font-size: 13px; font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.15s;
        }
        .cancel-btn:hover { background: #f5f6fb; }

        .submit-btn {
          padding: 8px 20px; border-radius: 9px; border: none;
          background: linear-gradient(135deg, #4f8ef7, #7c5cfc);
          color: #fff; font-size: 13px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; box-shadow: 0 2px 8px rgba(79,142,247,0.3);
          transition: all 0.18s; display: flex; align-items: center; gap: 6px;
          min-width: 110px; justify-content: center;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(79,142,247,0.4); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .btn-spinner {
          width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff; border-radius: 50%;
          animation: btnSpin 0.65s linear infinite;
        }

        /* ACTIVITY */
        .activity-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 48px 24px; gap: 10px; color: #b0b9cc;
        }
        .activity-empty-icon { font-size: 38px; opacity: 0.6; }

        @media (max-width: 600px) {
          .ctm-sidebar { display: none; }
          .ctm-modal { max-height: 95vh; border-radius: 16px 16px 0 0; align-self: flex-end; }
        }
      `}</style>

      <div className="ctm-backdrop" onClick={handleBackdrop}>
        <div className="ctm-modal" ref={modalRef}>

          {/* HEADER */}
          <div className="ctm-header">
            <div className="ctm-header-left">
              <div className="ctm-type-badge">🎯 Task</div>
              <span className="ctm-id">
                {isEdit ? `TF-${task.id}` : "New Task"}
              </span>
            </div>

            <div className="ctm-header-right">
              {/* STATUS */}
              <div style={{ position: "relative" }}>
                <button
                  className="status-pill"
                  style={{ background: status.bg, color: status.color }}
                  onClick={() => { setShowStatusMenu(v => !v); setShowPriorityMenu(false); }}
                >
                  <span className="status-dot" style={{ background: status.dot }} />
                  {status.label}
                  <span style={{ fontSize:9, opacity:0.5 }}>▾</span>
                </button>

                {showStatusMenu && (
                  <div className="status-dropdown">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <div
                        key={key}
                        className="status-option"
                        onClick={() => { setForm(p => ({ ...p, status: key })); setShowStatusMenu(false); }}
                      >
                        <span style={{ width:8,height:8,borderRadius:"50%",background:cfg.dot,display:"inline-block",flexShrink:0 }} />
                        {cfg.label}
                        {form.status === key && <span style={{ marginLeft:"auto",color:"#4f8ef7",fontSize:13 }}>✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isEdit && !form.is_published && (
                <button className="publish-btn" onClick={() => submit(true)} disabled={submitting}>
                  ✦ Publish
                </button>
              )}
              {isEdit && form.is_published && (
                <span className="published-chip">✓ Published</span>
              )}

              <button className="ctm-close-btn" onClick={onClose}>✕</button>
            </div>
          </div>

          {/* TABS */}
          <div className="ctm-tabs">
            {["details", "activity"].map(tab => (
              <button
                key={tab}
                className={`ctm-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "details" ? (
            <div className="ctm-body">

              {/* MAIN */}
              <div className="ctm-main">
                {error && (
                  <div className="ctm-error"><span>⚠</span>{error}</div>
                )}

                {/* TITLE */}
                <div className="field-group">
                  <div className="field-label">Summary *</div>
                  <input
                    className="f-input title-f"
                    name="title"
                    placeholder="What needs to be done?"
                    value={form.title}
                    onChange={handleChange}
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="field-group">
                  <div className="field-label">Description</div>
                  <textarea
                    className={`f-textarea ${descFocused ? "" : "desc-idle"}`}
                    name="description"
                    placeholder="Add a detailed description…"
                    value={form.description}
                    onChange={handleChange}
                    onFocus={() => setDescFocused(true)}
                    onBlur={() => setDescFocused(false)}
                    rows={4}
                  />
                </div>

                {/* PRIORITY */}
                <div className="field-group">
                  <div className="field-label">Priority</div>
                  <div style={{ position: "relative" }}>
                    <button
                      className="priority-btn"
                      onClick={() => { setShowPriorityMenu(v => !v); setShowStatusMenu(false); }}
                    >
                      <span style={{ fontSize:17, fontWeight:900, color: priority.color, lineHeight:1 }}>
                        {priority.icon}
                      </span>
                      <span
                        className="p-badge"
                        style={{ background: priority.bg, color: priority.color }}
                      >
                        {priority.label}
                      </span>
                      <span style={{ marginLeft:"auto", fontSize:10, color:"#aab0c0" }}>▾</span>
                    </button>

                    {showPriorityMenu && (
                      <div className="priority-dropdown">
                        {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                          <div
                            key={key}
                            className="p-option"
                            onClick={() => { setForm(p => ({ ...p, priority: key })); setShowPriorityMenu(false); }}
                          >
                            <span style={{ fontSize:15, fontWeight:900, color:cfg.color, width:16, textAlign:"center" }}>{cfg.icon}</span>
                            <span className="p-badge" style={{ background:cfg.bg, color:cfg.color }}>{cfg.label}</span>
                            {form.priority === key && <span style={{ marginLeft:"auto",color:"#4f8ef7" }}>✓</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SIDEBAR */}
              <div className="ctm-sidebar">

                <div className="sb-field">
                  <div className="sb-label">Team</div>
                  <select className="sb-select" name="team" value={form.team || ""} onChange={handleChange}>
                    <option value="">No team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="sb-field">
                  <div className="sb-label">Assignee</div>
                  <div className="sb-assignee-row">
                    {form.assignees[0] && (
                      <div className="sb-avatar">
                        {(users.find(u => u.id === form.assignees[0])?.email || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <select
                      className="sb-select"
                      value={form.assignees[0] || ""}
                      onChange={handleAssignee}
                      style={{ flex: 1 }}
                    >
                      <option value="">Unassigned</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
                    </select>
                  </div>
                </div>

                <div className="sb-field">
                  <div className="sb-label">Status</div>
                  <select
                    className="sb-select"
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sb-divider" />

                {isEdit && (
                  <>
                    <div className="sb-field">
                      <div className="sb-label">Task ID</div>
                      <div className="sb-meta-row">
                        <span className="sb-meta-val">TF-{task.id}</span>
                      </div>
                    </div>

                    <div className="sb-field">
                      <div className="sb-label">Created</div>
                      <span className="sb-meta-sub">
                        {task.created_at
                          ? new Date(task.created_at).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })
                          : "—"}
                      </span>
                    </div>

                    <div className="sb-field">
                      <div className="sb-label">Published</div>
                      <span className="sb-meta-val" style={{ color: form.is_published ? "#10b981" : "#aab0c0" }}>
                        {form.is_published ? "Yes" : "No"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="ctm-main">
              <div className="activity-empty">
                <div className="activity-empty-icon">💬</div>
                <div style={{ fontWeight:600, color:"#5a627a", fontSize:14 }}>No activity yet</div>
                <div style={{ fontSize:13, color:"#b0b9cc", textAlign:"center", maxWidth:260, lineHeight:1.6 }}>
                  Comments and history will appear here once the task is created.
                </div>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="ctm-footer">
            <span className="footer-hint">
              {isEdit
                ? `Updated: ${task?.updated_at ? new Date(task.updated_at).toLocaleDateString() : "—"}`
                : "Esc to cancel"}
            </span>
            <div className="footer-actions">
              <button className="cancel-btn" onClick={onClose}>Cancel</button>
              <button className="submit-btn" onClick={() => submit(false)} disabled={submitting}>
                {submitting
                  ? <><div className="btn-spinner" /> Saving…</>
                  : isEdit ? "Update Task" : "Create Task"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}