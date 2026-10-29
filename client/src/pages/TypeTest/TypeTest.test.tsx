import { act, fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import TypeTest from "./TypeTest";
import commonWords from "../../dictionaries/commonWords";

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

      const selector = screen.getByRole("combobox", { name: "Test duration" });
      fireEvent.change(selector, { target: { value: String(duration) } });
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
        screen.getByText(`Words per minute: ${Math.round(60 / duration)}`),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
      expect(selector).toBeEnabled();
      expect(selector).toHaveValue(String(duration));
      expect(
        screen.getByText(`Time remaining: ${duration}s`),
      ).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toHaveValue("");
      fireEvent.change(selector, { target: { value: "30" } });
      expect(screen.getByText("Time remaining: 30s")).toBeInTheDocument();
    },
  );

  it("should render the initial state correctly", () => {
    const { useAuth } = require("../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ username: "user1", userId: 1 });
    render(
      <BrowserRouter>
        <TypeTest />
      </BrowserRouter>,
    );
    expect(screen.getByText("Start typing to begin test!")).toBeInTheDocument();
    expect(screen.getByText("Time remaining: 60s")).toBeInTheDocument();
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
