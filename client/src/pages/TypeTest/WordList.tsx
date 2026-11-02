import React, { memo, useEffect, useRef } from "react";
import styles from "./TypeTest.module.css";

interface WordListProps {
  words: string[];
  currentWordIndex: number;
  wordStatuses: (boolean | null)[];
  wordsBoxRef: React.RefObject<HTMLDivElement | null>;
}

const WordList = memo(function WordList({
  words,
  currentWordIndex,
  wordStatuses,
  wordsBoxRef,
}: WordListProps) {
  const activeWordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = wordsBoxRef.current;
    const activeWord = activeWordRef.current;
    if (!container || !activeWord) return;

    const containerRect = container.getBoundingClientRect();
    const wordRect = activeWord.getBoundingClientRect();
    const paddingTop = parseFloat(getComputedStyle(container).paddingTop) || 0;
    const visibleTop = containerRect.top + container.clientTop + paddingTop;
    const lineOffset = wordRect.top - visibleTop;

    if (Math.abs(lineOffset) > 1) {
      container.scrollTop += lineOffset;
    }
  }, [currentWordIndex, words, wordsBoxRef]);

  return (
    <div className={styles.wordsBox} ref={wordsBoxRef}>
      <div className={styles.words}>
        {words.map((word, index) => (
          <span
            key={index}
            ref={index === currentWordIndex ? activeWordRef : null}
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
  );
});

export default WordList;
