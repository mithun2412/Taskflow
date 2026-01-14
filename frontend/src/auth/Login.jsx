import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./authService";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Login to TaskFlow</h2>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p style={styles.error}>{error}</p>}

        {/* 🔽 NEW USER REDIRECT */}
        <p style={styles.registerText}>
          New here?{" "}
          <span
            style={styles.registerLink}
            onClick={() => navigate("/register")}
          >
            Create an account
          </span>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#F4F5F7",
  },
  form: {
    width: "320px",
    padding: "40px",
    background: "#fff",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  error: {
    color: "red",
    fontSize: "14px",
  },
  registerText: {
    fontSize: "14px",
    textAlign: "center",
    marginTop: "8px",
  },
  registerLink: {
    color: "#0052CC",
    cursor: "pointer",
    fontWeight: "500",
  },
};
