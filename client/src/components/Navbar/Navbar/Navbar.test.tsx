import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import Navbar from "./Navbar";

jest.mock("../../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Navbar tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the title and navigation menu", async () => {
    const { useAuth } = require("../../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ userId: null });
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText(/Type/i)).toBeInTheDocument();
    expect(screen.getByText(/Tester/i)).toBeInTheDocument();
  });

  it("shows guest links when user is not logged in", () => {
    const { useAuth } = require("../../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ userId: null });
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  it("shows user links when user is logged in", () => {
    const { useAuth } = require("../../../context/AuthContext");
    (useAuth as jest.Mock).mockReturnValue({ userId: 1 });
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Type Test/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });
});
