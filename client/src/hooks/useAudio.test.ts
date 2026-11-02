import { renderHook } from "@testing-library/react";
import useAudio from "./useAudio";

it("keeps playback stable across rerenders and reuses a lazily created audio element", () => {
  const play = jest.fn().mockResolvedValue(undefined);
  const createAudio = jest.spyOn(window, "Audio").mockImplementation(() => ({
    play, currentTime: 0, volume: 1,
  }) as unknown as HTMLAudioElement);
  try {
    const { result, rerender } = renderHook(() => useAudio("/click.mp3", 0.7));
    const callback = result.current.playAudio;
    rerender();
    expect(result.current.playAudio).toBe(callback);
    expect(createAudio).not.toHaveBeenCalled();
    result.current.playAudio();
    result.current.playAudio();
    expect(createAudio).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledTimes(2);
  } finally {
    jest.restoreAllMocks();
  }
});
