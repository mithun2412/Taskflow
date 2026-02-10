# 🚀 TaskFlow – Jira-Like Project Management System

TaskFlow is a Jira-inspired project management system built using **Django REST Framework** and **React**.  
It enables teams to manage work using **Workspaces, Projects, Boards, and Kanban Tasks**, following real-world Jira design principles.

---

## 🧠 Core Concept (Jira-Style Hierarchy)

User
└── Workspace (Organization / Company)
└── Project (Team / Initiative)
└── Board (Kanban Board)
└── Task Lists (Columns)
└── Tasks (Cards)
├── Assignees
├── Comments
└── Activity Logs


---

## ✨ Features Implemented

### 🔐 Authentication
- JWT authentication using **SimpleJWT**
- All APIs protected using `IsAuthenticated`

### 🏢 Workspace Management
- Only **Django superusers** can create workspaces
- Users can view **only the workspaces they belong to**
- Membership managed via `WorkspaceMember` table

### 👥 Role-Based Access Control
- **Superuser (Global Admin)**
  - Can create workspaces, projects, and boards
- **Workspace Member**
  - Can view workspaces, projects, boards
  - Can create tasks and comments
- Roles are **workspace-scoped**, not global

### 📋 Projects & Boards
- Projects belong to a workspace
- Boards belong to a project
- Default **Main Board** pattern supported

### 🧩 Kanban System
- Boards contain **Task Lists (columns)**:
  - To Do
  - In Progress
  - In Review
  - Done
- Tasks belong to **exactly one task list**
- Moving tasks updates `task_list_id`

### 💬 Collaboration
- Task comments
- Task assignees (many-to-many)
- Activity logs for tracking actions

---

## 🏗️ Tech Stack

### Backend
- Python
- Django
- Django REST Framework
- PostgreSQL / SQLite
- JWT (SimpleJWT)

### Frontend
- React (Vite)
- Axios
- State-driven UI
- Jira-style single dashboard layout

---

## 🧱 Database Design

Main tables used:

- `auth_user`
- `workspace`
- `workspace_member`
- `project`
- `board`
- `task_list`
- `task`
- `task_assignee`
- `comment`
- `activity_log`

> `workspace_member` is the core table that controls permissions.

---

## 🔑 Permission Matrix

| Action | Superuser | Workspace Member |
|------|----------|------------------|
Create workspace | ✅ | ❌ |
Create project | ✅ | ❌ |
Create board | ✅ | ❌ |
View workspace | ✅ | ✅ |
Create task | ✅ | ✅ |
Comment on task | ✅ | ✅ |
Add members | ✅ | ❌ |

---

## 🧠 Design Decisions

- **Task Lists are created before Tasks**
- Tasks cannot exist without a column
- Board structure is independent per project
- Permissions are layered (global + workspace)
- Schema matches real Jira architecture

---

## 📂 API Overview

### Workspaces
GET /api/workspaces/
POST /api/workspaces/ (superuser only)


### Projects
GET /api/projects/
POST /api/projects/ (superuser only)


### Boards
GET /api/boards/
POST /api/boards/ (superuser only)


### Tasks
GET /api/tasks/
POST /api/tasks/
PUT /api/tasks/{id}/


---

## 🧪 Run Locally

### Backend
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
Frontend
npm install
npm run dev