import { act, fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import TypeTest from "./TypeTest";

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ userId: null }),
}));

it("plays once per typing key, skips non-typing keys, and preserves scoring", () => {
  jest.useFakeTimers();
  const play = jest.fn().mockResolvedValue(undefined);
  const audio = { play, currentTime: 0, volume: 1 };
  const createAudio = jest.spyOn(window, "Audio").mockImplementation(() => audio as unknown as HTMLAudioElement);
  jest.spyOn(Math, "random").mockReturnValue(0.999);
  try {
    const { container } = render(<BrowserRouter><TypeTest /></BrowserRouter>);
    const input = screen.getByRole("textbox");
    expect(screen.queryByRole("button", { name: "Typing sounds" })).not.toBeInTheDocument();
    expect(createAudio).not.toHaveBeenCalled();

    for (const key of ["t", "Backspace", "Delete", " ", "Enter"]) {
      play.mockClear();
      fireEvent.keyDown(input, { key });
      expect(play).toHaveBeenCalledTimes(1);
    }
    play.mockClear();
    for (const key of ["ArrowRight", "Tab", "Shift", "Control", "Escape"]) {
      fireEvent.keyDown(input, { key });
    }
    fireEvent.keyDown(input, { key: "a", ctrlKey: true });
    fireEvent.keyDown(input, { key: "a", metaKey: true });
    fireEvent.keyDown(input, { key: "a", altKey: true });
    fireEvent.keyDown(input, { key: "a", isComposing: true });
    expect(play).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "the" } });
    fireEvent.keyDown(input, { key: " " });
    expect(play).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue("");
    expect(container.querySelector(".words > span")).toHaveClass("correctWord");

    play.mockClear();
    fireEvent.change(input, { target: { value: "incorrect" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(play).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue("");
    expect(container.querySelectorAll(".words > span")[1]).toHaveClass("wrongWord");
    expect(createAudio).toHaveBeenCalledTimes(1);
    act(() => { jest.advanceTimersByTime(30000); });
    expect(screen.getByText("Correct words: 1")).toBeInTheDocument();
    expect(screen.getByText("Wrong words: 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
    play.mockClear();
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "a" });
    expect(play).toHaveBeenCalledTimes(1);
  } finally {
    jest.useRealTimers();
    jest.restoreAllMocks();
  }
});
