import React from "react";
import styles from "./Contact.module.css";

const Contact: React.FC = () => {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Contact Us</h1>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Developer</h2>
        <p>
          Created by Shafiul Mirza. Connect with me on{" "}
          <a
            href="https://www.linkedin.com/in/shafiul-mirza-32871b246"
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>{" "}
          or check out my other projects on{" "}
          <a
            href="https://github.com/shafiul23"
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </section>
    </main>
  );
};

export default Contact;
