// src/pages/TypeTest.tsx
import React, { useState, useEffect, useRef } from "react";
import story from "../../dictionaries/story";
import styles from "./TypeTest.module.css"; // Import the CSS module

const TypeTest: React.FC = () => {
  // Split the story into an array of words
  const words = story.split(" ");

  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>("");
  const [correctWordsCounter, setCorrectWordsCounter] = useState<number>(0);
  const [wrongWordsCounter, setWrongWordsCounter] = useState<number>(0);
  const [wordStatuses, setWordStatuses] = useState<(boolean | null)[]>(
    Array(words.length).fill(null)
  ); // Track correctness of each word
  const [timer, setTimer] = useState<number>(10); // Timer state (60 seconds)
  const [isFinished, setIsFinished] = useState<boolean>(false); // Is the test finished?
  const [hasStarted, setHasStarted] = useState<boolean>(false); // Whether typing has started
  const [startTime, setStartTime] = useState<number | null>(null); // Start time in milliseconds
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Elapsed time in seconds

  const wordsBoxRef = useRef<HTMLDivElement | null>(null);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    if (!hasStarted) {
      setHasStarted(true); // Mark typing as started
      setStartTime(Date.now()); // Start the timer when the user starts typing
    }
  };

  // Handle space key press for word submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (isFinished) return;
    if (e.key === " " || e.key === "Enter") {
      const currentWord = words[currentWordIndex];

      // Check if the word is correct or incorrect
      if (userInput.trim() === currentWord) {
        setWordStatuses((prevStatuses) =>
          prevStatuses.map((status, index) =>
            index === currentWordIndex ? true : status
          )
        );
        setCorrectWordsCounter((prev) => prev + 1);
      } else {
        setWordStatuses((prevStatuses) =>
          prevStatuses.map((status, index) =>
            index === currentWordIndex ? false : status
          )
        );
        setWrongWordsCounter((prev) => prev + 1);
      }

      // Move to the next word
      setUserInput("");
      setCurrentWordIndex((prevIndex) => prevIndex + 1);
    }
  };

  // Timer effect: Start and run the timer for 60 seconds
  useEffect(() => {
    if (!hasStarted || isFinished) return; // Don't start if not typing or already finished

    const timerInterval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          setElapsedTime((Date.now() - startTime!) / 1000);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup the interval when the timer reaches 0 or when the component unmounts
    return () => clearInterval(timerInterval);
  }, [hasStarted, isFinished, startTime]);

  // Stop the timer once the user finishes early (before timer runs out)
  useEffect(() => {
    if (currentWordIndex >= words.length) {
      clearInterval(timer); // Stop the timer if the user finishes all words
      setElapsedTime((Date.now() - startTime!) / 1000); // Record the elapsed time in seconds
      setIsFinished(true); // Mark as finished
    }
  }, [currentWordIndex, startTime, timer, words.length]);

  // Calculate Words Per Minute (WPM)
  const wpm = Math.round((correctWordsCounter / elapsedTime) * 60);

  useEffect(() => {
    const container = wordsBoxRef.current as HTMLElement;
    const selectedWordElement = container.childNodes[0].childNodes[
      currentWordIndex
    ] as HTMLElement;

    if (selectedWordElement) {
      selectedWordElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [currentWordIndex]);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Start typing to begin test!</h1>
      </div>

      <div className={styles.timer}>
        <p>Time remaining: {isFinished ? "0" : timer}s</p>
      </div>
      <div className={styles.textBox}>
        {/* Timer display */}

        {/* Display word array in a separate box */}

        {isFinished ? (
          <>
            <div className={styles.reportCard}>
              <h2>Great job! You've completed the test!</h2>
              <h3 className={styles.wpmText}>Words per minute: {wpm}</h3>{" "}
              <p className={styles.correctWord}>
                Correct words: {correctWordsCounter}
              </p>
              <p className={styles.wrongWord}>
                Wrong words: {wrongWordsCounter}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className={styles.wordsBox} ref={wordsBoxRef}>
              <div className={styles.words}>
                {words.map((word, index) => {
                  const currentWordStatus = wordStatuses[index];
                  return (
                    <span
                      key={index}
                      className={`${styles.word} 
                    ${index === currentWordIndex ? styles.selectedWord : ""} 
                    ${currentWordStatus === true ? styles.correctWord : ""} 
                    ${currentWordStatus === false ? styles.wrongWord : ""}`}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className={styles.inputBoxContainer}>
              <input
                type="text"
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                className={styles.inputBox}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                autoFocus
                disabled={isFinished}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TypeTest;
