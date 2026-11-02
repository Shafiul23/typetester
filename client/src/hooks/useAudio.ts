import { useCallback, useEffect, useRef } from "react";

interface AudioEngine {
  context: AudioContext;
  gain: GainNode;
  buffer: AudioBuffer | null;
}

const useAudio = (audioSrc: string, volume: number = 1.0) => {
  const engineRef = useRef<AudioEngine | null>(null);
  const fallbackRef = useRef<HTMLAudioElement | null>(null);
  const failedRef = useRef(false);

  useEffect(() => {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    failedRef.current = false;
    if (!AudioContextClass) {
      failedRef.current = true;
      return;
    }
    const controller = new AbortController();
    let engine: AudioEngine;
    try {
      const context = new AudioContextClass({ latencyHint: "interactive" });
      const gain = context.createGain();
      gain.connect(context.destination);
      engine = { context, gain, buffer: null };
      engineRef.current = engine;
    } catch {
      failedRef.current = true;
      return;
    }

    void (async () => {
      try {
        const response = await fetch(audioSrc, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load typing sound");
        const buffer = await engine.context.decodeAudioData(
          await response.arrayBuffer(),
        );
        if (!controller.signal.aborted) engine.buffer = buffer;
      } catch {
        if (!controller.signal.aborted) failedRef.current = true;
      }
    })();

    return () => {
      controller.abort();
      engineRef.current = null;
      void engine.context.close().catch(() => {});
      fallbackRef.current?.pause();
      fallbackRef.current = null;
    };
  }, [audioSrc]);

  const prepareAudio = useCallback(() => {
    const context = engineRef.current?.context;
    if (context && context.state !== "running" && context.state !== "closed") {
      void context.resume().catch(() => {});
    }
  }, []);

  const playAudio = useCallback(() => {
    if (failedRef.current) {
      if (!fallbackRef.current) fallbackRef.current = new Audio(audioSrc);
      const audio = fallbackRef.current;
      audio.volume = Math.min(Math.max(volume, 0), 1);
      audio.currentTime = 0;
      void audio.play().catch(() => {});
      return;
    }
    const engine = engineRef.current;
    if (!engine?.buffer) return;
    const start = () => {
      if (engineRef.current !== engine || engine.context.state !== "running")
        return;
      const source = engine.context.createBufferSource();
      source.buffer = engine.buffer;
      engine.gain.gain.value = Math.min(Math.max(volume, 0), 1);
      source.connect(engine.gain);
      source.onended = () => source.disconnect();
      source.start();
    };
    if (engine.context.state === "running") {
      start();
    } else if (engine.context.state !== "closed") {
      const pressedAt = performance.now();
      void engine.context
        .resume()
        .then(() => {
          if (performance.now() - pressedAt < 100) start();
        })
        .catch(() => {});
    }
  }, [audioSrc, volume]);

  return { playAudio, prepareAudio };
};

export default useAudio;
