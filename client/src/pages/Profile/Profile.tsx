import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./Profile.module.css";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import { Snackbar } from "@mui/material";

interface Score {
  score_id: number;
  user_id: number;
  username: string;
  score: number;
  duration_seconds: number | null;
  created: string;
}

const Profile: React.FC = () => {
  const { username, logout } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [duration, setDuration] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [orderBy, setOrderBy] = useState<string>("created");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();

  const deleteProfile = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your profile? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API_URL}/auth/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete profile.");
      }

      logout();
      navigate("/login");
    } catch (err: any) {
      setErrorMessage(err.message);
      setOpenSnackbar(true);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setScores([]);
    const fetchScores = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_API_URL}/auth/personal?order_by=${orderBy}${duration === "all" ? "" : `&duration_seconds=${duration}`}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch personal scores.");
        }

        const data = await response.json();
        if (active) setScores(data.personal);
      } catch (err: any) {
        if (!active) return;
        setErrorMessage(err.message);
        setOpenSnackbar(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchScores();
    return () => { active = false; };
  }, [orderBy, duration]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loading />
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      {username && (
        <h1 className={styles.username}>{`Welcome, ${username}`}</h1>
      )}

      <label htmlFor="score-duration">Test duration </label>
      <select id="score-duration" value={duration} onChange={(event) => setDuration(event.target.value)}>
        <option value="all">All durations</option>
        <option value="15">15 seconds</option>
        <option value="30">30 seconds</option>
        <option value="60">60 seconds</option>
      </select>

      <div className={styles.tableContainer}>
        <div className={styles.tableTitleContainer}>
          <h2 className={styles.tableTitle}>Your Scores</h2>
          {orderBy === "created" ? (
            <button
              className={styles.sortButton}
              onClick={() => setOrderBy("score")}
            >
              Sort by Score
            </button>
          ) : (
            <button
              className={styles.sortButton}
              onClick={() => setOrderBy("created")}
            >
              Sort by Date
            </button>
          )}
        </div>
        {scores.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Score / wpm</th>
                <th>Duration</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score) => (
                <tr key={score.score_id}>
                  <td>{score.score}</td>
                  <td>{score.duration_seconds == null ? "Unknown" : `${score.duration_seconds} s`}</td>
                  <td>
                    {new Date(score.created).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.noScores}>No scores to display.</p>
        )}
      </div>
      <button
        onClick={deleteProfile}
        className={styles.deleteButton}
        data-testid="delete-button"
      >
        Delete Profile
      </button>

      <Snackbar
        open={openSnackbar}
        message={errorMessage || "Something went wrong"}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
};

export default Profile;
