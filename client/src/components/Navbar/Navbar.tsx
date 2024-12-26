import React, { useState } from "react";
import HamburgerMenu from "react-hamburger-menu";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar: React.FC = () => {
  const { userId, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

        <HamburgerMenu
          isOpen={isMenuOpen}
          menuClicked={() => setIsMenuOpen(!isMenuOpen)}
          width={30}
          height={25}
          strokeWidth={3}
          rotate={0}
          color="#fff"
          borderRadius={0}
          animationDuration={0.3}
          className={styles.hamburger}
          data-testid="toggle-menu"
        />

        <div className={`${styles.navLinks} ${isMenuOpen ? styles.open : ""}`}>
          <ul className={styles.navList}>
            {userId ? (
              <>
                <li
                  className={styles.navItem}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/leaderboard" className={styles.navLink}>
                    Leaderboard
                  </Link>
                </li>
                <li
                  className={styles.navItem}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/typetest" className={styles.navLink}>
                    Type Test
                  </Link>
                </li>
                <li
                  className={styles.navItem}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/profile" className={styles.navLink}>
                    Profile
                  </Link>
                </li>
                <li
                  className={styles.navItem}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li
                  className={styles.navItem}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/leaderboard" className={styles.navLink}>
                    Leaderboard
                  </Link>
                </li>
                <li
                  className={styles.navItem}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/register" className={styles.navLink}>
                    Register
                  </Link>
                </li>
                <li
                  className={styles.navItem}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/login" className={styles.navLink}>
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
