import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import commonWords from "../../dictionaries/commonWords";
import storyWords from "../../dictionaries/story";
import useAudio from "../../hooks/useAudio";
import useSubmitScore from "../../hooks/useSubmitScore";
import useTimer from "../../hooks/useTimer";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import styles from "./TypeTest.module.css";

function shuffleWords(words: string[]) {
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const testDurations = [15, 30, 60];
const defaultDuration = 30;

const initialState = {
  useStory: false,
  currentWordIndex: 0,
  userInput: "",
  correctWordsCounter: 0,
  correctCharacters: 0,
  wrongWordsCounter: 0,
  wordStatuses: [] as (boolean | null)[],
  timer: defaultDuration,
  duration: defaultDuration,
  isFinished: false,
  hasStarted: false,
  elapsedTime: 0,
  scoreSaved: false,
};

type State = typeof initialState;

type Action =
  | { type: "SET_DURATION"; payload: number }
  | { type: "TOGGLE_DICTIONARY" }
  | { type: "START_TEST" }
  | { type: "UPDATE_INPUT"; payload: string }
  | { type: "CHECK_WORD"; payload: { isCorrect: boolean; characters: number } }
  | { type: "INCREMENT_INDEX" }
  | { type: "UPDATE_STATUSES"; payload: (boolean | null)[] }
  | { type: "SET_FINISHED" }
  | { type: "DECREMENT_TIMER" }
  | { type: "SET_SCORE_SAVED"; payload: boolean }
  | { type: "RESET_TEST"; payload: number }
  | { type: "SET_ELAPSED_TIME"; payload: number };

const typeTestReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_DURATION":
      if (state.hasStarted || !testDurations.includes(action.payload))
        return state;
      return { ...state, duration: action.payload, timer: action.payload };
    case "TOGGLE_DICTIONARY":
      return { ...state, useStory: !state.useStory };
    case "START_TEST":
      return { ...state, hasStarted: true };
    case "UPDATE_INPUT":
      return { ...state, userInput: action.payload };
    case "CHECK_WORD":
      return action.payload.isCorrect
        ? {
            ...state,
            correctWordsCounter: state.correctWordsCounter + 1,
            correctCharacters:
              state.correctCharacters + action.payload.characters,
          }
        : { ...state, wrongWordsCounter: state.wrongWordsCounter + 1 };
    case "INCREMENT_INDEX":
      return { ...state, currentWordIndex: state.currentWordIndex + 1 };
    case "UPDATE_STATUSES":
      return { ...state, wordStatuses: action.payload };
    case "SET_FINISHED":
      return { ...state, isFinished: true };
    case "DECREMENT_TIMER":
      return { ...state, timer: state.timer - 1 };
    case "SET_SCORE_SAVED":
      return { ...state, scoreSaved: action.payload };
    case "RESET_TEST":
      return {
        ...initialState,
        duration: state.duration,
        useStory: state.useStory,
        timer: state.duration,
        wordStatuses: Array(action.payload).fill(null),
      };
    case "SET_ELAPSED_TIME":
      return { ...state, elapsedTime: action.payload };
    default:
      return state;
  }
};

