import { useState, useCallback } from "react";

interface UseSubmitScoreReturn {
  submitScore: (score: number) => Promise<boolean>;
  error: string | null;
}

const useSubmitScore = (): UseSubmitScoreReturn => {
  const [error, setError] = useState<string | null>(null);

  const submitScore = useCallback(async (score: number): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API_URL}/auth/scores`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ score }),
        }
      );

      if (response.ok) {
        console.log("Score submitted successfully!");
        setError(null);
        return true;
      } else {
        const errorData = await response.json();

        if (response.status === 429) {
          console.error("Rate limit error:", errorData.error);
          alert("You can only submit a score once every minute. Please wait.");
        } else {
          console.error("Failed to submit score:", errorData.error);
          alert(errorData.error || "Failed to submit score. Please try again.");
        }

        setError(errorData.error || "Failed to submit score.");
        return false;
      }
    } catch (error) {
      console.error("Error submitting score:", error);
      alert("An unexpected error occurred. Please try again later.");
      setError("An unexpected error occurred.");
      return false;
    }
  }, []);

  return { submitScore, error };
};

export default useSubmitScore;
