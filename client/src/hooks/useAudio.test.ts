import { act, renderHook } from "@testing-library/react";
import useAudio from "./useAudio";

const originalContext = Object.getOwnPropertyDescriptor(window, "AudioContext");
const originalFetch = global.fetch;
let sources: any[];
let context: any;
let gain: any;
let construct: jest.Mock;

beforeEach(() => {
  sources = [];
  gain = { connect: jest.fn(), gain: { value: 1 } };
  context = {
    state: "running", destination: {},
    createGain: jest.fn(() => gain),
    decodeAudioData: jest.fn().mockResolvedValue({ decoded: true }),
    createBufferSource: jest.fn(() => {
      const source = { connect: jest.fn(), disconnect: jest.fn(), start: jest.fn(), buffer: null, onended: null };
      sources.push(source);
      return source;
    }),
    resume: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
  };
  construct = jest.fn(() => context);
  Object.defineProperty(window, "AudioContext", { configurable: true, value: construct });
  global.fetch = jest.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });
});

afterEach(() => {
  if (originalContext) Object.defineProperty(window, "AudioContext", originalContext);
  else delete (window as any).AudioContext;
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

it("preloads once, keeps playback stable, and starts each rapid key immediately from the same buffer", async () => {
  const legacyAudio = jest.spyOn(window, "Audio");
  const { result, rerender, unmount } = renderHook(() => useAudio("/click.mp3", 0.7));
  await act(async () => {});
  const callback = result.current.playAudio;
  rerender();
  expect(result.current.playAudio).toBe(callback);
  expect(construct).toHaveBeenCalledWith({ latencyHint: "interactive" });
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(context.decodeAudioData).toHaveBeenCalledTimes(1);
  result.current.playAudio();
  result.current.playAudio();
  result.current.playAudio();
  expect(sources).toHaveLength(3);
  for (const source of sources) {
    expect(source.buffer).toEqual({ decoded: true });
    expect(source.start).toHaveBeenCalledTimes(1);
    source.onended();
    expect(source.disconnect).toHaveBeenCalledTimes(1);
  }
  expect(gain.gain.value).toBe(0.7);
  expect(legacyAudio).not.toHaveBeenCalled();
  unmount();
  expect(context.close).toHaveBeenCalledTimes(1);
  expect((fetch as jest.Mock).mock.calls[0][1].signal.aborted).toBe(true);
});

it("resumes from a touch gesture without making a sound", async () => {
  context.state = "suspended";
  context.resume.mockImplementation(() => { context.state = "running"; return Promise.resolve(); });
  const { result } = renderHook(() => useAudio("/click.mp3"));
  await act(async () => {});
  result.current.prepareAudio();
  expect(context.resume).toHaveBeenCalledTimes(1);
  expect(sources).toHaveLength(0);
  result.current.playAudio();
  expect(sources[0].start).toHaveBeenCalledTimes(1);
});

it("does not replay clicks queued during loading or a slow context resume", async () => {
  let finishResume: () => void = () => {};
  context.state = "suspended";
  context.resume.mockImplementation(() => new Promise<void>((resolve) => { finishResume = resolve; }));
  const now = jest.spyOn(performance, "now").mockReturnValue(0);
  const { result } = renderHook(() => useAudio("/click.mp3"));
  result.current.playAudio();
  expect(context.resume).not.toHaveBeenCalled();
  await act(async () => {});
  result.current.playAudio();
  now.mockReturnValue(500);
  context.state = "running";
  await act(async () => { finishResume(); });
  expect(sources).toHaveLength(0);
  result.current.playAudio();
  expect(sources[0].start).toHaveBeenCalledTimes(1);
});

it("falls back to media playback if decoding fails", async () => {
  context.decodeAudioData.mockRejectedValue(new Error("unsupported audio"));
  const play = jest.fn().mockResolvedValue(undefined);
  jest.spyOn(window, "Audio").mockImplementation(() => ({ play, pause: jest.fn() }) as any);
  const { result } = renderHook(() => useAudio("/click.mp3"));
  await act(async () => {});
  result.current.playAudio();
  expect(play).toHaveBeenCalledTimes(1);
  expect(sources).toHaveLength(0);
});
