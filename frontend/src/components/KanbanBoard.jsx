import { useEffect, useState } from "react";
import api from "../api/axios";
import CreateTaskModal from "./CreateTaskModal";

export default function KanbanBoard() {
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState(null);

  /* -----------------------------
     LOAD COLUMNS + TASKS
  ----------------------------- */
  const loadBoard = async () => {
    setLoading(true);
    try {
      const [colsRes, tasksRes] = await Promise.all([
        api.get("/task-lists/"),
        api.get("/tasks/")
      ]);

      setColumns(colsRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error("Failed to load board", err);
      setColumns([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoard();
  }, []);

  /* -----------------------------
     FILTER TASKS PER COLUMN
  ----------------------------- */
  const tasksForColumn = (columnId) =>
    tasks.filter(task => task.task_list === columnId);

  if (loading) {
    return <p style={{ padding: 16 }}>Loading board…</p>;
  }

  return (
    <>
      <style>{`
        .kanban-board {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: #f4f5f7;
          min-height: 60vh;
        }

        .kanban-column {
          background: #ebecf0;
          border-radius: 6px;
          padding: 12px;
          width: 260px;
        }

        .kanban-column h4 {
          margin: 0 0 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .kanban-task {
          background: white;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 8px;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .kanban-task:hover {
          background: #f1f2f4;
        }

        .kanban-task-title {
          font-weight: 500;
        }

        .kanban-task-meta {
          font-size: 12px;
          color: #6b778c;
        }

        .empty-column {
          font-size: 12px;
          color: #6b778c;
        }
      `}</style>

      <div className="kanban-board">
        {columns.map(col => (
          <div key={col.id} className="kanban-column">
            <h4>
              {col.title.toUpperCase()}{" "}
              <span style={{ color: "#6b778c" }}>
                {tasksForColumn(col.id).length}
              </span>
            </h4>

            {tasksForColumn(col.id).length === 0 && (
              <div className="empty-column">No tasks</div>
            )}

            {tasksForColumn(col.id).map(task => (
              <div
                key={task.id}
                className="kanban-task"
                onClick={() => setSelectedTask(task)}
              >
                <div className="kanban-task-title">
                  {task.title}
                </div>

                <div className="kanban-task-meta">
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 🔥 EDIT TASK MODAL */}
      {selectedTask && (
        <CreateTaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onCreated={() => {
            setSelectedTask(null);
            loadBoard(); // 🔥 refresh board after update
          }}
        />
      )}
    </>
  );
}
