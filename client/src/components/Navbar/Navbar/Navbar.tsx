import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import classNames from "classnames";

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Check login status
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setIsMenuOpen(false);
  };

  // Toggle the menu
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* App title */}
        <Link to="/" className={styles.brand}>
          <span className={styles.brandPrimary}>Type</span>
          <span className={styles.brandSecondary}>Tester</span>
        </Link>

        {/* Hamburger menu button */}
        <button
          className={styles.hamburger}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>

        {/* Navigation links */}
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
