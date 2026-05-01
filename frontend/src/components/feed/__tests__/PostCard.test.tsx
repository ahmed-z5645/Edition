import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostCard, type PostCardData } from "../PostCard";

vi.mock("next/link", () => ({
  default: ({ children, href, className, style }: { children: React.ReactNode; href: string; className?: string; style?: React.CSSProperties }) => (
    <a href={href} className={className} style={style}>{children}</a>
  ),
}));

const basePost: PostCardData = {
  id: "post-1",
  title: "My Great Week",
  cover_color: "#223843",
  is_late: false,
  word_count: 150,
  blocks: [],
  profiles: {
    username: "testuser",
    display_name: "Test User",
    avatar_url: null,
  },
};

describe("PostCard", () => {
  it("renders the post title", () => {
    render(<PostCard post={basePost} />);
    expect(screen.getByText("My Great Week")).toBeInTheDocument();
  });

  it("renders the author username", () => {
    render(<PostCard post={basePost} />);
    expect(screen.getByText("@testuser")).toBeInTheDocument();
  });

  it("links to /post/:id when not editable", () => {
    render(<PostCard post={basePost} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/post/post-1");
  });

  it("applies cover_color as background style", () => {
    render(<PostCard post={basePost} />);
    const link = screen.getByRole("link");
    expect(link).toHaveStyle({ backgroundColor: "#223843" });
  });

  it("renders title as input in editable mode", () => {
    render(<PostCard post={basePost} editable />);
    const input = screen.getByDisplayValue("My Great Week");
    expect(input.tagName).toBe("INPUT");
  });

  it("calls onTitleChange when editing", async () => {
    const user = userEvent.setup();
    const onTitleChange = vi.fn();
    render(<PostCard post={basePost} editable onTitleChange={onTitleChange} />);
    const input = screen.getByDisplayValue("My Great Week");
    await user.clear(input);
    await user.type(input, "New");
    expect(onTitleChange).toHaveBeenCalled();
  });

  it("shows LateBadge when is_late is true", () => {
    render(<PostCard post={{ ...basePost, is_late: true }} />);
    expect(screen.getByText("LATE")).toBeInTheDocument();
  });
});
