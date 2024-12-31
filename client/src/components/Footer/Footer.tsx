import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.links}>
          <Link to="/about" className={styles.link}>
            About
          </Link>
          <Link to="/contact" className={styles.link}>
            Contact
          </Link>
        </div>
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} TypeTester. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
