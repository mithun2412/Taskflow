import { useState } from "react";

import JiraTopBar from "../components/JiraTopBar";
import WorkspaceSidebar from "../components/WorkspaceSidebar";
import ProjectHeader from "../components/ProjectHeader";
import BoardTabs from "../components/BoardTabs";
import BoardToolbar from "../components/BoardToolbar";
import KanbanBoard from "../components/KanbanBoard";

export default function Projects() {
  const [activeView, setActiveView] = useState("BOARD");
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7" }}>
      {/* TOP BAR */}
      <JiraTopBar />

      {/* MAIN LAYOUT */}
      <div style={{ display: "flex" }}>
        {/* SIDEBAR */}
        <WorkspaceSidebar
          selectedWorkspace={selectedWorkspace}
          setSelectedWorkspace={setSelectedWorkspace}
        />

        {/* MAIN CONTENT */}
        <div style={{ flex: 1 }}>
          <ProjectHeader
            name={selectedWorkspace?.name || "Select a workspace"}
          />

          <BoardTabs
            activeView={activeView}
            setActiveView={setActiveView}
          />

          {activeView === "BOARD" && <BoardToolbar />}
          {activeView === "BOARD" && <KanbanBoard />}

          {activeView === "TIMELINE" && <div>Timeline view</div>}
          {activeView === "REPORTS" && <div>Reports view</div>}
        </div>
      </div>
    </div>
  );
}
