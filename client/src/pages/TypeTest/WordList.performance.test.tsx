import { act, fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import TypeTest from "./TypeTest";

// Profile inside the real memo boundary so parent commits are not counted.
jest.mock("react", () => {
  const React = jest.requireActual("react");
  const profileWordList = jest.fn();
  return {
    ...React,
    profileWordList,
    memo: (Component: any, compare: any) => React.memo(
      function ProfiledWordList(props: any) {
        return React.createElement(
          React.Profiler,
          { id: "WordList", onRender: profileWordList },
          React.createElement(Component, props),
        );
      },
      compare,
    ),
  };
});

jest.mock("../../hooks/useAudio", () => ({
  __esModule: true,
  default: () => ({ playAudio: jest.fn() }),
}));
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ userId: null }),
}));

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it.each([false, true])("skips word-list renders for typing and timer ticks (story: %s)", (useStory) => {
  jest.useFakeTimers();
  jest.spyOn(Math, "random").mockReturnValue(0.999);
  const { profileWordList } = require("react");
  const { container } = render(<BrowserRouter><TypeTest /></BrowserRouter>);
  if (useStory) fireEvent.click(screen.getByRole("button", { name: "Use short story" }));
  const input = screen.getByRole("textbox");
  const words = () => Array.from(container.querySelectorAll(".words > span"));
  const firstWord = words()[0].textContent!;
  profileWordList.mockClear();

  for (let length = 1; length <= firstWord.length; length++) {
    fireEvent.change(input, { target: { value: firstWord.slice(0, length) } });
  }
  act(() => { jest.advanceTimersByTime(2000); });
  expect(input).toHaveValue(firstWord);
  expect(screen.getByText("Time remaining: 28s")).toBeInTheDocument();
  expect(profileWordList).not.toHaveBeenCalled();

  fireEvent.keyDown(input, { key: " " });
  expect(profileWordList).toHaveBeenCalledTimes(1);
  expect(words()[0]).toHaveClass("correctWord");
  expect(words()[1]).toHaveClass("selectedWord");
  expect(words()[0]).not.toHaveClass("selectedWord");

  fireEvent.change(input, { target: { value: "definitely-incorrect" } });
  expect(profileWordList).toHaveBeenCalledTimes(1);
  fireEvent.keyDown(input, { key: "Enter" });
  expect(profileWordList).toHaveBeenCalledTimes(2);
  expect(words()[1]).toHaveClass("wrongWord");
  expect(words()[2]).toHaveClass("selectedWord");

  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(words()[0]).toHaveClass("selectedWord");
  expect(container.querySelector(".correctWord, .wrongWord")).toBeNull();
  expect(screen.getByRole("button", { name: useStory ? "Use common words" : "Use short story" })).toBeInTheDocument();
});
