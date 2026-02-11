import { useState } from "react";

import JiraTopBar from "../components/Temp";
import WorkspaceSidebar from "../components/WorkspaceSidebar";
import ProjectHeader from "../components/ProjectHeader";
import BoardTabs from "../components/BoardTabs";
import BoardToolbar from "../components/BoardToolbar";
import KanbanBoard from "../components/KanbanBoard";
import InvitePeopleModal from "../components/InvitePeopleModal";
import CreateTaskModal from "../components/CreateTaskModal";

export default function Projects() {
  const [activeView, setActiveView] = useState("BOARD");
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [reloadBoard, setReloadBoard] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7" }}>
      <JiraTopBar onCreateClick={() => setShowCreate(true)} />

      <div style={{ display: "flex" }}>
        <WorkspaceSidebar
          selectedWorkspace={selectedWorkspace}
          setSelectedWorkspace={setSelectedWorkspace}
        />

        <div style={{ flex: 1 }}>
          <ProjectHeader name={selectedWorkspace?.name || "Select workspace"} />

          <BoardTabs activeView={activeView} setActiveView={setActiveView} />

          {activeView === "BOARD" && selectedWorkspace && (
            <>
              <BoardToolbar
                workspaceId={selectedWorkspace.id}
                onAddPeople={() => setShowInvite(true)}
              />
              <KanbanBoard reload={reloadBoard} />
            </>
          )}
        </div>
      </div>

      {showInvite && selectedWorkspace && (
        <InvitePeopleModal
          workspaceId={selectedWorkspace.id}
          onClose={() => setShowInvite(false)}
        />
      )}

      {showCreate && selectedWorkspace && (
        <CreateTaskModal
          workspaceId={selectedWorkspace.id}
          onClose={() => setShowCreate(false)}
          onCreated={() => setReloadBoard(!reloadBoard)}
        />
      )}
    </div>
  );
}
