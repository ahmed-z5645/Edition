import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeedLockGate } from "../FeedLockGate";

// next/link renders as <a> in jsdom
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("FeedLockGate", () => {
  it("renders Feed is locked heading", () => {
    render(<FeedLockGate postCount={0} />);
    expect(screen.getByText("Feed is locked")).toBeInTheDocument();
  });

  it("shows post count when postCount > 0", () => {
    render(<FeedLockGate postCount={3} />);
    expect(screen.getByText(/3 people have already posted/i)).toBeInTheDocument();
  });

  it("shows singular person when postCount is 1", () => {
    render(<FeedLockGate postCount={1} />);
    expect(screen.getByText(/1 person has already posted/i)).toBeInTheDocument();
  });

  it("does not show post count message when postCount is 0", () => {
    render(<FeedLockGate postCount={0} />);
    expect(screen.queryByText(/posted this week/i)).not.toBeInTheDocument();
  });

  it("Write your post button links to /editor", () => {
    render(<FeedLockGate postCount={0} />);
    const link = screen.getByRole("link", { name: /write your post/i });
    expect(link).toHaveAttribute("href", "/editor");
  });
});
