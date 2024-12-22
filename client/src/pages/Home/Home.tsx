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
