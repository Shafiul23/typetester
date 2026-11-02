import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await screen.findByText(/user1/i);
    expect(screen.getByText(/user1/i)).toBeInTheDocument();
    expect(screen.getByText(/80/i)).toBeInTheDocument();
    expect(screen.getByText("01/12/24")).toBeInTheDocument();
    expect(screen.getByText("30 s")).toBeInTheDocument();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({leaderboard: [{score_id: 3, username: "sixty", score: 70, duration_seconds: 60, created: "2024-12-01"}]}),
    });
    fireEvent.change(screen.getByLabelText("Test duration"), {target: {value: "60"}});
    expect(await screen.findByText("sixty")).toBeInTheDocument();
    expect(screen.getByText("60 s")).toBeInTheDocument();
    expect(screen.queryByText("user1")).not.toBeInTheDocument();
    await waitFor(() => expect(global.fetch).toHaveBeenLastCalledWith(
      `${process.env.REACT_APP_BACKEND_API_URL}/auth/leaderboard?duration_seconds=60`
    ));
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
