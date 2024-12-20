import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import classNames from "classnames";
import { useAuth } from "../../../context/AuthContext";

const Navbar: React.FC = () => {
  const { isLoggedIn, setIsLoggedIn, checkAuthStatus } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setIsLoggedIn(false);
        checkAuthStatus();
        setIsMenuOpen(false);
        navigate("/");
        console.log(data.message);
      } else {
        console.error("Logout failed:", data.error);
      }
    } catch (err) {
      console.error("Error during logout", err);
    }
  };

  useEffect(() => {
    console.log("Is logged in: ", isLoggedIn); // Debug log
  }, [isLoggedIn]);

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
            {isLoggedIn ? (
              <>
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
                <li className={styles.navItem}>
                  <Link
                    className={styles.navLink}
                    to="/typetest"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Type Test
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
