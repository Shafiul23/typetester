import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Snackbar } from "@mui/material";
import styles from "./Login.module.css";

import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading/Loading";
import useSubmitScore from "../../hooks/useSubmitScore";

const Login: React.FC = () => {
  const { login } = useAuth();
  const { submitScore } = useSubmitScore();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const response = await login(username, password);
      if (response?.success) {
        const pending = localStorage.getItem("pendingScore");
        if (pending) {
          await submitScore(Number(pending));
          localStorage.removeItem("pendingScore");
          navigate("/profile");
        } else {
          navigate("/");
        }
      } else {
        setErrorMessage(
          response?.message || "An unexpected error occurred. Please try again."
        );
        setPassword("");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred.");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Login</h2>
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              autoComplete="off"
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

          {errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            Login
          </button>
        </form>
        {loading && <Loading />}

        <div className={styles.footer}>
          <p className={styles.footerText}>Don't have an account?</p>
          <Link to="/register" className={styles.registerLink}>
            Register here
          </Link>
        </div>
      </div>
      <Snackbar
        open={openSnackbar}
        message={errorMessage || "Something went wrong"}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
};

export default Login;
