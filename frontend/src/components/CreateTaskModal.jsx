import { useEffect, useState } from "react";
import api from "../api/axios";

export default function CreateTaskModal({ onClose, onCreated }) {
  const [error, setError] = useState("");

  const [workspaces, setWorkspaces] = useState([]);
  const [teams, setTeams] = useState([]);   // Projects shown as Teams
  const [users, setUsers] = useState([]);

  const currentUserEmail = localStorage.getItem("email");

  const [form, setForm] = useState({
    workspace: "",
    team: "",
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assignees: [],
  });

  /* -----------------------------
     LOAD WORKSPACES
  ----------------------------- */
  useEffect(() => {
    api.get("/workspaces/")
      .then(res => setWorkspaces(res.data))
      .catch(() => setWorkspaces([]));
  }, []);

  /* -----------------------------
     LOAD TEAMS + USERS
  ----------------------------- */
  useEffect(() => {
    if (!form.workspace) {
      setTeams([]);
      setUsers([]);
      return;
    }

    const workspaceId = Number(form.workspace);

    // 🔹 Load Teams (Projects)
    api.get(`/projects/?workspace=${workspaceId}`)
      .then(res => setTeams(res.data))
      .catch(() => setTeams([]));

    // 🔹 Load Users (Assignees)
    api.get(`/users/?workspace=${workspaceId}`)
      .then(res => {
        setUsers(res.data);

        const me = res.data.find(u => u.email === currentUserEmail);
        if (me) {
          setForm(prev => ({
            ...prev,
            assignees: [me.id],
          }));
        }
      })
      .catch(() => setUsers([]));

  }, [form.workspace, currentUserEmail]);

  /* -----------------------------
     HANDLERS
  ----------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === "workspace" ? { team: "" } : {})
    }));
  };

  const handleAssigneeChange = (e) => {
    const value = Number(e.target.value);
    setForm(prev => ({
      ...prev,
      assignees: value ? [value] : [],
    }));
  };

  /* -----------------------------
     SUBMIT
  ----------------------------- */
  const submit = async () => {
    setError("");

    if (!form.workspace || !form.title.trim()) {
      setError("Workspace and Summary are required");
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      team: form.team ? Number(form.team) : null,
      assignees: form.assignees,
    };

    try {
      await api.post("/tasks/", payload);
      onCreated();
      onClose();
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data, null, 2)
          : "Something went wrong"
      );
    }
  };

  /* -----------------------------
     UI
  ----------------------------- */
  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Create Task</h3>

        {error && <pre style={{ color: "red" }}>{error}</pre>}

        {/* Workspace */}
        <label>Workspace *</label>
        <select
          name="workspace"
          value={form.workspace}
          onChange={handleChange}
        >
          <option value="">Select workspace</option>
          {workspaces.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>

        {/* Status */}
        <label>Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>

        {/* Summary */}
        <label>Summary *</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
        />

        {/* Description */}
        <label>Description</label>
        <textarea
          name="description"
          rows={4}
          value={form.description}
          onChange={handleChange}
        />

        {/* Assignee */}
        <label>Assignee (email)</label>
        <select
          value={form.assignees[0] || ""}
          onChange={handleAssigneeChange}
        >
          <option value="">Select assignee</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.email}
            </option>
          ))}
        </select>

        {/* Priority */}
        <label>Priority</label>
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        {/* Team */}
        <label>Team</label>
        <select
          name="team"
          value={form.team}
          onChange={handleChange}
          disabled={!teams.length}
        >
          <option value="">
            {teams.length ? "Select team" : "No teams available"}
          </option>
          {teams.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={submit}
            style={{ background: "#0052cc", color: "white" }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   STYLES
----------------------------- */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modal = {
  width: 560,
  background: "white",
  padding: 20,
  borderRadius: 6,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};
