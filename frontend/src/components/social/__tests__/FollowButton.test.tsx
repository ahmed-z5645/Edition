import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FollowButton } from "../FollowButton";

// Mock the API module
vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from "@/lib/api";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FollowButton", () => {
  it("shows Follow when not following", () => {
    render(<FollowButton userId="user-2" initialFollowing={false} />);
    expect(screen.getByRole("button", { name: "Follow" })).toBeInTheDocument();
  });

  it("shows Following when status is accepted", () => {
    render(
      <FollowButton userId="user-2" initialFollowing={true} initialStatus="accepted" />
    );
    expect(screen.getByRole("button", { name: "Following" })).toBeInTheDocument();
  });

  it("shows Requested when status is pending", () => {
    render(
      <FollowButton userId="user-2" initialFollowing={false} initialStatus="pending" />
    );
    expect(screen.getByRole("button", { name: "Requested" })).toBeInTheDocument();
  });

  it("shows Unfollow on hover when already following", async () => {
    const user = userEvent.setup();
    render(
      <FollowButton userId="user-2" initialFollowing={true} initialStatus="accepted" />
    );
    const button = screen.getByRole("button");
    await user.hover(button);
    expect(button).toHaveTextContent("Unfollow");
  });

  it("calls api.post on follow click and transitions to Following", async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockResolvedValue({ status: "followed" });
    render(<FollowButton userId="user-2" initialFollowing={false} />);
    const button = screen.getByRole("button", { name: "Follow" });
    await user.click(button);
    // click triggers mouseenter, so unhover to clear hover state before asserting "Following"
    await user.unhover(button);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Following" })).toBeInTheDocument();
    });
    expect(api.post).toHaveBeenCalledWith("/api/follows/user-2", {});
  });

  it("calls api.delete on unfollow and transitions to Follow", async () => {
    const user = userEvent.setup();
    vi.mocked(api.delete).mockResolvedValue({});
    render(
      <FollowButton userId="user-2" initialFollowing={true} initialStatus="accepted" />
    );
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Follow" })).toBeInTheDocument();
    });
    expect(api.delete).toHaveBeenCalledWith("/api/follows/user-2");
  });

  it("transitions to Requested when follow returns requested status", async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockResolvedValue({ status: "requested" });
    render(<FollowButton userId="user-2" initialFollowing={false} />);
    await user.click(screen.getByRole("button", { name: "Follow" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Requested" })).toBeInTheDocument();
    });
  });
});
