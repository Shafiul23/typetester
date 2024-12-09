import React, { useState, useEffect } from "react";
import styles from "./TypeTest.module.css"; // Import the CSS module

const TypeTest: React.FC = () => {
  const story =
    "this is a simple story where you type one word at a time to test your typing speed and accuracy";

  // Split the story into an array of words
  const words = story.split(" ");

  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>("");
  const [correctWordsCounter, setCorrectWordsCounter] = useState<number>(0);
  const [wrongWordsCounter, setWrongWordsCounter] = useState<number>(0);
  const [wordStatuses, setWordStatuses] = useState<(boolean | null)[]>(
    Array(words.length).fill(null)
  ); // Track correctness of each word
  const [timer, setTimer] = useState<number>(60); // Timer state (60 seconds)
  const [isFinished, setIsFinished] = useState<boolean>(false); // Is the test finished?
  const [hasStarted, setHasStarted] = useState<boolean>(false); // Whether typing has started
  const [startTime, setStartTime] = useState<number | null>(null); // Start time in milliseconds
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Elapsed time in seconds

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
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup the interval when the timer reaches 0 or when the component unmounts
    return () => clearInterval(timerInterval);
  }, [hasStarted, isFinished]);

  // Stop the timer once the user finishes early (before timer runs out)
  useEffect(() => {
    if (currentWordIndex >= words.length) {
      clearInterval(timer); // Stop the timer if the user finishes all words
      setElapsedTime((Date.now() - startTime!) / 1000); // Record the elapsed time in seconds
      setIsFinished(true); // Mark as finished
    }
  }, [currentWordIndex, words.length, startTime, timer]);

  // Calculate Words Per Minute (WPM)
  const wpm =
    elapsedTime > 0 ? Math.round((correctWordsCounter / elapsedTime) * 60) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Begin Type Test</h1>
      </div>

      <div className={styles.textBox}>
        {/* Timer display */}
        <div className={styles.timer}>
          <p>Time remaining: {isFinished ? "0" : timer}s</p>
        </div>

        {/* Display word array in a separate box */}
        <div className={styles.wordsBox}>
          {isFinished ? (
            <>
              <h2>Great job! You've completed the test!</h2>
              <p>Words per minute: {wpm}</p> {/* Display words per minute */}
              <p>Correct words: {correctWordsCounter}</p>
              <p>Wrong words: {wrongWordsCounter}</p>
            </>
          ) : (
            <div className={styles.words}>
              {words.map((word, index) => {
                const currentWordStatus = wordStatuses[index];

                return (
                  <span
                    key={index}
                    className={`${styles.word} 
                    ${index === currentWordIndex ? styles.selectedWord : ""} 
                    ${currentWordStatus === true ? styles.correctWord : ""} 
                    ${currentWordStatus === false ? styles.incorrectWord : ""}`}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Input field for typing */}
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
            disabled={isFinished}
          />
        </div>
      </div>
    </div>
  );
};

export default TypeTest;
