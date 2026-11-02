import { act, fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import TypeTest from "./TypeTest";
import commonWords from "../../dictionaries/commonWords";

jest.mock("../../dictionaries/commonWords", () => ({
  __esModule: true,
  default: ["a", "elephant", "can't", "wrong", "typing"],
}));

jest.mock("../../hooks/useAudio", () => ({
  __esModule: true,
  default: () => ({ playAudio: jest.fn() }),
}));

jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  jest.spyOn(Math, "random").mockReturnValue(0.999);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});
describe("TypeTest Component", () => {
  it("restarts an active test with Escape even outside the typing field", () => {
      jest.useFakeTimers();
      const { useAuth } = require("../../context/AuthContext");
      (useAuth as jest.Mock).mockReturnValue({ userId: 1 });
      render(<BrowserRouter><TypeTest /></BrowserRouter>);
      fireEvent.click(screen.getByRole("button", { name: "60 seconds" }));
      fireEvent.click(screen.getByRole("button", { name: "Use short story" }));
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "wrong" } });
      fireEvent.keyDown(input, { key: " " });
      act(() => { jest.advanceTimersByTime(5000); });
      expect(screen.getByText("Time remaining: 55s")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Cancel Test" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Restart Test" })).not.toBeInTheDocument();
      fireEvent.keyDown(input, { key: "Escape", isComposing: true });
      fireEvent.keyDown(input, { key: "Escape", repeat: true });
      fireEvent.keyDown(input, { key: "Escape", ctrlKey: true });
      fireEvent.keyDown(input, { key: "r", altKey: true });
      expect(screen.getByText("Time remaining: 55s")).toBeInTheDocument();
      fireEvent.keyDown(input, { key: "Tab" });
      expect(screen.getByText("Time remaining: 55s")).toBeInTheDocument();
      input.blur();
      fireEvent.keyDown(document.body, { key: "Escape" });
      expect(input).toHaveValue("");
      expect(input).toHaveFocus();
      expect(screen.getByRole("group", { name: "Duration" })).toBeEnabled();
      expect(screen.getByRole("button", { name: "Use common words" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
      act(() => { jest.advanceTimersByTime(65000); });
      expect(screen.getByText("Time remaining: 60s")).toBeInTheDocument();
      fireEvent.change(input, { target: { value: "next" } });
      act(() => { jest.advanceTimersByTime(60000); });
      expect(screen.getByText("Wrong words: 0")).toBeInTheDocument();
      fireEvent.keyDown(document.body, { key: "Escape" });
      expect(screen.getByText("Great job! You've completed the test!")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
      expect(screen.getByRole("textbox")).toHaveFocus();
      expect(screen.getByText("Time remaining: 60s")).toBeInTheDocument();
    },
  );

  it.each([15, 30, 60])(
    "runs a %i-second test and keeps the duration on retry",
    (duration) => {
      jest.useFakeTimers();
      const { useAuth } = require("../../context/AuthContext");
      (useAuth as jest.Mock).mockReturnValue({ username: "user1", userId: 1 });
      render(
        <BrowserRouter>
          <TypeTest />
        </BrowserRouter>,
      );

      let selector = screen.getByRole("button", { name: `${duration} seconds` });
      if (duration !== 30) {
        fireEvent.click(selector);
      }
      expect(selector).toHaveAttribute("aria-pressed", "true");
      expect(
        screen.getByText(`Time remaining: ${duration}s`),
      ).toBeInTheDocument();
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(
        screen.getByText(`Time remaining: ${duration}s`),
      ).toBeInTheDocument();

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: commonWords[0] } });
      fireEvent.keyDown(input, { key: " " });
      expect(screen.queryByRole("group", { name: "Duration" })).not.toBeInTheDocument();
      act(() => {
        jest.advanceTimersByTime((duration - 1) * 1000);
      });
      expect(screen.getByText("Time remaining: 1s")).toBeInTheDocument();
      expect(
        screen.queryByText("Great job! You've completed the test!"),
      ).not.toBeInTheDocument();
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(
        screen.getByText("Great job! You've completed the test!"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(`Words per minute: ${Math.round(((commonWords[0].length + 1) / 5) * 60 / duration)}`),
      ).toBeInTheDocument();

      expect(screen.queryByRole("group", { name: "Duration" })).not.toBeInTheDocument();
      expect(screen.queryByText(/Time remaining:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/restart test/)).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
      selector = screen.getByRole("button", { name: `${duration} seconds` });
      expect(selector).toBeEnabled();
      expect(selector).toHaveAttribute("aria-pressed", "true");
      expect(
        screen.getByText(`Time remaining: ${duration}s`),
      ).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toHaveValue("");
      fireEvent.click(screen.getByRole("button", { name: "30 seconds" }));
      expect(screen.getByText("Time remaining: 30s")).toBeInTheDocument();
    },
  );

  it("scores five-character words, spaces, punctuation and the final correct prefix", () => {
    jest.useFakeTimers();
    const { useAuth } = require("../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ userId: null });
    render(<BrowserRouter><TypeTest /></BrowserRouter>);
    const input = screen.getByRole("textbox");
    for (const [value, key] of [["a", " "], ["elephant", "Enter"], ["can't", " "], ["mistake", " "]]) {
      fireEvent.change(input, { target: { value } });
      fireEvent.keyDown(input, { key });
    }
    fireEvent.change(input, { target: { value: "tyX" } });
    act(() => { jest.advanceTimersByTime(30000); });
    // 2 + 8 + 6 + 0 + 2 correct characters in half a minute = 7.2 WPM.
    expect(screen.getByText("Words per minute: 7")).toBeInTheDocument();
    expect(screen.getByText("Correct words: 3")).toBeInTheDocument();
    expect(screen.getByText("Wrong words: 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "X" } });
    act(() => { jest.advanceTimersByTime(30000); });
    expect(screen.getByText("Words per minute: 0")).toBeInTheDocument();
  });

  it("reshuffles common words on retry and cancellation without changing the dictionary", () => {
    jest.useFakeTimers();
    const { useAuth } = require("../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ userId: null });
    const { container } = render(<BrowserRouter><TypeTest /></BrowserRouter>);
    const displayedWords = () => Array.from(container.querySelectorAll(".words > span"), (word) => word.textContent);
    expect(displayedWords()).toEqual(commonWords);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "a" } });
    act(() => { jest.advanceTimersByTime(30000); });
    (Math.random as jest.Mock).mockReturnValue(0);
    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
    expect(displayedWords()).not.toEqual(commonWords);
    expect(displayedWords().sort()).toEqual([...commonWords].sort());
    expect(commonWords).toEqual(["a", "elephant", "can't", "wrong", "typing"]);
    (Math.random as jest.Mock).mockReturnValue(0.999);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "elephant" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(displayedWords()).toEqual(commonWords);
  });

  it("cancels with the mobile button and reshuffles for the next test", () => {
    jest.useFakeTimers();
    const { useAuth } = require("../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ userId: null });
    const { container } = render(<BrowserRouter><TypeTest /></BrowserRouter>);
    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.keyDown(input, { key: " " });
    act(() => { jest.advanceTimersByTime(5000); });
    (Math.random as jest.Mock).mockReturnValue(0);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    const words = Array.from(container.querySelectorAll(".words > span"), (word) => word.textContent);
    expect(words).not.toEqual(commonWords);
    expect(words.sort()).toEqual([...commonWords].sort());
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(screen.getByText("Time remaining: 30s")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Duration" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(30000); });
    expect(screen.getByText("Time remaining: 30s")).toBeInTheDocument();
  });

  it("should render the initial state correctly", () => {
    const { useAuth } = require("../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ username: "user1", userId: 1 });
    render(
      <BrowserRouter>
        <TypeTest />
      </BrowserRouter>,
    );
    expect(screen.getByText("Start typing to begin test!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30 seconds" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Time remaining: 30s")).toBeInTheDocument();
  });

  it("should start the test on input change", () => {
    const { useAuth } = require("../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ username: "user1", userId: 1 });
    render(
      <BrowserRouter>
        <TypeTest />
      </BrowserRouter>,
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test" } });
    expect(
      screen.queryByText("Start typing to begin test!"),
    ).not.toBeInTheDocument();
  });

  it("should toggle dictionary on button click", () => {
    const { useAuth } = require("../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ username: "user1", userId: 1 });
    render(
      <BrowserRouter>
        <TypeTest />
      </BrowserRouter>,
    );
    const button = screen.getByText("Use short story");
    fireEvent.click(button);
    expect(screen.getByText("Use common words")).toBeInTheDocument();
  });

  it("should update input value on change", () => {
    const { useAuth } = require("../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ username: "user1", userId: 1 });
    render(
      <BrowserRouter>
        <TypeTest />
      </BrowserRouter>,
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "hello" } });
    expect(input).toHaveValue("hello");
  });
});
