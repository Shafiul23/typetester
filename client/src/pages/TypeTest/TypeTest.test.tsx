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

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});
describe("TypeTest Component", () => {
  it("cancels an active test with Tab then Enter", () => {
      jest.useFakeTimers();
      const { useAuth } = require("../../context/AuthContext");
      (useAuth as jest.Mock).mockReturnValue({ userId: 1 });
      render(<BrowserRouter><TypeTest /></BrowserRouter>);
      fireEvent.click(screen.getByRole("combobox"));
      fireEvent.click(screen.getByRole("option", { name: "60 seconds" }));
      fireEvent.click(screen.getByRole("button", { name: "Use Short Story" }));
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "wrong" } });
      fireEvent.keyDown(input, { key: " " });
      act(() => { jest.advanceTimersByTime(5000); });
      expect(screen.getByText("Time remaining: 55s")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Cancel Test" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Restart Test" })).not.toBeInTheDocument();
      fireEvent.keyDown(input, { key: "Escape" });
      fireEvent.keyDown(input, { key: "r", altKey: true });
      expect(screen.getByText("Time remaining: 55s")).toBeInTheDocument();
      fireEvent.keyDown(input, { key: "Tab" });
      expect(screen.getByText("Time remaining: 55s")).toBeInTheDocument();
      fireEvent.keyDown(input, { key: "Enter" });
      expect(input).toHaveValue("");
      expect(input).toHaveFocus();
      expect(screen.getByRole("combobox")).toBeEnabled();
      expect(screen.getByRole("button", { name: "Use Most Common 300 Words" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
      act(() => { jest.advanceTimersByTime(65000); });
      expect(screen.getByText("Time remaining: 60s")).toBeInTheDocument();
      fireEvent.change(input, { target: { value: "next" } });
      act(() => { jest.advanceTimersByTime(60000); });
      expect(screen.getByText("Wrong words: 0")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
      expect(screen.getByRole("textbox")).toHaveFocus();
      expect(screen.getByText("Time remaining: 60s")).toBeInTheDocument();
    },
  );

  it.each([30, 60])(
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

      let selector = screen.getByRole("combobox", { name: "Test duration" });
      if (duration !== 30) {
        fireEvent.click(selector);
        fireEvent.click(screen.getByRole("option", { name: `${duration} seconds` }));
      }
      expect(selector).toHaveValue(String(duration));
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
      expect(selector).toBeDisabled();
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

      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
      expect(screen.queryByText(/Time remaining:/)).not.toBeInTheDocument();
      expect(screen.queryByText("Tab then Enter: cancel active test")).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
      selector = screen.getByRole("combobox", { name: "Test duration" });
      expect(selector).toBeEnabled();
      expect(selector).toHaveValue(String(duration));
      expect(
        screen.getByText(`Time remaining: ${duration}s`),
      ).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toHaveValue("");
      fireEvent.click(selector);
      fireEvent.click(screen.getByRole("option", { name: "30 seconds" }));
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

  it("should render the initial state correctly", () => {
    const { useAuth } = require("../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ username: "user1", userId: 1 });
    render(
      <BrowserRouter>
        <TypeTest />
      </BrowserRouter>,
    );
    expect(screen.getByText("Start typing to begin test!")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Test duration" })).toHaveValue("30");
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
    const button = screen.getByText("Use Short Story");
    fireEvent.click(button);
    expect(screen.getByText("Use Most Common 300 Words")).toBeInTheDocument();
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
