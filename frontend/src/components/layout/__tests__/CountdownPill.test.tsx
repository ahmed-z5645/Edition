import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CountdownPill } from "../CountdownPill";

describe("CountdownPill", () => {
  it("renders countdown text mentioning a new week", () => {
    render(<CountdownPill />);
    expect(
      screen.getByText(/until a new week is revealed/i)
    ).toBeInTheDocument();
  });

  it("has hidden class on mobile (md:block pattern)", () => {
    render(<CountdownPill />);
    const pill = screen.getByText(/until a new week is revealed/i).closest("div");
    expect(pill).toHaveClass("hidden");
    expect(pill).toHaveClass("md:block");
  });
});
