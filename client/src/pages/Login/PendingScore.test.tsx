import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "./Login";
import Register from "../Register/Register";
import { useAuth } from "../../context/AuthContext";

jest.mock("../../context/AuthContext", () => ({ useAuth: jest.fn() }));
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  jest.spyOn(window, "alert").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  (useAuth as jest.Mock).mockReturnValue({
    login: jest.fn().mockResolvedValue({success: true, token: "test-token"}),
    register: jest.fn().mockResolvedValue({success: true}),
  });
});
afterEach(() => jest.restoreAllMocks());

it.each(["login", "register"])("keeps duration through %s and retains failed submissions for retry", async (page) => {
  const pending = JSON.stringify({score: 85, duration_seconds: 60});
  localStorage.setItem("pendingScore", pending);
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ok: false, status: 500, json: async () => ({error: "Try again"})})
    .mockResolvedValueOnce({ok: true});
  render(<BrowserRouter>{page === "login" ? <Login /> : <Register />}</BrowserRouter>);
  fireEvent.change(screen.getByLabelText("Username"), {target: {value: "testuser"}});
  fireEvent.change(screen.getByLabelText("Password"), {target: {value: "Password123!"}});
  if (page === "register") {
    fireEvent.change(screen.getByLabelText("Confirm Password"), {target: {value: "Password123!"}});
  }
  const button = screen.getByRole("button", {name: page === "login" ? "Login" : "Register"});
  fireEvent.click(button);
  await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Try again"));
  await waitFor(() => expect(button).toBeEnabled());
  expect(localStorage.getItem("pendingScore")).toBe(pending);
  expect(mockNavigate).not.toHaveBeenCalled();
  fireEvent.click(button);
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/profile"));
  expect(localStorage.getItem("pendingScore")).toBeNull();
  expect(global.fetch).toHaveBeenLastCalledWith(
    `${process.env.REACT_APP_BACKEND_API_URL}/auth/scores`,
    expect.objectContaining({body: pending})
  );
});
