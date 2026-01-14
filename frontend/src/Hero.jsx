import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const handleCTA = () => {
    if (token) {
      navigate("/projects");
    } else {
      navigate("/login");
    }
  };

  return (
    <section style={styles.hero}>
      <h1 style={styles.title}>Plan. Track. Deliver.</h1>

      <p style={styles.subtitle}>
        TaskFlow helps teams plan projects, track progress,
        and deliver work efficiently using Jira-style boards.
      </p>

      <button onClick={handleCTA} style={styles.cta}>
        {token ? "Go to Dashboard" : "Get Started"}
      </button>
    </section>
  );
}

const styles = {
  hero: {
    height: "calc(100vh - 64px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "0 20px",
    backgroundColor: "#F4F5F7",
  },
  title: {
    fontSize: "44px",
    fontWeight: "700",
    color: "#172B4D",
    marginBottom: "16px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#42526E",
    maxWidth: "600px",
    marginBottom: "32px",
  },
  cta: {
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: "600",
    backgroundColor: "#0052CC",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
