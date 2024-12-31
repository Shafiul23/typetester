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

    expect(screen.getByText(/create account/i)).toBeDefined();
    expect(screen.getByLabelText(/username/i)).toBeDefined();
    expect(screen.getByTestId("password")).toBeDefined();
    expect(screen.getByLabelText(/confirm password/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /register/i })).toBeDefined();
  });

  it("should show error if username is too short", async () => {
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({ register: jest.fn() });
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "us" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText(/username must be at least 3 characters long/i)
    ).toBeDefined();
  });
  it("should show error if username is too long", async () => {
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({ register: jest.fn() });
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "usernameThatIsTooLong" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText(/username must not exceed 20 characters/i)
    ).toBeDefined();
  });

  it("should show error if username contains non-alphanumeric characters", async () => {
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({ register: jest.fn() });
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "user@name" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText(/username can only contain letters and numbers/i)
    ).toBeDefined();
  });

  it("should show error if password does not meet complexity requirements", async () => {
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({ register: jest.fn() });
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "short" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText(/password must be at least 6 characters long/i)
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
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password456!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(async () => {
      expect(await screen.findByText(/passwords do not match!/i)).toBeDefined();
    });
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
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password123!" },
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
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText("Registration failed")).toBeDefined();
    });
  });
});
