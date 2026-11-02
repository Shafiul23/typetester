import { readPendingScore } from "./pendingScore";

beforeEach(() => localStorage.clear());

it.each([15, 30, 60])("preserves a pending %i-second result", (duration) => {
  const result = { score: 85, duration_seconds: duration };
  localStorage.setItem("pendingScore", JSON.stringify(result));
  expect(readPendingScore()).toEqual(result);
  expect(localStorage.getItem("pendingScore")).not.toBeNull();
});

it.each(['85', '{bad', '{"score":85}', '{"score":85,"duration_seconds":45}'])(
  "discards pending data without a known duration: %s", (stored) => {
    localStorage.setItem("pendingScore", stored);
    expect(readPendingScore()).toBeNull();
    expect(localStorage.getItem("pendingScore")).toBeNull();
  }
);
