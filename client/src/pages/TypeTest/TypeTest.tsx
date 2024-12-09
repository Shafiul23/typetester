import React, { useState } from "react";
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
  );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
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
