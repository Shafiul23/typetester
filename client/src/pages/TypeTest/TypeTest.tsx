import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import story from "../../dictionaries/story";
import styles from "./TypeTest.module.css";

const TypeTest: React.FC = () => {
  const words = useMemo(() => story.split(" "), []);
  const totalWords = words.length;

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [correctWordsCounter, setCorrectWordsCounter] = useState(0);
  const [wrongWordsCounter, setWrongWordsCounter] = useState(0);
  const [wordStatuses, setWordStatuses] = useState(
    Array(totalWords).fill(null)
  );
  const [timer, setTimer] = useState(60);
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const wordsBoxRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!hasStarted) {
        setHasStarted(true);
        setStartTime(Date.now());
      }
      setUserInput(e.target.value);
    },
    [hasStarted]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (isFinished || (e.key !== " " && e.key !== "Enter")) return;

      const currentWord = words[currentWordIndex];
      const isCorrect = userInput.trim() === currentWord;

      setWordStatuses((prev) => {
        const newStatuses = [...prev];
        newStatuses[currentWordIndex] = isCorrect;
        return newStatuses;
      });

      if (isCorrect) {
        setCorrectWordsCounter((prev) => prev + 1);
      } else {
        setWrongWordsCounter((prev) => prev + 1);
      }

      setUserInput("");
      setCurrentWordIndex((prev) => prev + 1);
    },
    [isFinished, userInput, words, currentWordIndex]
  );

  useEffect(() => {
    if (hasStarted && !isFinished) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current!);
  }, [hasStarted, isFinished]);

  useEffect(() => {
    if (currentWordIndex >= totalWords) {
      setIsFinished(true);
    }
  }, [currentWordIndex, totalWords]);

  useEffect(() => {
    if (!wordsBoxRef.current) return;

    const container = wordsBoxRef.current;
    const selectedWord = container.querySelectorAll("span")[currentWordIndex];

    selectedWord?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentWordIndex]);

  const elapsedTime = useMemo(
    () => (startTime ? (Date.now() - startTime) / 1000 : 0),
    [startTime, isFinished]
  );

  const wpm = useMemo(
    () =>
      elapsedTime > 0
        ? Math.round((correctWordsCounter / elapsedTime) * 60)
        : 0,
    [correctWordsCounter, elapsedTime]
  );

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Start typing to begin test!</h1>
      </div>

      <div className={styles.timer}>
        <p>Time remaining: {timer}s</p>
      </div>

      <div className={styles.textBox}>
        {isFinished ? (
          <div className={styles.reportCard}>
            <h2>Great job! You've completed the test!</h2>
            <h3 className={styles.wpmText}>Words per minute: {wpm}</h3>
            <p className={styles.correctWord}>
              Correct words: {correctWordsCounter}
            </p>
            <p className={styles.wrongWord}>Wrong words: {wrongWordsCounter}</p>
          </div>
        ) : (
          <>
            <div className={styles.wordsBox} ref={wordsBoxRef}>
              <div className={styles.words}>
                {words.map((word, index) => (
                  <span
                    key={index}
                    className={`${styles.word} 
                      ${index === currentWordIndex ? styles.selectedWord : ""} 
                      ${wordStatuses[index] === true ? styles.correctWord : ""} 
                      ${wordStatuses[index] === false ? styles.wrongWord : ""}`}
                  >
                    {word}
                  </span>
                ))}
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
