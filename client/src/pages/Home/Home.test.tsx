import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "./Home";
import { BrowserRouter } from "react-router-dom";

jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("Home Component", () => {
  it("should render Register and Login buttons when user is not authenticated", () => {
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({ userId: null });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText(/Register/i)).toBeDefined();
    expect(screen.getByText(/Login/i)).toBeDefined();
  });

  it("should render Start Typing Test button when user is authenticated", () => {
    const { useAuth } = require("../../context/AuthContext");
    useAuth.mockReturnValue({ userId: "12345" });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText(/Start Typing Test/i)).toBeDefined();
  });
});
