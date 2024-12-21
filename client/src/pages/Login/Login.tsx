import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

import { useAuth } from "../../context/AuthContext";

const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(username, password);
      navigate("/typetest");
    } catch (err) {
      setError("Invalid username or password. Please try again.");
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
