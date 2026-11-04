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
import WordList from "./WordList";

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
  | {
      type: "PROCESS_INPUT";
      payload: { value: string; words: string[]; submitLast?: boolean };
    }
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
    case "PROCESS_INPUT": {
      if (state.isFinished) return state;
      const { value, words, submitLast = false } = action.payload;
      const parts = value.split(/[ \u00a0]+/);
      const remainingInput = submitLast ? "" : parts.pop()!;
      let index = state.currentWordIndex;
      let correctWords = state.correctWordsCounter;
      let wrongWords = state.wrongWordsCounter;
      let characters = state.correctCharacters;
      let statuses = state.wordStatuses;
      parts.forEach((word, partIndex) => {
        if (!word || index >= words.length) return;
        const correct = word === words[index];
        if (statuses === state.wordStatuses) statuses = [...statuses];
        statuses[index] = correct;
        if (correct) {
          correctWords += 1;
          const hasSpace = !submitLast || partIndex < parts.length - 1;
          characters += word.length + (hasSpace ? 1 : 0);
        } else {
          wrongWords += 1;
        }
        index += 1;
      });
      return {
        ...state,
        hasStarted: state.hasStarted || value.length > 0,
        userInput: remainingInput,
        currentWordIndex: index,
        correctWordsCounter: correctWords,
        wrongWordsCounter: wrongWords,
        correctCharacters: characters,
        wordStatuses: statuses,
      };
    }
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const backendApiUrl = process.env.REACT_APP_BACKEND_API_URL;

  const [shuffledWords, setShuffledWords] = useState(() =>
    shuffleWords(commonWords),
  );
  const words = state.useStory ? storyWords : shuffledWords;

  const totalWords = words.length;

  useEffect(() => {
    dispatch({
      type: "UPDATE_STATUSES",
      payload: Array(totalWords).fill(null),
    });
  }, [totalWords]);

  const { submitScore } = useSubmitScore();
  const { playAudio, prepareAudio } = useAudio("/typewriter-click.mp3", 0.7);
  const { timer, hasStarted, isFinished } = state;
  const { userId } = useAuth();

  const startTimeRef = useTimer(hasStarted, isFinished, dispatch);
  const wordsBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const composingRef = useRef(false);
  const compositionCommitRef = useRef<string | null>(null);

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
      if (isFinished) return;
      const value = e.currentTarget.value;
      if (composingRef.current || (e.nativeEvent as InputEvent).isComposing) {
        if (!hasStarted) dispatch({ type: "START_TEST" });
        dispatch({ type: "UPDATE_INPUT", payload: value });
        return;
      }
      const committedValue = compositionCommitRef.current;
      compositionCommitRef.current = null;
      if (committedValue === value) return;
      dispatch({ type: "PROCESS_INPUT", payload: { value, words } });
    },
    [hasStarted, isFinished, words],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isFinished || (e.key !== " " && e.key !== "Enter")) return;
      e.preventDefault();
      dispatch({
        type: "PROCESS_INPUT",
        payload: {
          value: e.currentTarget.value + (e.key === " " ? " " : ""),
          words,
          submitLast: e.key === "Enter",
        },
      });
    },
    [isFinished, words],
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
    const success = await submitScore(score, state.duration);
    if (success) {
      dispatch({ type: "SET_SCORE_SAVED", payload: true });
    }
  };

  const resetTest = useCallback(() => {
    if (!state.useStory) setShuffledWords(shuffleWords(commonWords));
    dispatch({ type: "RESET_TEST", payload: totalWords });
    startTimeRef.current = null;
    composingRef.current = false;
    compositionCommitRef.current = null;
    inputRef.current?.focus({ preventScroll: true });
    if (wordsBoxRef.current) wordsBoxRef.current.scrollTop = 0;
  }, [totalWords, startTimeRef, state.useStory]);

  useEffect(() => {
    if (!hasStarted || isFinished) return;

    const handleRestart = (event: KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        event.repeat ||
        event.isComposing ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      event.preventDefault();
      resetTest();
    };

    document.addEventListener("keydown", handleRestart);
    return () => document.removeEventListener("keydown", handleRestart);
  }, [hasStarted, isFinished, resetTest]);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={`${styles.title} ${hasStarted ? styles.reservedHidden : ""}`} aria-hidden={hasStarted}>
          Start typing to begin test!
        </h1>
      </div>

      <div
        className={`${styles.textBox} ${isFinished ? styles.resultsPanel : ""}`}
      >
        {!isFinished && (
          <div className={styles.timerContainer}>
            <div className={styles.timer}>
              <p>Time remaining: {timer}s</p>
              <button
                type="button"
                className={`${styles.cancelButton} ${!hasStarted ? styles.reservedHidden : ""}`}
                aria-hidden={!hasStarted}
                disabled={!hasStarted}
                onClick={resetTest}
              >
                Cancel
              </button>
            </div>
            <div className={`${styles.testControls} ${hasStarted ? styles.reservedHidden : ""}`} aria-hidden={hasStarted} inert={hasStarted}>
              <div className={styles.durationControl}>
                <span id="duration-label">Duration</span>
                <div
                  className={styles.durationSegments}
                  role="group"
                  aria-labelledby="duration-label"
                >
                  {testDurations.map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      className={styles.durationSegment}
                      aria-label={`${duration} seconds`}
                      aria-pressed={state.duration === duration}
                      onClick={() =>
                        dispatch({ type: "SET_DURATION", payload: duration })
                      }
                    >
                      {duration}s
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.storyControls}>
                <button
                  onClick={toggleDictionary}
                  className={styles.toggleButton}
                >
                  {state.useStory ? "Use common words" : "Use short story"}
                </button>
                <button
                  type="button"
                  className={`${styles.toggleButton} ${styles.soundButton}`}
                  aria-label="Typing sounds"
                  aria-pressed={soundEnabled}
                  title={soundEnabled ? "Mute typing sounds" : "Enable typing sounds"}
                  onClick={() => setSoundEnabled((enabled) => !enabled)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {soundEnabled ? (
                      <>
                        <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" fill="currentColor" />
                        <path d="M16 9a5 5 0 0 1 0 6" />
                        <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
                      </>
                    ) : (
                      <>
                        <path d="M16 9a5 5 0 0 1 .95 2.293" />
                        <path d="M19.364 5.636a9 9 0 0 1 1.889 9.96" />
                        <path d="m2 2 20 20" />
                        <path d="m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11" fill="currentColor" />
                        <path d="M9.828 4.172A.686.686 0 0 1 11 4.657v.686" fill="currentColor" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {isFinished ? (
          <div className={styles.reportCard}>
            <h2>Great job! You've completed the test!</h2>
            <p>Test duration: {state.duration} s</p>
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

                  <button className={styles.reportButton} onClick={resetTest}>
                    Try Again
                  </button>
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
                      localStorage.setItem(
                        "pendingScore",
                        JSON.stringify({
                          score: wpm,
                          duration_seconds: state.duration,
                        }),
                      )
                    }
                    className={styles.reportButton}
                  >
                    Log in
                  </Link>{" "}
                  <Link
                    to="/register"
                    onClick={() =>
                      localStorage.setItem(
                        "pendingScore",
                        JSON.stringify({
                          score: wpm,
                          duration_seconds: state.duration,
                        }),
                      )
                    }
                    className={styles.reportButton}
                  >
                    Create an account
                  </Link>
                </p>
                <div className={styles.buttonContainer}>
                  <button className={styles.reportButton} onClick={resetTest}>
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <WordList
              words={words}
              currentWordIndex={currentWordIndex}
              wordStatuses={wordStatuses}
              wordsBoxRef={wordsBoxRef}
            />

            <div className={styles.inputBoxContainer}>
              <input
                ref={inputRef}
                type="text"
                aria-label="Typing input"
                aria-describedby="test-shortcuts"
                value={userInput}
                onPointerDown={(e) => {
                  prepareAudio();
                  if (e.pointerType === "touch" && document.activeElement !== e.currentTarget) {
                    e.preventDefault();
                    e.currentTarget.focus({ preventScroll: true });
                  }
                }}
                onFocus={prepareAudio}
                onChange={handleInputChange}
                onCompositionStart={() => {
                  composingRef.current = true;
                  compositionCommitRef.current = null;
                }}
                onCompositionEnd={(e) => {
                  composingRef.current = false;
                  if (isFinished) return;
                  const value = e.currentTarget.value;
                  compositionCommitRef.current = value;
                  dispatch({
                    type: "PROCESS_INPUT",
                    payload: { value, words },
                  });
                }}
                onKeyDown={(e) => {
                  if (
                    composingRef.current ||
                    e.nativeEvent.isComposing ||
                    e.keyCode === 229
                  )
                    return;
                  compositionCommitRef.current = null;
                  if (
                    soundEnabled &&
                    !e.ctrlKey &&
                    !e.metaKey &&
                    !e.altKey &&
                    (e.key.length === 1 ||
                      e.key === "Enter" ||
                      e.key === "Backspace" ||
                      e.key === "Delete")
                  ) {
                    playAudio();
                  }
                  handleKeyPress(e);
                }}
                className={styles.inputBox}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck="false"
                autoFocus={!window.matchMedia?.("(max-width: 767px)").matches}
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
