import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./Profile.module.css";
import { useNavigate } from "react-router-dom";

interface Score {
  score_id: number;
  user_id: number;
  username: string;
  score: number;
  created: string;
}

const Profile: React.FC = () => {
  const { username, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderBy, setOrderBy] = useState<string>("created");

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
      const response = await fetch(`http://127.0.0.1:5000/auth/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete profile.");
      }

      logout();
      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/auth/personal?order_by=${orderBy}`,
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
        setScores(data.personal);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [orderBy]);

  return (
    <div className={styles.profileContainer}>
      {error && <div className={styles.error}>{error}</div>}
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          {username && (
            <h1 className={styles.username}>{`Welcome, ${username}`}</h1>
          )}

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
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score) => (
                    <tr key={score.score_id}>
                      <td>{score.score}</td>
                      <td>{new Date(score.created).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.noScores}>No scores to display.</p>
            )}
          </div>
        </>
      )}
      <button
        onClick={deleteProfile}
        className={styles.deleteButton}
        data-testid="delete-button"
      >
        Delete Profile
      </button>
    </div>
  );
};

export default Profile;
