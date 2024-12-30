import React from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import { useAuth } from "../../context/AuthContext";

const Home: React.FC = () => {
  const { userId } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Welcome to TypeTester!</h1>
        <p className={styles.subtitle}>
          Test your typing speed and compete with friends!
        </p>
        <div className={styles.bodyContainer}>
          <p>
            Sign in to access the Type Test page where you can choose between a
            randomized list of 300 common words or a short story.
          </p>
          <p>
            After completing the test, you'll get a score in words per minute
            (WPM), which is 40 on average.
          </p>
          <p>
            Hit the save button to store your score in the database, which you
            can view on the profile page.
          </p>
          <p>
            If you manage to get a <strong>top 20 score</strong>, you'll also be
            able to see it on the leaderboard!
          </p>
        </div>
        <div className={styles.buttonGroup}>
          {!userId ? (
            <>
              <Link to="/register" className={styles.buttonPrimary}>
                Register
              </Link>
              <Link to="/login" className={styles.buttonSecondary}>
                Login
              </Link>
            </>
          ) : (
            <Link to="/typetest" className={styles.buttonSuccess}>
              Start Typing Test
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
