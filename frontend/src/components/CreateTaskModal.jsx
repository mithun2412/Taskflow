import { useEffect, useState } from "react";
import api from "../api/axios";

const STATUS_COLORS = {
  TODO: "#DFE1E6",
  IN_PROGRESS: "#DEEBFF",
  IN_REVIEW: "#EAE6FF",
  DONE: "#E3FCEF",
};

export default function CreateTaskModal({ task, onClose, onCreated }) {
  const isEdit = Boolean(task);

  const [error, setError] = useState("");
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const [form, setForm] = useState({
    workspace: "",
    team: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    assignees: [],
    status: "TODO",
    is_published: false,
  });

  /* ---------------- PREFILL EDIT ---------------- */
  useEffect(() => {
    if (!task) return;

    setForm({
      workspace: task.workspace,
      team: task.team,
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      assignees: task.assignees?.map(a => a.id) || [],
      status: task.status,
      is_published: task.is_published || false,
    });
  }, [task]);

  /* ---------------- LOAD TEAM + USERS ---------------- */
  useEffect(() => {
    if (!form.workspace) return;

    api.get(`/projects/?workspace=${form.workspace}`)
      .then(res => setTeams(res.data));

    api.get(`/users/?workspace=${form.workspace}`)
      .then(res => setUsers(res.data));
  }, [form.workspace]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleAssigneeChange = e => {
    const v = Number(e.target.value);
    setForm(p => ({ ...p, assignees: v ? [v] : [] }));
  };

  const updateStatus = status => {
    setForm(p => ({ ...p, status }));
    setShowStatusMenu(false);
  };

  /* ---------------- SUBMIT ---------------- */
  const submit = async (publish = false) => {
    setError("");

    if (!form.title.trim()) {
      setError("Summary is required");
      return;
    }

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
      if (isEdit) {
        await api.patch(`/tasks/${task.id}/`, payload);
      } else {
        await api.post("/tasks/", payload);
      }

      onCreated();
      onClose();
    } catch {
      setError("Something went wrong");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={overlay}>
      <div style={modal}>
        {/* HEADER */}
        <div style={header}>
          <h3>{isEdit ? "Edit Task" : "Create Task"}</h3>

          {/* TOP RIGHT CONTROLS */}
          {isEdit && (
            <div style={topRight}>
              {/* STATUS */}
              <div style={{ position: "relative" }}>
                <div
                  onClick={() => setShowStatusMenu(v => !v)}
                  style={{
                    background: STATUS_COLORS[form.status],
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {form.status.replace("_", " ")}
                </div>

                {showStatusMenu && (
                  <div style={statusMenu}>
                    {Object.keys(STATUS_COLORS).map(s => (
                      <div
                        key={s}
                        onClick={() => updateStatus(s)}
                        style={statusItem}
                      >
                        {s.replace("_", " ")}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 🔥 PUBLISH (TOP RIGHT) */}
              {!form.is_published && (
                <button
                  onClick={() => submit(true)}
                  style={publishBtn}
                >
                  Publish
                </button>
              )}
            </div>
          )}
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* TEAM */}
        <label>Team</label>
        <select name="team" value={form.team || ""} onChange={handleChange}>
          <option value="">Select team</option>
          {teams.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        {/* SUMMARY */}
        <label>Summary</label>
        <input name="title" value={form.title} onChange={handleChange} />

        {/* DESCRIPTION */}
        <label>Description</label>
        <textarea
          rows={4}
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        {/* ASSIGNEE */}
        <label>Assignee</label>
        <select value={form.assignees[0] || ""} onChange={handleAssigneeChange}>
          <option value="">Select assignee</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.email}</option>
          ))}
        </select>

        {/* PRIORITY */}
        <label>Priority</label>
        <select name="priority" value={form.priority} onChange={handleChange}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        {/* ACTIONS */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={() => submit(false)}
            style={{ background: "#0052cc", color: "white" }}
          >
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  width: 560,
  background: "white",
  padding: 20,
  borderRadius: 8,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const topRight = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const publishBtn = {
  background: "#36B37E",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: 6,
  fontSize: 12,
  cursor: "pointer",
};

const statusMenu = {
  position: "absolute",
  right: 0,
  top: 32,
  background: "white",
  border: "1px solid #dfe1e6",
  borderRadius: 6,
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  zIndex: 20,
};

const statusItem = {
  padding: "8px 12px",
  cursor: "pointer",
  fontSize: 12,
};
