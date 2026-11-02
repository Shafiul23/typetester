import React, { useEffect, useState } from "react";
import styles from "./Leaderboard.module.css";
import Loading from "../../components/Loading/Loading";

interface LeaderboardEntry {
  score_id: number;
  user_id: number;
  username: string;
  score: number;
  duration_seconds: number | null;
  created: string;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const fetchLeaderboard = async () => {
      try {
        const results = await Promise.all(
          [15, 30, 60].map(async (duration) => {
            const response = await fetch(
              `${process.env.REACT_APP_BACKEND_API_URL}/auth/leaderboard?duration_seconds=${duration}`
            );
            if (!response.ok) {
              throw new Error("Failed to fetch leaderboard data");
            }
            const data = await response.json();
            return data.leaderboard as LeaderboardEntry[];
          })
        );
        const combined = results.flat().sort((a, b) => b.score - a.score);
        if (active) setLeaderboard(combined);
      } catch (err) {
        if (active) setError((err as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchLeaderboard();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loading />
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.leaderboardContainer}>
      <h1 className={styles.title}>Leaderboard</h1>

      {leaderboard && leaderboard.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Score / wpm</th>
              <th>Duration</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={entry.score_id}>
                <td>{index + 1}</td>
                <td>{entry.username}</td>
                <td>{entry.score}</td>
                <td>{entry.duration_seconds == null ? "Unknown" : `${entry.duration_seconds} s`}</td>
                <td>
                  {new Date(entry.created).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={styles.noData}>No scores available.</div>
      )}
    </div>
  );
};

export default Leaderboard;
