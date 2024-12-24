import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Leaderboard from "./Leaderboard";

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Leaderboard page tests", () => {
  it("should render leaderboard data", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        leaderboard: [
          {
            score_id: 1,
            user_id: 1,
            username: "user1",
            score: 80,
            created: "2024-12-01",
          },
          {
            score_id: 2,
            user_id: 2,
            username: "user2",
            score: 50,
            created: "2024-12-02",
          },
        ],
      }),
    });

    render(
      <BrowserRouter>
        <Leaderboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading leaderboard/i)).toBeInTheDocument();
    await screen.findByText(/user1/i);
    expect(screen.getByText(/user1/i)).toBeInTheDocument();
    expect(screen.getByText(/80/i)).toBeInTheDocument();
    expect(screen.getByText("12/1/2024")).toBeInTheDocument();
  });

  it("should display an error if leaderboard data fails to load", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Server error")
    );

    render(
      <BrowserRouter>
        <Leaderboard />
      </BrowserRouter>
    );

    await screen.findByText(/server error/i);
    expect(screen.getByText(/server error/i)).toBeInTheDocument();
  });
});
