import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "./Login";

jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Login page tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render login form", () => {
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({ login: jest.fn() });
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /register here/i })
    ).toBeInTheDocument();
  });

  it("should display an error message when login fails", async () => {
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({
      login: jest
        .fn()
        .mockResolvedValue({ success: false, message: "invalid credentials" }),
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await screen.findByText(/invalid credentials/i);
  });

  it("should navigate to /typetest on successful login", async () => {
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({
      login: jest
        .fn()
        .mockResolvedValue({ success: true, message: "Login successful" }),
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/typetest"));
  });

  it("should clear the password field after a failed login attempt", async () => {
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({
      login: jest
        .fn()
        .mockResolvedValue({ success: false, message: "Invalid credentials" }),
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(passwordInput, {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await screen.findByText(/invalid credentials/i);

    expect(passwordInput).toHaveValue("");
  });
});
