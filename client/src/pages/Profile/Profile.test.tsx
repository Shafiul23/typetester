import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Profile from "./Profile";

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
    await waitFor(() => {
      screen.getByText(/Welcome, user1/i);
    });
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/80/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("12/1/2024, 12:00:00 AM")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/90/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("12/2/2024, 12:00:00 AM")).toBeInTheDocument();
    });
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

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch scores/i)).toBeInTheDocument();
    });
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
    await waitFor(() => {
      expect(screen.getByText(/80/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/90/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Sort by Score/i));

    await waitFor(() => {
      expect(screen.getByText(/90/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/80/i)).toBeInTheDocument();
    });
  });

  it("should delete the profile and redirect to login", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);

    const mockLogout = jest.fn();
    const mockToken = "mocked-token";

    (useAuth as jest.Mock).mockReturnValue({
      userId: 1,
      username: "user1",
      logout: mockLogout,
    });

    global.localStorage.setItem("token", mockToken);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn(),
    });

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    const deleteButton = screen.getByTestId("delete-button");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith(
        "Are you sure you want to delete your profile? This action cannot be undone."
      );
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BACKEND_API_URL}/auth/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
    });
  });
});
