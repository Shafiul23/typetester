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
            duration_seconds: 30,
            created: "2024-12-01",
          },
          {
            score_id: 2,
            user_id: 2,
            username: "user2",
            score: 50,
            duration_seconds: 60,
            created: "2024-12-02",
          },
        ],
      }),
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ leaderboard: [
        { score_id: 3, username: "user3", score: 95, duration_seconds: 15, created: "2024-12-03" },
      ] }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ leaderboard: [] }),
    });

    render(
      <BrowserRouter>
        <Leaderboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await screen.findByText(/user1/i);
    expect(screen.getByText(/user1/i)).toBeInTheDocument();
    expect(screen.getByText(/80/i)).toBeInTheDocument();
    expect(screen.getByText("01/12/24")).toBeInTheDocument();
    expect(screen.getByText("30 s")).toBeInTheDocument();
    expect(screen.getByText("60 s")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Duration" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Test duration")).not.toBeInTheDocument();
    expect(screen.getAllByRole("table")).toHaveLength(1);
    expect(screen.getByText("15 s")).toBeInTheDocument();
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("user3");
    for (const duration of [15, 30, 60]) {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_API_URL}/auth/leaderboard?duration_seconds=${duration}`
      );
    }
  });

  it("should display an error if leaderboard data fails to load", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
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
