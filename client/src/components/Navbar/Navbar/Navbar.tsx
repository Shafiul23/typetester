import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import classNames from "classnames";
import { useAuth } from "../../../context/AuthContext";

const Navbar: React.FC = () => {
  const { userId, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Error during logout", err);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandPrimary}>Type</span>
          <span className={styles.brandSecondary}>Tester</span>
        </Link>

        <button
          className={styles.hamburger}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>

        <div
          className={classNames(styles.navLinks, {
            [styles.open]: isMenuOpen,
          })}
        >
          <ul className={styles.navList}>
            {userId ? (
              <>
                <li className={styles.navItem}>
                  <Link
                    className={styles.navLink}
                    to="/leaderboard"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Leaderboard
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link
                    className={styles.navLink}
                    to="/typetest"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Type Test
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link
                    className={styles.navLink}
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <button
                    className={classNames(styles.navLink, styles.logoutButton)}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className={styles.navItem}>
                  <Link
                    className={styles.navLink}
                    to="/leaderboard"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Leaderboard
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link
                    className={styles.navLink}
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link
                    className={styles.navLink}
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
