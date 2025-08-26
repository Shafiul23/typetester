import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Snackbar } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import styles from "./Register.module.css";
import Loading from "../../components/Loading/Loading";
import { useValidation } from "../../hooks/useValidation";
import useSubmitScore from "../../hooks/useSubmitScore";

const Register: React.FC = () => {
  const { register, login } = useAuth();
  const { validationError, validateInputs } = useValidation();
  const { submitScore } = useSubmitScore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateInputs(username, password, confirmPassword)) {
      setLoading(false);
      return;
    }

    try {
      const response = await register(username, password);
      if (response?.success) {
        const loginResponse = await login(username, password);
        if (loginResponse?.success) {
          const pending = localStorage.getItem("pendingScore");
          if (pending) {
            await submitScore(Number(pending));
            localStorage.removeItem("pendingScore");
            navigate("/profile");
          } else {
            navigate("/");
          }
        } else {
          navigate("/login");
        }
      } else {
        setBackendError(response?.message || "Registration failed");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setBackendError("An unexpected error occurred.");
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
      <div className={styles.card}>
        <h2 className={styles.title}>Create Account</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              required
              className={styles.input}
            />
          </div>
          <div className={styles.requirements}>
            Username must contain:
            <ul>
              <li>At least 3 characters</li>
              <li>Only letters and numbers</li>
            </ul>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              data-testid="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.requirements}>
            Password must contain:
            <ul>
              <li>At least 6 characters</li>
              <li>At least 1 lowercase letter</li>
              <li>At least 1 number</li>
            </ul>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          {validationError && (
            <div className={styles.errorMessage}>{validationError}</div>
          )}

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              Register
            </button>
          </div>
          {loading && <Loading />}

          <div className={styles.loginRedirect}>
            <p>
              Already have an account?{" "}
              <Link to="/login" className={styles.link}>
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>

      <Snackbar
        open={openSnackbar}
        message={backendError || "Something went wrong"}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
};

export default Register;
