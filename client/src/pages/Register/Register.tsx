import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Snackbar } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import styles from "./Register.module.css";
import Loading from "../../components/Loading/Loading";

const Register: React.FC = () => {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const validateInputs = (): string | null => {
    setErrorMessage(null);
    if (username.trim().length < 3) {
      return "Username must be at least 3 characters long.";
    }
    if (username.trim().length > 20) {
      return "Username must not exceed 20 characters.";
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return "Username can only contain letters and numbers.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one digit.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match!";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validationError = validateInputs();
    if (validationError) {
      setErrorMessage(validationError);
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await register(username, password);
      if (response?.success) {
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setErrorMessage(null);
        navigate("/login");
      } else {
        setErrorMessage(response?.message || "Registration failed");
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
        message={errorMessage || "Something went wrong"}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
};

export default Register;
