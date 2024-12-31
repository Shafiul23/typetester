import React from "react";
import styles from "./About.module.css";

const About: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>About TypeTester</h1>
      <p className={styles.description}>
        Typetester was an app initially created as a submission for a final
        project for CS50x - an introduction to computer science course by
        Harvard University. It was created using React for the front end,
        written in typescript and utilising css modules for styling and Jest for
        unit testing. The backend was written using Python with Flask and
        SQLAlchemy for the database. I then decided to host the website to make
        it accessible to the public. This was done using Render.
      </p>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Features</h2>
        <ul className={styles.list}>
          <li>Typing speed test with randomised words or short stories.</li>
          <li>Leaderboard showcasing top 20 scores.</li>
          <li>Personal profile page to view your saved scores.</li>
          <li>Simple and intuitive design for ease of use.</li>
          <li>
            Responsive design for seamless experience on any device, from
            smartphones to desktops.
          </li>
          <li>
            Secure authentication so your data is safe with stateless JWT-based
            user authentication.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Credits</h2>
        <p>
          Favicon by{" "}
          <a
            href="https://www.flaticon.com/free-icons/typewriter"
            title="typewriter icons"
            className={styles.link}
          >
            Umeicon - Flaticon
          </a>
          .
        </p>
      </section>
    </div>
  );
};

export default About;
