import { useCallback, useRef } from "react";

const useAudio = (audioSrc: string, volume: number = 1.0) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback(() => {
    if (!audioRef.current) audioRef.current = new Audio(audioSrc);
    const audio = audioRef.current;
    audio.volume = Math.min(Math.max(volume, 0), 1);
    audio.currentTime = 0;
    audio.play().catch((error) => console.error("Error playing audio:", error));
  }, [audioSrc, volume]);

  return { playAudio };
};

export default useAudio;
