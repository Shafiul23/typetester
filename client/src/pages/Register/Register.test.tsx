import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "./Register";
import { BrowserRouter } from "react-router-dom";

jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Register page tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render register form", () => {
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({ register: jest.fn() });
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByText(/create an account/i)).toBeDefined();
    expect(screen.getByLabelText(/username/i)).toBeDefined();
    expect(screen.getByTestId("password")).toBeDefined();
    expect(screen.getByLabelText(/confirm password/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /register/i })).toBeDefined();
  });

  it("should show error if fields are empty", async () => {
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({ register: jest.fn() });
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText(/username and password cannot be empty/i)
    ).toBeDefined();
  });

  it("should show error if passwords do not match", async () => {
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({ register: jest.fn() });
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/passwords do not match!/i)).toBeDefined();
  });

  it("should successfully register and navigate", async () => {
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({
      register: jest.fn().mockResolvedValue({ success: true }),
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("should show error message on failed registration", async () => {
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({
      register: jest
        .fn()
        .mockResolvedValue({ success: false, message: "Registration failed" }),
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText("Registration failed")).toBeDefined();
    });
  });
});