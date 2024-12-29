import { useRef } from "react";

const useAudio = (audioSrc: string, volume: number = 1.0) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!audioRef.current) {
    audioRef.current = new Audio(audioSrc);
    audioRef.current.volume = Math.min(Math.max(volume, 0), 1);
  }

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((error) => console.error("Error playing audio:", error));
    }
  };

  return { playAudio };
};

export default useAudio;
