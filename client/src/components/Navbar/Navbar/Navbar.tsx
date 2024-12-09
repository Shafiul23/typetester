import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css"; // Import the CSS module
import classNames from "classnames"; // Import classNames for dynamic class handling

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Simulating checking login status (replace with real authentication logic)
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
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Left Side: App Title */}
        <Link to="/" className={styles.brand}>
          <span className={styles.brandPrimary}>Type</span>
          <span className={styles.brandSecondary}>Tester</span>
        </Link>

        {/* Right Side: Conditional Links based on Login Status */}
        <div className={styles.navLinks}>
          <ul className={styles.navList}>
            {isLoggedIn ? (
              <>
                <li className={styles.navItem}>
                  <Link className={styles.navLink} to="/profile">
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
                  <Link className={styles.navLink} to="/register">
                    Register
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link className={styles.navLink} to="/login">
                    Login
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link className={styles.navLink} to="/typetest">
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
