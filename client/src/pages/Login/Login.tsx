import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Login.module.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation (you can extend this based on your requirements)
    if (!username || !password) {
      setError("Both fields are required.");
      return;
    }

    // Simulate a login process (replace with real authentication logic)
    if (username === "user@example.com" && password === "password") {
      localStorage.setItem("user", username); // Store user in localStorage
      window.location.href = "/"; // Redirect to the home page
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Login</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Login
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>Don't have an account?</p>
          <Link to="/register" className={styles.registerLink}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
