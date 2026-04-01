import { useEffect, useState } from "react";
import api from "../api/axios";

// ── CONSTANTS ─────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  HIGH:   { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   label: "High"   },
  MEDIUM: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  label: "Medium" },
  LOW:    { color: "#10b981", bg: "rgba(16,185,129,0.12)",  label: "Low"    },
};

const TYPE_META = {
  TASK:  { icon: "✓",  color: "#818cf8" },
  STORY: { icon: "📖", color: "#34d399" },
  BUG:   { icon: "⚠",  color: "#f87171" },
  EPIC:  { icon: "⚡", color: "#c084fc" },
};

const COL_ACCENT = {
  "To Do":       "#6366f1",
  "In Progress": "#f59e0b",
  "In Review":   "#3b82f6",
  "Done":        "#10b981",
};

const AVATAR_COLORS = ["#6366f1","#ec4899","#10b981","#f59e0b","#3b82f6","#8b5cf6"];

const STATUS_FROM_TITLE = {
  "To Do": "TODO", "In Progress": "IN_PROGRESS",
  "In Review": "IN_PROGRESS", "Done": "DONE",
};

// ── HELPERS ───────────────────────────────────────────────────────────
function Avatar({ name, size = 22, index = 0 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: AVATAR_COLORS[index % AVATAR_COLORS.length],
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff",
      border: "2px solid #13151f", flexShrink: 0,
      marginLeft: index > 0 ? -5 : 0,
    }}>
      {String(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

// ── TASK DETAIL PANEL ─────────────────────────────────────────────────
function TaskDetailPanel({ task, workspaceId, onClose, onSaved }) {
  const [editing,    setEditing]    = useState(false);
  const [form,       setForm]       = useState({ ...task });
  const [saving,     setSaving]     = useState(false);
  const [comments,   setComments]   = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    setForm({ ...task });
    setEditing(false);
    api.get(`/comments/?task=${task.id}`).then(r => setComments(r.data)).catch(() => {});
  }, [task.id]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/tasks/${task.id}/`, {
        title: form.title, description: form.description,
        priority: form.priority, work_type: form.work_type,
        status: form.status, due_date: form.due_date || null,
        story_points: form.story_points || null,
      });
      onSaved(res.data);
      setEditing(false);
    } catch {}
    setSaving(false);
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    await api.post("/comments/", { task: task.id, message: newComment });
    setNewComment("");
    api.get(`/comments/?task=${task.id}`).then(r => setComments(r.data)).catch(() => {});
  };

  const prio = PRIORITY_CONFIG[form.priority] || PRIORITY_CONFIG.MEDIUM;
  const type = TYPE_META[form.work_type]      || TYPE_META.TASK;

  return (
    <div className="dp-overlay" onClick={e => e.target.classList.contains("dp-overlay") && onClose()}>
      <div className="dp-panel">
        <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:20 }}>
          <span className="dp-type-badge" style={{ color: type.color }}>
            {type.icon} {form.work_type}
          </span>
          <div style={{ flex:1 }}>
            {editing
              ? <input className="dp-title-input" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              : <h3 className="dp-title">{form.title}</h3>
            }
          </div>
          <button className="dp-close" onClick={onClose}>✕</button>
        </div>

        <div className="dp-meta-grid">
          <div className="dp-meta-cell">
            <span className="dp-meta-label">Priority</span>
            {editing
              ? <select className="dp-select" value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  {["HIGH","MEDIUM","LOW"].map(p => <option key={p}>{p}</option>)}
                </select>
              : <span className="dp-pill" style={{ background: prio.bg, color: prio.color }}>{prio.label}</span>
            }
          </div>
          <div className="dp-meta-cell">
            <span className="dp-meta-label">Type</span>
            {editing
              ? <select className="dp-select" value={form.work_type}
                  onChange={e => setForm(f => ({ ...f, work_type: e.target.value }))}>
                  {["TASK","STORY","BUG","EPIC"].map(t => <option key={t}>{t}</option>)}
                </select>
              : <span className="dp-value">{form.work_type}</span>
            }
          </div>
          <div className="dp-meta-cell">
            <span className="dp-meta-label">Status</span>
            {editing
              ? <select className="dp-select" value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {["TODO","IN_PROGRESS","DONE"].map(s => <option key={s}>{s}</option>)}
                </select>
              : <span className="dp-value">{form.status}</span>
            }
          </div>
          <div className="dp-meta-cell">
            <span className="dp-meta-label">Due date</span>
            {editing
              ? <input type="date" className="dp-select" value={form.due_date || ""}
                  onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              : <span className="dp-value">{form.due_date
                  ? new Date(form.due_date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})
                  : "—"}</span>
            }
          </div>
          <div className="dp-meta-cell">
            <span className="dp-meta-label">Points</span>
            {editing
              ? <input type="number" className="dp-select" style={{ width:70 }}
                  value={form.story_points || ""}
                  onChange={e => setForm(f => ({ ...f, story_points: e.target.value }))} />
              : <span className="dp-value">{form.story_points ?? "—"}</span>
            }
          </div>
        </div>

        <div className="dp-section">
          <span className="dp-meta-label">Assignees</span>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
            {(form.assignees || []).map((a, i) => (
              <div key={a.id} className="dp-assignee-chip">
                <Avatar name={a.username} size={20} index={i} />
                <span>{a.username}</span>
              </div>
            ))}
            {!form.assignees?.length && <span className="dp-empty">No assignees</span>}
          </div>
        </div>

        <div className="dp-section">
          <span className="dp-meta-label">Description</span>
          {editing
            ? <textarea className="dp-desc-input" rows={4} value={form.description || ""}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Add a description…" />
            : <p className="dp-desc">{form.description || <em style={{ opacity:.4 }}>No description.</em>}</p>
          }
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:24 }}>
          {editing ? (
            <>
              <button className="dp-btn-primary" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button className="dp-btn-ghost" onClick={() => { setEditing(false); setForm({ ...task }); }}>
                Cancel
              </button>
            </>
          ) : (
            <button className="dp-btn-ghost" onClick={() => setEditing(true)}>✏ Edit</button>
          )}
        </div>

        <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:20 }}>
          <span className="dp-section-title">
            Comments {comments.length > 0 && `(${comments.length})`}
          </span>
          {comments.map(c => (
            <div key={c.id} style={{ display:"flex", gap:10, marginBottom:14 }}>
              <Avatar name={c.user} size={26} />
              <div>
                <div style={{ display:"flex", gap:8, alignItems:"baseline", marginBottom:3 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.7)" }}>{c.user}</span>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>
                    {new Date(c.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                  </span>
                </div>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", lineHeight:1.5 }}>{c.message}</p>
              </div>
            </div>
          ))}
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <input className="dp-comment-input" placeholder="Write a comment…"
              value={newComment} onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === "Enter" && postComment()} />
            <button className="dp-btn-primary" onClick={postComment}>Post</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN KANBAN BOARD ─────────────────────────────────────────────────
export default function KanbanBoard({ selectedProject, selectedWorkspace }) {
  const [boards,         setBoards]         = useState([]);
  const [activeBoard,    setActiveBoard]    = useState(null);
  const [columns,        setColumns]        = useState([]);
  const [tasksByCol,     setTasksByCol]     = useState({});
  const [loadingBoards,  setLoadingBoards]  = useState(false); // ✅ boards fetch
  const [loadingBoard,   setLoadingBoard]   = useState(false); // ✅ columns+tasks fetch
  const [selectedTask,   setSelectedTask]   = useState(null);
  const [addingCol,      setAddingCol]      = useState(null);
  const [newTaskTitle,   setNewTaskTitle]   = useState("");

  // ── fetch boards when project changes ────────────────────────────
  useEffect(() => {
    if (!selectedProject) {
      setBoards([]); setActiveBoard(null);
      setColumns([]); setTasksByCol({});
      return;
    }

    // ✅ set loadingBoards=true BEFORE clearing boards
    // this prevents the "No boards yet" flash
    setLoadingBoards(true);
    setBoards([]);
    setActiveBoard(null);
    setColumns([]);
    setTasksByCol({});

    api.get(`/boards/?project=${selectedProject.id}`)
      .then(r => {
        setBoards(r.data);
        setActiveBoard(r.data[0] || null);
      })
      .catch(() => {
        setBoards([]);
        setActiveBoard(null);
      })
      .finally(() => setLoadingBoards(false));

  }, [selectedProject?.id]);

  // ── fetch columns + tasks when active board changes ───────────────
  useEffect(() => {
    if (!activeBoard) { setColumns([]); setTasksByCol({}); return; }
    loadBoardData(activeBoard.id);
  }, [activeBoard?.id]);

  const loadBoardData = async (boardId) => {
    setLoadingBoard(true);
    try {
      const [colsRes, tasksRes] = await Promise.all([
        api.get(`/task-lists/?board=${boardId}`),
        api.get(`/tasks/?board=${boardId}`),
      ]);
      const cols  = colsRes.data.sort((a, b) => a.position - b.position);
      const tasks = tasksRes.data;
      const grouped = {};
      cols.forEach(c => { grouped[c.id] = tasks.filter(t => t.task_list === c.id); });
      setColumns(cols);
      setTasksByCol(grouped);
    } catch (err) {
      console.error("Failed to load board data:", err);
    }
    setLoadingBoard(false);
  };

  const handleAddTask = async (column) => {
    if (!newTaskTitle.trim()) return;
    try {
      const res = await api.post("/tasks/", {
        title:        newTaskTitle,
        status:       STATUS_FROM_TITLE[column.title] || "TODO",
        work_type:    "TASK",
        priority:     "MEDIUM",
        task_list_id: column.id,   // ✅ tells backend exactly which board/project
      });
      setTasksByCol(prev => ({
        ...prev,
        [column.id]: [...(prev[column.id] || []), res.data],
      }));
    } catch (err) {
      console.error("Failed to create task:", err);
    }
    setNewTaskTitle(""); setAddingCol(null);
  };

  const handleTaskSaved = (updated) => {
    setTasksByCol(prev => {
      const next = {};
      Object.keys(prev).forEach(cid => {
        next[cid] = prev[cid].filter(t => t.id !== updated.id);
      });
      const col = columns.find(c => c.id === updated.task_list);
      if (col) next[col.id] = [...(next[col.id] || []), updated];
      return next;
    });
    setSelectedTask(updated);
  };

  // ── EMPTY / LOADING STATES ────────────────────────────────────────

  // No project selected
  if (!selectedProject) return (
    <div style={emptyWrap}>
      <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
      <h3 style={emptyH}>Select a project</h3>
      <p style={emptyP}>Choose a project from the sidebar to view its board</p>
    </div>
  );

  // Boards are loading (project just switched) — show spinner, NOT "no boards"
  if (loadingBoards) return (
    <div style={emptyWrap}>
      <div className="kb-spinner-standalone" />
    </div>
  );

  // Boards loaded but none exist for this project
  if (!loadingBoards && boards.length === 0) return (
    <div style={emptyWrap}>
      <div style={{ fontSize:40, marginBottom:12 }}>🗂</div>
      <h3 style={emptyH}>No boards yet</h3>
      <p style={emptyP}>
        Ask a workspace admin to create a board for{" "}
        <strong style={{ color:"rgba(255,255,255,0.6)" }}>{selectedProject.name}</strong>
      </p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

        .kb-root {
          flex: 1; display: flex; flex-direction: column;
          background: #0d0f16; min-height: calc(100vh - 56px);
          font-family: 'Plus Jakarta Sans', sans-serif; overflow: hidden;
        }

        .kb-topbar {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.015); flex-shrink: 0;
        }

        .kb-project-name {
          font-family: 'Syne', sans-serif;
          font-size: 17px; font-weight: 700; color: #fff; letter-spacing: -0.3px;
        }

        .kb-sep { color: rgba(255,255,255,0.15); font-size: 14px; }

        .kb-tabs { display: flex; gap: 4px; margin-left: 4px; }
        .kb-tab {
          padding: 5px 14px; border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.07);
          background: none; cursor: pointer;
          font-size: 12.5px; font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: rgba(255,255,255,0.4); transition: all 0.15s;
        }
        .kb-tab:hover  { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); }
        .kb-tab.active {
          background: rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.3);
          color: #818cf8; font-weight: 600;
        }

        .kb-refresh {
          margin-left: auto; padding: 6px 14px; border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.4); font-size: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.15s;
        }
        .kb-refresh:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.8); }

        .kb-columns {
          display: flex; gap: 14px; padding: 20px 24px;
          overflow-x: auto; flex: 1; align-items: flex-start;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .kb-columns::-webkit-scrollbar { height: 5px; }
        .kb-columns::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius:10px; }

        .kb-col {
          width: 272px; flex-shrink: 0;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 13px; padding: 14px;
          display: flex; flex-direction: column;
          animation: colIn 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes colIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

        .kb-col-header {
          display: flex; align-items: center; gap: 8px; margin-bottom: 14px; padding: 0 2px;
        }
        .kb-col-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .kb-col-title {
          font-size: 12px; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; color: rgba(255,255,255,0.7); flex: 1;
        }
        .kb-col-count {
          padding: 1px 8px; border-radius: 100px;
          font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.07);
        }
        .kb-col-add {
          width: 20px; height: 20px; border-radius: 5px; border: none;
          background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.3);
          font-size: 15px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .kb-col-add:hover { background: rgba(99,102,241,0.2); color: #818cf8; }

        .kb-card {
          background: #1a1d27; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 12px; margin-bottom: 8px;
          cursor: pointer; transition: all 0.15s;
          animation: cardIn 0.25s ease both;
        }
        @keyframes cardIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        .kb-card:hover {
          border-color: rgba(99,102,241,0.35); background: #1e2130;
          transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        }

        .kb-card-title {
          font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.85);
          line-height: 1.45; margin-bottom: 10px;
        }
        .kb-card-footer { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .kb-prio-badge  { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .kb-type-badge  { padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .kb-due         { font-size: 11px; margin-left: auto; }

        .kb-empty-col {
          display: flex; flex-direction: column; align-items: center;
          padding: 24px 0; color: rgba(255,255,255,0.2); font-size: 13px; gap: 6px;
        }

        .kb-add-form { margin-top: 8px; }
        .kb-add-input {
          width: 100%; padding: 8px 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(99,102,241,0.3); border-radius: 8px;
          color: #fff; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;
          resize: none; outline: none; box-sizing: border-box;
        }
        .kb-add-input::placeholder { color: rgba(255,255,255,0.2); }
        .kb-add-actions { display: flex; gap: 6px; margin-top: 6px; }
        .kb-add-confirm {
          padding: 5px 14px; border-radius: 7px; border: none;
          background: #6366f1; color: #fff;
          font-size: 12px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: background 0.15s;
        }
        .kb-add-confirm:hover { background: #4f46e5; }
        .kb-add-cancel {
          padding: 5px 10px; border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.1); background: none;
          color: rgba(255,255,255,0.35); font-size: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.15s;
        }
        .kb-add-cancel:hover { color: rgba(255,255,255,0.6); }

        .kb-col-add-row {
          display: flex; align-items: center; gap: 6px; width: 100%;
          padding: 7px 4px; border: none; background: none; cursor: pointer;
          color: rgba(255,255,255,0.25); font-size: 12.5px; font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif; border-radius: 7px;
          margin-top: 4px; transition: all 0.15s;
        }
        .kb-col-add-row:hover { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.6); }

        .kb-spinner, .kb-spinner-standalone {
          width: 28px; height: 28px;
          border: 3px solid rgba(255,255,255,0.08);
          border-top-color: #6366f1; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── DETAIL PANEL ── */
        .dp-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px); z-index: 100;
          display: flex; justify-content: flex-end;
          animation: fadeIn 0.2s ease both;
        }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

        .dp-panel {
          width: 460px; height: 100%; overflow-y: auto;
          background: #13151f; border-left: 1px solid rgba(255,255,255,0.08);
          padding: 28px 28px 40px;
          animation: slideIn 0.3s cubic-bezier(0.16,1,0.3,1) both;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent;
        }
        @keyframes slideIn { from { transform:translateX(32px); opacity:0; } to { transform:translateX(0); opacity:1; } }

        .dp-type-badge {
          padding: 3px 10px; border-radius: 5px;
          background: rgba(255,255,255,0.06);
          font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px;
        }
        .dp-title { font-size: 17px; font-weight: 600; color: #fff; line-height: 1.3; }
        .dp-title-input {
          width: 100%; background: none; border: none;
          border-bottom: 1px solid rgba(99,102,241,0.4);
          color: #fff; font-size: 16px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif; outline: none; padding-bottom: 4px;
        }
        .dp-close {
          width: 28px; height: 28px; border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.4);
          font-size: 12px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s;
        }
        .dp-close:hover { background: rgba(248,113,113,0.15); color: #f87171; }

        .dp-meta-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
          padding: 14px; background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; margin-bottom: 18px;
        }
        .dp-meta-cell { display: flex; flex-direction: column; gap: 5px; }
        .dp-meta-label {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: rgba(255,255,255,0.25);
        }
        .dp-pill { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; width: fit-content; }
        .dp-value { font-size: 13px; color: rgba(255,255,255,0.55); }
        .dp-select {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px; color: #fff; font-size: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 5px 8px; outline: none; width: 100%;
        }
        .dp-select option { background: #1a1d27; }

        .dp-section { margin-bottom: 18px; }
        .dp-section-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.45); display: block; margin-bottom: 12px; }
        .dp-assignee-chip {
          display: flex; align-items: center; gap: 6px;
          padding: 3px 10px 3px 4px; border-radius: 100px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          font-size: 12px; color: rgba(255,255,255,0.6);
        }
        .dp-empty { font-size: 13px; color: rgba(255,255,255,0.2); }
        .dp-desc { font-size: 13.5px; color: rgba(255,255,255,0.5); line-height: 1.6; }
        .dp-desc-input {
          width: 100%; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
          color: rgba(255,255,255,0.7); font-size: 13px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 10px 12px; outline: none; resize: vertical; line-height: 1.6;
        }
        .dp-btn-primary {
          padding: 8px 18px; border-radius: 8px; border: none;
          background: #6366f1; color: #fff; font-size: 13px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: background 0.15s;
        }
        .dp-btn-primary:hover:not(:disabled) { background: #4f46e5; }
        .dp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .dp-btn-ghost {
          padding: 7px 16px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: none; color: rgba(255,255,255,0.5); font-size: 13px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.15s;
        }
        .dp-btn-ghost:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); }
        .dp-comment-input {
          flex: 1; padding: 8px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
          color: #fff; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none;
        }
        .dp-comment-input::placeholder { color: rgba(255,255,255,0.2); }
        .dp-comment-input:focus { border-color: rgba(99,102,241,0.4); }

        @media (max-width: 640px) {
          .dp-panel { width: 100%; }
          .kb-columns { padding: 12px; gap: 12px; }
          .kb-col { width: 256px; }
        }
      `}</style>

      <div className="kb-root">
        {/* Top bar */}
        <div className="kb-topbar">
          <span className="kb-project-name">{selectedProject.name}</span>
          {boards.length > 1 ? (
            <>
              <span className="kb-sep">›</span>
              <div className="kb-tabs">
                {boards.map(b => (
                  <button key={b.id}
                    className={`kb-tab ${activeBoard?.id === b.id ? "active" : ""}`}
                    onClick={() => setActiveBoard(b)}>
                    {b.name}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <span className="kb-sep">›</span>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>
                {boards[0]?.name}
              </span>
            </>
          )}
          <button className="kb-refresh"
            onClick={() => activeBoard && loadBoardData(activeBoard.id)}>
            ↺ Refresh
          </button>
        </div>

        {/* Board content */}
        {loadingBoard ? (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div className="kb-spinner" />
          </div>
        ) : (
          <div className="kb-columns">
            {columns.map((col, ci) => {
              const colTasks = tasksByCol[col.id] || [];
              const accent   = COL_ACCENT[col.title] || "#818cf8";
              const isAdding = addingCol === col.id;

              return (
                <div key={col.id} className="kb-col"
                  style={{ animationDelay:`${ci * 55}ms` }}>

                  <div className="kb-col-header">
                    <div className="kb-col-dot" style={{ background: accent }} />
                    <span className="kb-col-title">{col.title}</span>
                    <span className="kb-col-count">{colTasks.length}</span>
                    <button className="kb-col-add"
                      onClick={() => {
                        setAddingCol(isAdding ? null : col.id);
                        setNewTaskTitle("");
                      }}>+</button>
                  </div>

                  {colTasks.length === 0 && !isAdding && (
                    <div className="kb-empty-col">
                      <span style={{ fontSize:26 }}>📭</span>
                      <span>No tasks</span>
                    </div>
                  )}

                  {colTasks.map(task => {
                    const prio   = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
                    const type   = TYPE_META[task.work_type]      || TYPE_META.TASK;
                    const overdue = task.due_date && new Date(task.due_date) < new Date();
                    return (
                      <div key={task.id} className="kb-card"
                        onClick={() => setSelectedTask(task)}>
                        <div className="kb-card-title">{task.title}</div>
                        <div className="kb-card-footer">
                          <span className="kb-type-badge"
                            style={{ background:`${type.color}22`, color: type.color }}>
                            {type.icon} {task.work_type}
                          </span>
                          <span className="kb-prio-badge"
                            style={{ background: prio.bg, color: prio.color }}>
                            {prio.label}
                          </span>
                          {(task.assignees || []).length > 0 && (
                            <div style={{ display:"flex", marginLeft:"auto" }}>
                              {task.assignees.slice(0,3).map((a,i) => (
                                <Avatar key={a.id} name={a.username} size={20} index={i} />
                              ))}
                            </div>
                          )}
                          {task.due_date && (
                            <span className="kb-due"
                              style={{ color: overdue ? "#f87171" : "rgba(255,255,255,0.3)" }}>
                              {overdue ? "⚠ " : ""}
                              {new Date(task.due_date).toLocaleDateString("en-US",
                                { month:"short", day:"numeric" })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {isAdding ? (
                    <div className="kb-add-form">
                      <textarea className="kb-add-input" rows={2}
                        placeholder="Task title…"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault(); handleAddTask(col);
                          }
                        }}
                        autoFocus />
                      <div className="kb-add-actions">
                        <button className="kb-add-confirm"
                          onClick={() => handleAddTask(col)}>Add task</button>
                        <button className="kb-add-cancel"
                          onClick={() => { setAddingCol(null); setNewTaskTitle(""); }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="kb-col-add-row"
                      onClick={() => { setAddingCol(col.id); setNewTaskTitle(""); }}>
                      + Add task
                    </button>
                  )}
                </div>
              );
            })}

            {columns.length === 0 && (
              <div style={{ color:"rgba(255,255,255,0.2)", fontSize:14, padding:"40px 0" }}>
                No columns found for this board.
              </div>
            )}
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          workspaceId={selectedWorkspace?.id}
          onClose={() => setSelectedTask(null)}
          onSaved={handleTaskSaved}
        />
      )}
    </>
  );
}

const emptyWrap = {
  flex: 1, display:"flex", flexDirection:"column",
  alignItems:"center", justifyContent:"center",
  background:"#0d0f16", fontFamily:"'Plus Jakarta Sans', sans-serif",
  minHeight:"calc(100vh - 56px)",
};
const emptyH = { fontSize:18, fontWeight:600, color:"rgba(255,255,255,0.4)", marginBottom:8 };
const emptyP = { fontSize:14, color:"rgba(255,255,255,0.2)", textAlign:"center", maxWidth:320 };