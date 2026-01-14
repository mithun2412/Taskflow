import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Projects from "./pages/Projects";

/* ---------- PROTECTED ROUTE ---------- */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* ---------- PUBLIC ---------- */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ---------- DASHBOARD ---------- */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
