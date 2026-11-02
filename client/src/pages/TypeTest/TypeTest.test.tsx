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
  default: () => ({ playAudio: jest.fn(), prepareAudio: jest.fn() }),
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
  it.each([false, true])("keeps the active row at the top and resets (story: %s)", (useStory) => {
    const { useAuth } = require("../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ userId: null });
    let wordTop = 101;
    jest.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      const top = this.classList.contains("wordsBox") ? 100 : wordTop;
      return { top, bottom: top + 20 } as DOMRect;
    });
    const { container } = render(<BrowserRouter><TypeTest /></BrowserRouter>);
    const wordBox = container.querySelector(".wordsBox") as HTMLDivElement;
    Object.defineProperty(wordBox, "clientHeight", { configurable: true, value: 80 });
    Object.defineProperty(wordBox, "clientTop", { configurable: true, value: 1 });
    wordBox.scrollTop = 0;
    const scrollPage = jest.spyOn(window, "scrollTo");
    const focus = jest.spyOn(HTMLElement.prototype, "focus");
    if (useStory) fireEvent.click(screen.getByRole("button", { name: "Use short story" }));
    const input = screen.getByRole("textbox");
    const advance = () => {
      fireEvent.change(input, { target: { value: "word" } });
      fireEvent.keyDown(input, { key: " " });
    };
    advance();
    expect(wordBox.scrollTop).toBe(0);
    // The next row is already visible, but should move to the top.
    wordTop = 141;
    advance();
    expect(wordBox.scrollTop).toBe(40);
    wordTop = 101;
    advance();
    expect(wordBox.scrollTop).toBe(40);
    wordTop = 95;
    advance();
    expect(wordBox.scrollTop).toBe(34);
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    expect(scrollPage).not.toHaveBeenCalled();
    wordTop = 101;
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(wordBox.scrollTop).toBe(0);
    expect(input).toHaveValue("");
    expect(focus).toHaveBeenLastCalledWith({ preventScroll: true });
    expect(screen.getByRole("button", { name: useStory ? "Use common words" : "Use short story" })).toBeInTheDocument();
  });

  it("submits mobile input without Space keydown and scores words and the remaining prefix", () => {
    jest.useFakeTimers();
    const { useAuth } = require("../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ userId: null });
    const { container } = render(<BrowserRouter><TypeTest /></BrowserRouter>);
    const input = screen.getByRole("textbox");
    const words = () => container.querySelectorAll(".words > span");
    fireEvent.input(input, { target: { value: "a " }, inputType: "insertText" });
    expect(input).toHaveValue("");
    expect(words()[0]).toHaveClass("correctWord");
    expect(words()[1]).toHaveClass("selectedWord");
    fireEvent.input(input, { target: { value: "elephant  mistake ty" }, inputType: "insertText" });
    expect(input).toHaveValue("ty");
    expect(words()[1]).toHaveClass("correctWord");
    expect(words()[2]).toHaveClass("wrongWord");
    expect(words()[3]).toHaveClass("selectedWord");
    act(() => { jest.advanceTimersByTime(30000); });
    expect(screen.getByText("Correct words: 2")).toBeInTheDocument();
    expect(screen.getByText("Wrong words: 1")).toBeInTheDocument();
    // 'a ' (2) + 'elephant ' (9) = 11 characters in half a minute.
    expect(screen.getByText("Words per minute: 4")).toBeInTheDocument();
  });

  it("keeps desktop Space and Enter submission distinct and ignores empty separators", () => {
    jest.useFakeTimers();
    const { useAuth } = require("../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ userId: null });
    const { container } = render(<BrowserRouter><TypeTest /></BrowserRouter>);
    const input = screen.getByRole("textbox");
    fireEvent.input(input, { target: { value: "a" } });
    expect(fireEvent.keyDown(input, { key: " " })).toBe(false);
    fireEvent.input(input, { target: { value: " " } });
    fireEvent.input(input, { target: { value: "elephant" } });
    expect(fireEvent.keyDown(input, { key: "Enter" })).toBe(false);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input).toHaveValue("");
    expect(container.querySelectorAll(".words > span")[2]).toHaveClass("selectedWord");
    act(() => { jest.advanceTimersByTime(30000); });
    expect(screen.getByText("Correct words: 2")).toBeInTheDocument();
    expect(screen.getByText("Wrong words: 0")).toBeInTheDocument();
    // Enter contributes no space: 2 + 8 correct characters.
    expect(screen.getByText("Words per minute: 4")).toBeInTheDocument();
  });

  it.each([false, true])("waits for composition completion without duplicate submission (final input after end: %s)", (finalInputAfterEnd) => {
    jest.useFakeTimers();
    const { useAuth } = require("../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ userId: null });
    const { container } = render(<BrowserRouter><TypeTest /></BrowserRouter>);
    const input = screen.getByRole("textbox");
    fireEvent.compositionStart(input);
    fireEvent.input(input, { target: { value: "a " }, isComposing: true, inputType: "insertCompositionText" });
    // Also guard keyboards that omit isComposing on the confirmation key.
    fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
    fireEvent.keyDown(input, { key: " " });
    expect(input).toHaveValue("a ");
    expect(container.querySelectorAll(".words > span")[0]).toHaveClass("selectedWord");
    expect(container.querySelector(".correctWord")).toBeNull();
    fireEvent.compositionEnd(input, { data: "a " });
    expect(input).toHaveValue("");
    if (finalInputAfterEnd) {
      fireEvent.input(input, { target: { value: "a " }, inputType: "insertFromComposition" });
    }
    expect(input).toHaveValue("");
    expect(container.querySelectorAll(".words > span")[1]).toHaveClass("selectedWord");
    fireEvent.input(input, { target: { value: "elephant " }, inputType: "insertText" });
    expect(container.querySelectorAll(".words > span")[2]).toHaveClass("selectedWord");
    act(() => { jest.advanceTimersByTime(30000); });
    expect(screen.getByText("Correct words: 2")).toBeInTheDocument();
    expect(screen.getByText("Wrong words: 0")).toBeInTheDocument();
  });

  it("focuses a touched input without requesting page scrolling or mobile autofocus", () => {
    const { useAuth } = require("../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ userId: null });
    const descriptor = Object.getOwnPropertyDescriptor(window, "matchMedia");
    Object.defineProperty(window, "matchMedia", {
      configurable: true, value: jest.fn(() => ({ matches: true })),
    });
    try {
      render(<BrowserRouter><TypeTest /></BrowserRouter>);
      const input = screen.getByRole("textbox");
      expect(input).not.toHaveFocus();
      const focus = jest.spyOn(input, "focus");
      const touch = new Event("pointerdown", { bubbles: true, cancelable: true });
      Object.defineProperty(touch, "pointerType", { value: "touch" });
      fireEvent(input, touch);
      expect(touch.defaultPrevented).toBe(true);
      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
      expect(input).toHaveFocus();
      focus.mockClear();
      const secondTouch = new Event("pointerdown", { bubbles: true, cancelable: true });
      Object.defineProperty(secondTouch, "pointerType", { value: "touch" });
      fireEvent(input, secondTouch);
      expect(secondTouch.defaultPrevented).toBe(false);
      expect(focus).not.toHaveBeenCalled();
    } finally {
      if (descriptor) Object.defineProperty(window, "matchMedia", descriptor);
      else delete (window as any).matchMedia;
    }
  });

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
      screen.getByText("Start typing to begin test!"),
    ).toHaveAttribute("aria-hidden", "true");
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
