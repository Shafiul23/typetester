import React, { useEffect, useState } from "react";
import styles from "./Leaderboard.module.css";

interface LeaderboardEntry {
  score_id: number;
  user_id: number;
  username: string;
  score: number;
  created: string;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/auth/leaderboard");
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }
        const data = await response.json();
        setLeaderboard(data.leaderboard);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading leaderboard...</div>;
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
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={entry.score_id}>
                <td>{index + 1}</td>
                <td>{entry.username}</td>
                <td>{entry.score}</td>
                <td>{new Date(entry.created).toLocaleDateString()}</td>
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
