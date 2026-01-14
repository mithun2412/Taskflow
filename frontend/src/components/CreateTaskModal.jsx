import { useState } from "react";
import api from "../api/axios";

export default function CreateTaskModal({ onClose, taskLists }) {
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [taskList, setTaskList] = useState("");
  const [priority, setPriority] = useState("Medium");

  const handleCreate = async () => {
    if (!summary || !taskList) {
      alert("Summary and Status are required");
      return;
    }

    await api.post("/tasks/", {
      title: summary,
      description,
      task_list: taskList,
      priority
    });

    onClose();
  };

  return (
    <>
      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }

        .modal {
          background: white;
          width: 700px;
          border-radius: 8px;
          padding: 20px;
        }

        .modal h3 {
          margin-top: 0;
        }

        .field {
          margin-bottom: 14px;
        }

        .field label {
          font-size: 13px;
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
        }

        .field input,
        .field textarea,
        .field select {
          width: 100%;
          padding: 8px;
          border: 1px solid #dfe1e6;
          border-radius: 4px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
        }

        .btn.primary {
          background: #0052cc;
          color: white;
        }
      `}</style>

      <div className="modal-backdrop">
        <div className="modal">
          <h3>Create Task</h3>

          {/* STATUS / COLUMN */}
          <div className="field">
            <label>Status *</label>
            <select
              value={taskList}
              onChange={e => setTaskList(e.target.value)}
            >
              <option value="">Select status</option>
              {taskLists.map(list => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          {/* SUMMARY */}
          <div className="field">
            <label>Summary *</label>
            <input
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="What needs to be done?"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="field">
            <label>Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* PRIORITY */}
          <div className="field">
            <label>Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          {/* ACTIONS */}
          <div className="modal-actions">
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button className="btn primary" onClick={handleCreate}>
              Create
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
