import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WordCounter } from "../WordCounter";

describe("WordCounter", () => {
  it("renders word count with default target of 100", () => {
    render(<WordCounter count={42} />);
    expect(screen.getByText("42/100 words")).toBeInTheDocument();
  });

  it("uses accent color class when target is met", () => {
    const { container } = render(<WordCounter count={100} />);
    expect(container.firstChild).toHaveClass("text-accent");
  });

  it("uses muted color class when target is not met", () => {
    const { container } = render(<WordCounter count={50} />);
    expect(container.firstChild).not.toHaveClass("text-accent");
  });

  it("uses custom target prop", () => {
    render(<WordCounter count={50} target={50} />);
    expect(screen.getByText("50/50 words")).toBeInTheDocument();
  });

  it("shows as met when count exceeds target", () => {
    const { container } = render(<WordCounter count={200} target={100} />);
    expect(container.firstChild).toHaveClass("text-accent");
  });
});
