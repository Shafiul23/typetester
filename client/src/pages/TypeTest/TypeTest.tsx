// src/pages/TypeTest.tsx
import React, { useState } from "react";
import styles from "./TypeTest.module.css"; // Import the CSS module

const TypeTest: React.FC = () => {
  const story =
    "this is a simple story where you type one word at a time to test your typing speed and accuracy";

  // Split the story into an array of words
  const words = story.split(" ");

  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean>(true);
  const [correctWordsCounter, setCorrectWordsCounter] = useState<number>(0);
  const [wrongWordsCounter, setWrongWordsCounter] = useState<number>(0);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  // Handle space key press for word submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      // Check if the typed word is correct
      if (userInput.trim() === words[currentWordIndex]) {
        setIsCorrect(true);
        setCorrectWordsCounter(
          (correctWordsCounter) => correctWordsCounter + 1
        );
      } else {
        setIsCorrect(false);
        setWrongWordsCounter((wrongWordsCounter) => wrongWordsCounter + 1);
      }

      // Move to the next word
      setUserInput("");
      setCurrentWordIndex((prevIndex) => prevIndex + 1);
    }
  };

  // If all words are typed, display a message
  const isFinished = currentWordIndex >= words.length;

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Begin Type Test</h1>
      </div>

      <div className={styles.textBox}>
        {/* Display word array in a separate box */}
        <div className={styles.wordsBox}>
          {isFinished ? (
            <>
              <h2>Great job! You've completed the test!</h2>
              <p>Words per minute: </p>
              <p>Correct words: {correctWordsCounter}</p>
              <p>Wrong words: {wrongWordsCounter}</p>
            </>
          ) : (
            <div className={styles.words}>
              {words.map((word, index) => (
                <span
                  key={index}
                  className={`${styles.word} ${
                    index === currentWordIndex ? styles.highlight : ""
                  }`}
                >
                  {word}
                </span>
              ))}
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

        {/* Error message if word typed is wrong */}
        {!isCorrect && !isFinished && (
          <div className={styles.errorText}>Oops! Try again.</div>
        )}
      </div>
    </div>
  );
};

export default TypeTest;
