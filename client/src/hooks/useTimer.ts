import React from "react";
import { useEffect, useRef } from "react";

const useTimer = (
  hasStarted: boolean,
  isFinished: boolean,
  dispatch: React.Dispatch<any>
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (hasStarted && !isFinished) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        dispatch({ type: "DECREMENT_TIMER" });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current!);
  }, [hasStarted, isFinished, dispatch]);

  return startTimeRef;
};

export default useTimer;
