import React, {
  useReducer,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import story from "../../dictionaries/story";
import styles from "./TypeTest.module.css";
import useSubmitScore from "../../hooks/useSubmitScore";
import useAudio from "../../hooks/useAudio";
import useTimer from "../../hooks/useTimer";

const initialState = {
  currentWordIndex: 0,
  userInput: "",
  correctWordsCounter: 0,
  wrongWordsCounter: 0,
  wordStatuses: [] as (boolean | null)[],
  timer: 10,
  isFinished: false,
  hasStarted: false,
  elapsedTime: 0,
};

type State = typeof initialState;

type Action =
  | { type: "START_TEST" }
  | { type: "UPDATE_INPUT"; payload: string }
  | { type: "CHECK_WORD"; payload: boolean }
  | { type: "INCREMENT_INDEX" }
  | { type: "UPDATE_STATUSES"; payload: (boolean | null)[] }
  | { type: "SET_FINISHED" }
  | { type: "DECREMENT_TIMER" }
  | { type: "RESET_TEST"; payload: number }
  | { type: "SET_ELAPSED_TIME"; payload: number };

const typeTestReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "START_TEST":
      return { ...state, hasStarted: true };
    case "UPDATE_INPUT":
      return { ...state, userInput: action.payload };
    case "CHECK_WORD":
      return action.payload
        ? { ...state, correctWordsCounter: state.correctWordsCounter + 1 }
        : { ...state, wrongWordsCounter: state.wrongWordsCounter + 1 };
    case "INCREMENT_INDEX":
      return { ...state, currentWordIndex: state.currentWordIndex + 1 };
    case "UPDATE_STATUSES":
      return { ...state, wordStatuses: action.payload };
    case "SET_FINISHED":
      return { ...state, isFinished: true };
    case "DECREMENT_TIMER":
      return { ...state, timer: state.timer - 1 };
    case "RESET_TEST":
      return {
        ...initialState,
        wordStatuses: Array(action.payload).fill(null),
      };
    case "SET_ELAPSED_TIME":
      return { ...state, elapsedTime: action.payload };
    default:
      return state;
  }
};

const TypeTest: React.FC = () => {
  const words = useMemo(() => story.split(" "), []);
  const totalWords = words.length;

  const [state, dispatch] = useReducer(typeTestReducer, {
    ...initialState,
    wordStatuses: Array(totalWords).fill(null),
  });

  const { submitScore, scoreSaved } = useSubmitScore();
  const { playAudio } = useAudio("/typewriter-click.mp3");
  const { timer, hasStarted, isFinished } = state;

  const startTimeRef = useTimer(hasStarted, isFinished, dispatch);
  const wordsBoxRef = useRef<HTMLDivElement>(null);

  const {
    currentWordIndex,
    userInput,
    correctWordsCounter,
    wrongWordsCounter,
    wordStatuses,
    elapsedTime,
  } = state;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!hasStarted) {
        dispatch({ type: "START_TEST" });
      }
      dispatch({ type: "UPDATE_INPUT", payload: e.target.value });
    },
    [hasStarted]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (isFinished || (e.key !== " " && e.key !== "Enter")) return;

      playAudio();

      const currentWord = words[currentWordIndex];
      const isCorrect = userInput.trim() === currentWord;

      const updatedStatuses = [...wordStatuses];
      updatedStatuses[currentWordIndex] = isCorrect;

      dispatch({ type: "UPDATE_STATUSES", payload: updatedStatuses });
      dispatch({ type: "CHECK_WORD", payload: isCorrect });
      dispatch({ type: "INCREMENT_INDEX" });
      dispatch({ type: "UPDATE_INPUT", payload: "" });
    },
    [isFinished, playAudio, words, currentWordIndex, userInput, wordStatuses]
  );

  useEffect(() => {
    if (timer <= 0) {
      dispatch({
        type: "SET_ELAPSED_TIME",
        payload: (Date.now() - startTimeRef.current!) / 1000,
      });
      dispatch({ type: "SET_FINISHED" });
    }
  }, [timer, dispatch, startTimeRef]);

  useEffect(() => {
    if (!wordsBoxRef.current) return;

    const container = wordsBoxRef.current;
    const selectedWord = container.querySelectorAll("span")[currentWordIndex];

    selectedWord?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentWordIndex]);

  const safeElapsedTime = Math.max(elapsedTime, 1);
  const wpm = Math.round((correctWordsCounter / safeElapsedTime) * 60);

  const resetTest = () => {
    dispatch({ type: "RESET_TEST", payload: totalWords });
    startTimeRef.current = null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        {!hasStarted && (
          <h1 className={styles.title}>Start typing to begin test!</h1>
        )}
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
            {scoreSaved && <p>Score saved!</p>}
            <div className={styles.buttonContainer}>
              <button
                onClick={() => submitScore(wpm)}
                disabled={scoreSaved || !wpm}
              >
                Save
              </button>
              <button onClick={resetTest}>Try Again</button>
            </div>
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
                onKeyDown={(e) => {
                  playAudio();
                  handleKeyPress(e);
                }}
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
