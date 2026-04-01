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
        ⚡ TaskFlow
      </Link>

      <div style={styles.actions}>
        {!token ? (
          <Link to="/login" style={styles.loginBtn}>
            Login →
          </Link>
        ) : (
          <>
            <div style={styles.welcomeBadge}>
              <div style={styles.avatar}>
                {username ? username[0].toUpperCase() : "?"}
              </div>
              <span style={styles.welcome}>
                {username}
              </span>
            </div>

            <Link to="/workspaces" style={styles.dashboardBtn} >
              Dashboard
            </Link>

            <button onClick={handleLogout} style={styles.logoutBtn}
              onMouseEnter={e => {
                e.target.style.background = "#DC2626";
                e.target.style.color = "#fff";
              }}
              onMouseLeave={e => {
                e.target.style.background = "transparent";
                e.target.style.color = "#DC2626";
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    height: "68px",
    padding: "0 48px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderBottom: "1.5px solid #E5E7EB",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 16px rgba(0, 0, 0, 0.06)",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0052CC",
    textDecoration: "none",
    letterSpacing: "-0.5px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  welcomeBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "5px 12px 5px 6px",
    backgroundColor: "#F3F4F6",
    borderRadius: "50px",
    border: "1px solid #E5E7EB",
  },
  avatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0052CC, #2684FF)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  welcome: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#111827",
  },
  dashboardBtn: {
    textDecoration: "none",
    padding: "8px 18px",
    backgroundColor: "#E9F2FF",
    color: "#0052CC",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
  },
  loginBtn: {
    textDecoration: "none",
    padding: "9px 22px",
    background: "linear-gradient(135deg, #0052CC, #2684FF)",
    color: "#FFFFFF",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    boxShadow: "0 2px 8px rgba(0,82,204,0.3)",
  },
  logoutBtn: {
    padding: "8px 18px",
    border: "1.5px solid #DC2626",
    color: "#DC2626",
    background: "transparent",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.15s ease",
  },
};