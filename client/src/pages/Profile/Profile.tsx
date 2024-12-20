import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./Profile.module.css";

const Profile: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/auth/status", {
          credentials: "include",
        });
        const data = await response.json();

        if (response.ok && data.logged_in) {
          setUser({ username: data.username });
        } else {
          setError("You are not logged in.");
        }
      } catch (err) {
        setError("An error occurred while fetching the profile.");
      }
    };

    if (isLoggedIn) {
      fetchProfileData();
    }
  }, [isLoggedIn]);

  return (
    <div className={styles.profileContainer}>
      {error && <div className={styles.error}>{error}</div>}
      {user ? (
        <div className={styles.profileInfo}>
          <h1 className={styles.username}>{user.username}</h1>
          <p className={styles.details}>Welcome to your profile page!</p>
        </div>
      ) : (
        <div className={styles.loading}>Loading...</div>
      )}
    </div>
  );
};

export default Profile;
