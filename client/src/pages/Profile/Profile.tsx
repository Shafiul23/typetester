import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./Profile.module.css";

const Profile: React.FC = () => {
  const { username } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={styles.profileContainer}>
      {error && <div className={styles.error}>{error}</div>}
      {username ? (
        <div className={styles.profileInfo}>
          <h1 className={styles.username}>{username}</h1>
          <p className={styles.details}>Welcome to your profile page!</p>
        </div>
      ) : (
        <div className={styles.loading}>Loading...</div>
      )}
    </div>
  );
};

export default Profile;
