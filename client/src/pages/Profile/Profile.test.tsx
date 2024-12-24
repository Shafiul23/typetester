import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Profile from "./Profile";
import { useAuth } from "../../context/AuthContext";

jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Profile page tests", () => {
  it("should render user's profile and scores", async () => {
    const { useAuth } = require("../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ username: "user1" });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        personal: [
          {
            score_id: 1,
            user_id: 1,
            username: "user1",
            score: 80,
            created: "2024-12-01",
          },
          {
            score_id: 2,
            user_id: 1,
            username: "user1",
            score: 90,
            created: "2024-12-02",
          },
        ],
      }),
    });

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await screen.findByText(/Welcome, user1/i);
    expect(screen.getByText(/80/i)).toBeInTheDocument();
    expect(screen.getByText(/90/i)).toBeInTheDocument();
    expect(screen.getByText("12/1/2024, 12:00:00 AM")).toBeInTheDocument();
    expect(screen.getByText("12/2/2024, 12:00:00 AM")).toBeInTheDocument();
  });

  it("should display an error if personal scores fail to load", async () => {
    (useAuth as jest.Mock).mockReturnValue({ username: "user1" });
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to fetch scores")
    );

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    await screen.findByText(/failed to fetch scores/i);
    expect(screen.getByText(/failed to fetch scores/i)).toBeInTheDocument();
  });

  it("should update the order of scores when the sort button is clicked", async () => {
    (useAuth as jest.Mock).mockReturnValue({ username: "user1" });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        personal: [
          {
            score_id: 1,
            user_id: 1,
            username: "user1",
            score: 80,
            created: "2024-12-01",
          },
          {
            score_id: 2,
            user_id: 1,
            username: "user1",
            score: 90,
            created: "2024-12-02",
          },
        ],
      }),
    });

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    await screen.findByText(/80/i);
    expect(screen.getByText(/80/i)).toBeInTheDocument();
    expect(screen.getByText(/90/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Sort by Score/i));

    expect(screen.getByText(/90/i)).toBeInTheDocument();
    expect(screen.getByText(/80/i)).toBeInTheDocument();
  });
});
