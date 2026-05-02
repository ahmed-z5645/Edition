import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LateBadge } from "../LateBadge";

describe("LateBadge", () => {
  it("renders LATE text", () => {
    render(<LateBadge />);
    expect(screen.getByText("LATE")).toBeInTheDocument();
  });
});
