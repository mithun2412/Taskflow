import { useState } from "react";
import api from "../api/axios";

export default function InvitePeopleModal({ workspaceId, onClose, onSuccess }) {
  const [email, setEmail] = useState("");

  const handleAdd = async () => {
    if (!email.trim()) {
      alert("Email is required");
      return;
    }

    try {
      await api.post("/add-workspace-member/", {
        workspace: workspaceId,
        email: email
      });

      onSuccess(); // refresh members
      onClose();
    } catch (err) {
      alert(
        err.response?.data?.error || "Failed to add user"
      );
    }
  };

  return (
    <>
      <style>{`
        .invite-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .invite-modal {
          width: 420px;
          background: white;
          border-radius: 8px;
          padding: 20px;
        }

        .invite-modal textarea {
          width: 100%;
          min-height: 60px;
          padding: 8px;
          border: 1px solid #DFE1E6;
          border-radius: 4px;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 16px;
        }
      `}</style>

      <div className="invite-backdrop">
        <div className="invite-modal">
          <h3>Add people</h3>

          <textarea
            placeholder="Enter registered user email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <div className="actions">
            <button onClick={onClose}>Cancel</button>
            <button onClick={handleAdd}>Add</button>
          </div>
        </div>
      </div>
    </>
  );
}
