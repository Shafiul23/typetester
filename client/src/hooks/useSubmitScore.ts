import { useState, useCallback } from "react";

interface UseSubmitScoreReturn {
  submitScore: (score: number) => Promise<void>;
  scoreSaved: boolean;
  error: string | null;
}

const useSubmitScore = (): UseSubmitScoreReturn => {
  const [scoreSaved, setScoreSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitScore = useCallback(async (score: number) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/auth/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          score,
        }),
      });

      if (response.ok) {
        console.log("Score submitted successfully!");
        setScoreSaved(true);
        setError(null);
      } else {
        const errorData = await response.json();
        setScoreSaved(false);

        if (response.status === 429) {
          console.error("Rate limit error:", errorData.error);
          alert("You can only submit a score once every minute. Please wait.");
        } else {
          console.error("Failed to submit score:", errorData.error);
          alert(errorData.error || "Failed to submit score. Please try again.");
        }

        setError(errorData.error || "Failed to submit score.");
      }
    } catch (error) {
      console.error("Error submitting score:", error);
      alert("An unexpected error occurred. Please try again later.");
      setScoreSaved(false);
      setError("An unexpected error occurred.");
    }
  }, []);

  return { submitScore, scoreSaved, error };
};

export default useSubmitScore;
