import { useState } from "react";
import JiraTopBar from "../components/JiraTopBar";
import WorkspaceSidebar from "../components/WorkspaceSidebar";
import ProjectHeader from "../components/ProjectHeader";
import BoardTabs from "../components/BoardTabs";
import KanbanBoard from "../components/KanbanBoard";
import InvitePeopleModal from "../components/InvitePeopleModal";
import CreateTaskModal from "../components/CreateTaskModal";

export default function Projects() {
  const [activeView,        setActiveView]        = useState("BOARD");
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [selectedProject,   setSelectedProject]   = useState(null);  // ✅ ADDED
  const [showInvite,        setShowInvite]        = useState(false);
  const [showCreate,        setShowCreate]        = useState(false);
  const [reloadBoard,       setReloadBoard]       = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        body {
          margin: 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #0d0f16;
          color: #1a1f36;
        }

        .app-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0d0f16;
        }

        .app-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .app-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow-y: auto;
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          text-align: center;
          gap: 12px;
        }

        .empty-icon  { font-size: 56px; opacity: 0.5; }
        .empty-title { font-size: 18px; font-weight: 700; color: rgba(255,255,255,0.4); }
        .empty-sub   { font-size: 14px; color: rgba(255,255,255,0.2); max-width: 300px; line-height: 1.6; }

        .placeholder-view {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          padding: 40px;
          color: rgba(255,255,255,0.25);
          font-size: 15px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      <div className="app-shell">
        <JiraTopBar onCreateClick={() => setShowCreate(true)} />

        <div className="app-body">

          {/* ✅ ALL 4 PROPS — missing setSelectedProject was the crash */}
          <WorkspaceSidebar
            selectedWorkspace={selectedWorkspace}
            setSelectedWorkspace={setSelectedWorkspace}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
          />

          <div className="app-main">
            {selectedWorkspace ? (
              <>
                {/* Show selected project name in header, fallback to workspace */}
                <ProjectHeader
                  name={selectedProject ? selectedProject.name : selectedWorkspace.name}
                />
                <BoardTabs activeView={activeView} setActiveView={setActiveView} />

                {activeView === "BOARD" && (
                  // key includes selectedProject.id so board fully remounts on project switch
                  <KanbanBoard
                    key={`${selectedProject?.id}-${reloadBoard}`}
                    selectedProject={selectedProject}
                    selectedWorkspace={selectedWorkspace}
                  />
                )}

                {activeView !== "BOARD" && (
                  <div className="placeholder-view">
                    📐 {activeView.charAt(0) + activeView.slice(1).toLowerCase()} view coming soon
                  </div>
                )}
              </>
            ) : (
              <>
                <ProjectHeader name="Select a workspace" />
                <div className="empty-state">
                  <div className="empty-icon">🗂️</div>
                  <div className="empty-title">No workspace selected</div>
                  <div className="empty-sub">
                    Choose a workspace from the sidebar to view your board and tasks.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {showInvite && selectedWorkspace && (
          <InvitePeopleModal
            workspaceId={selectedWorkspace.id}
            onClose={() => setShowInvite(false)}
            onSuccess={() => {}}
          />
        )}

        {showCreate && selectedWorkspace && (
          <CreateTaskModal
            workspaceId={selectedWorkspace.id}
            onClose={() => setShowCreate(false)}
            onCreated={() => setReloadBoard(r => !r)}
          />
        )}
      </div>
    </>
  );
}