const TypeTest: React.FC = () => {
  const [state, dispatch] = useReducer(typeTestReducer, { ...initialState });
  const backendApiUrl = process.env.REACT_APP_BACKEND_API_URL;

  const [shuffledWords, setShuffledWords] = useState(() => shuffleWords(commonWords));
  const words = state.useStory ? storyWords : shuffledWords;

  const totalWords = words.length;

  useEffect(() => {
    dispatch({
      type: "UPDATE_STATUSES",
      payload: Array(totalWords).fill(null),
    });
  }, [totalWords]);

  const { submitScore } = useSubmitScore();
  const { playAudio } = useAudio("/typewriter-click.mp3", 0.7);
  const { timer, hasStarted, isFinished } = state;
  const { userId } = useAuth();

  const startTimeRef = useTimer(hasStarted, isFinished, dispatch);
  const wordsBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    [hasStarted],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (isFinished || (e.key !== " " && e.key !== "Enter")) return;

      e.preventDefault();
      playAudio();

      const currentWord = words[currentWordIndex];
      if (!currentWord || !userInput) return;
      const isCorrect = userInput === currentWord;

      const updatedStatuses = [...wordStatuses];
      updatedStatuses[currentWordIndex] = isCorrect;

      dispatch({ type: "UPDATE_STATUSES", payload: updatedStatuses });
      dispatch({
        type: "CHECK_WORD",
        payload: {
          isCorrect,
          characters: currentWord.length + (e.key === " " ? 1 : 0),
        },
      });
      dispatch({ type: "INCREMENT_INDEX" });
      dispatch({ type: "UPDATE_INPUT", payload: "" });
    },
    [isFinished, playAudio, words, currentWordIndex, userInput, wordStatuses],
  );

  const toggleDictionary = () => {
    dispatch({ type: "TOGGLE_DICTIONARY" });
  };

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

  useEffect(() => {
    if (!hasStarted || !backendApiUrl) return;

    const controller = new AbortController();
    const apiUrl = backendApiUrl;

    const warmupRequest = async () => {
      try {
        await fetch(`${apiUrl}/auth/leaderboard`, {
          method: "GET",
          signal: controller.signal,
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.warn("Warmup request failed:", error);
      }
    };

    warmupRequest();

    return () => {
      controller.abort();
    };
  }, [hasStarted, backendApiUrl]);

  const safeElapsedTime = Math.max(elapsedTime, 1);
  const currentWord = words[currentWordIndex] ?? "";
  let partialCorrectCharacters = 0;
  while (
    partialCorrectCharacters < userInput.length &&
    userInput[partialCorrectCharacters] ===
      currentWord[partialCorrectCharacters]
  ) {
    partialCorrectCharacters += 1;
  }
  const wpm = Math.round(
    ((state.correctCharacters + partialCorrectCharacters) /
      5 /
      safeElapsedTime) *
      60,
  );

  const handleScoreSubmission = async (score: number) => {
    const success = await submitScore(score);
    if (success) {
      dispatch({ type: "SET_SCORE_SAVED", payload: true });
    }
  };

  const resetTest = useCallback(() => {
    if (!state.useStory) setShuffledWords(shuffleWords(commonWords));
    dispatch({ type: "RESET_TEST", payload: totalWords });
    startTimeRef.current = null;
    inputRef.current?.focus();
    if (wordsBoxRef.current) wordsBoxRef.current.scrollTop = 0;
  }, [totalWords, startTimeRef, state.useStory]);

  useEffect(() => {
    if (!hasStarted || isFinished) return;

    const handleRestart = (event: KeyboardEvent) => {
      if (
        event.key !== "Escape" || event.repeat || event.isComposing ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
      ) return;
      event.preventDefault();
      resetTest();
    };

    document.addEventListener("keydown", handleRestart);
    return () => document.removeEventListener("keydown", handleRestart);
  }, [hasStarted, isFinished, resetTest]);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        {!hasStarted && (
          <h1 className={styles.title}>Start typing to begin test!</h1>
        )}
      </div>

      <div className={`${styles.textBox} ${isFinished ? styles.resultsPanel : ""}`}>
        {!isFinished && (
          <div className={styles.timerContainer}>
            <div className={styles.timer}>
              <p>Time remaining: {timer}s</p>
              {hasStarted && (
                <button type="button" className={styles.cancelButton} onClick={resetTest}>
                  Cancel
                </button>
              )}
            </div>
            {!hasStarted && (
              <div className={styles.testControls}>
                <div className={styles.durationControl}>
                  <span id="duration-label">Duration</span>
                  <div className={styles.durationSegments} role="group" aria-labelledby="duration-label">
                    {testDurations.map((duration) => (
                      <button
                        key={duration}
                        type="button"
                        className={styles.durationSegment}
                        aria-label={`${duration} seconds`}
                        aria-pressed={state.duration === duration}
                        onClick={() => dispatch({ type: "SET_DURATION", payload: duration })}
                      >
                        {duration}s
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={toggleDictionary} className={styles.toggleButton}>
                  {state.useStory ? "Use common words" : "Use short story"}
                </button>
              </div>
            )}
          </div>
        )}

        {isFinished ? (
          <div className={styles.reportCard}>
            <h2>Great job! You've completed the test!</h2>
            <h3 className={styles.wpmText}>Words per minute: {wpm}</h3>
            <p>
              WPM counts five correct characters as one word, including spaces
              and punctuation.
            </p>
            <p className={styles.correctWord}>
              Correct words: {correctWordsCounter}
            </p>
            <p className={styles.wrongWord}>Wrong words: {wrongWordsCounter}</p>
            {userId ? (
              <>
                <p>
                  Hit the save button below to save your score to your profile
                </p>
                {state.scoreSaved && <p>Score saved!</p>}
                <div className={styles.buttonContainer}>
                  <button
                    className={styles.reportButton}
                    onClick={() => handleScoreSubmission(wpm)}
                    disabled={state.scoreSaved || !wpm}
                  >
                    Save
                  </button>

                  <button className={styles.reportButton} onClick={resetTest}>Try Again</button>
                </div>
              </>
            ) : (
              <>
                <p>
                  Want to save your score? <br />
                  <br />
                  <Link
                    to="/login"
                    onClick={() =>
                      localStorage.setItem("pendingScore", wpm.toString())
                    }
                    className={styles.reportButton}
                  >
                    Log in
                  </Link>{" "}
                  <Link
                    to="/register"
                    onClick={() =>
                      localStorage.setItem("pendingScore", wpm.toString())
                    }
                    className={styles.reportButton}
                  >
                    Create an account
                  </Link>
                </p>
                <div className={styles.buttonContainer}>
                  <button className={styles.reportButton} onClick={resetTest}>Try Again</button>
                </div>
              </>
            )}
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
                ref={inputRef}
                type="text"
                aria-label="Typing input"
                aria-describedby="test-shortcuts"
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing) return;
                  playAudio();
                  handleKeyPress(e);
                }}
                className={styles.inputBox}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck="false"
                autoFocus
                disabled={isFinished}
              />
              <p id="test-shortcuts" className={styles.shortcutHint}>
                <kbd>Esc</kbd> restart test
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TypeTest;
