import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api/axios";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (token) {
      api.get("/me/")
        .then((res) => setUsername(res.data.username))
        .catch(() => setUsername(""));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        TaskFlow
      </Link>

      <div style={styles.actions}>
        {!token ? (
          <Link to="/login" style={styles.loginBtn}>
            Login
          </Link>
        ) : (
          <>
            <span style={styles.welcome}>
              Welcome, <b>{username}</b>
            </span>

            <Link to="/workspaces" style={styles.dashboardBtn}>
              Dashboard
            </Link>

            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

/* ✅ STYLES MUST EXIST */
const styles = {
  nav: {
    height: "64px",
    padding: "0 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#0052CC",
    textDecoration: "none",
  },
  actions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  loginBtn: {
    textDecoration: "none",
    padding: "8px 16px",
    backgroundColor: "#0052CC",
    color: "#FFFFFF",
    borderRadius: "6px",
    fontSize: "14px",
  },
  dashboardBtn: {
    textDecoration: "none",
    padding: "8px 16px",
    backgroundColor: "#E9F2FF",
    color: "#0052CC",
    borderRadius: "6px",
    fontSize: "14px",
  },
  logoutBtn: {
    padding: "8px 16px",
    border: "1px solid #DC2626",
    color: "#DC2626",
    background: "transparent",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  welcome: {
    fontSize: "14px",
    color: "#374151",
  },
};
