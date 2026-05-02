import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorToolbar } from "../EditorToolbar";

describe("EditorToolbar", () => {
  it("renders all five block type buttons", () => {
    render(<EditorToolbar onAddBlock={() => {}} />);
    expect(screen.getByRole("button", { name: /text/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /image/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /code/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /spotify/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /strava/i })).toBeInTheDocument();
  });

  it("calls onAddBlock with 'markdown' when Text is clicked", async () => {
    const user = userEvent.setup();
    const onAddBlock = vi.fn();
    render(<EditorToolbar onAddBlock={onAddBlock} />);
    await user.click(screen.getByRole("button", { name: /text/i }));
    expect(onAddBlock).toHaveBeenCalledWith("markdown");
  });

  it("calls onAddBlock with 'image' when Image is clicked", async () => {
    const user = userEvent.setup();
    const onAddBlock = vi.fn();
    render(<EditorToolbar onAddBlock={onAddBlock} />);
    await user.click(screen.getByRole("button", { name: /image/i }));
    expect(onAddBlock).toHaveBeenCalledWith("image");
  });

  it("calls onAddBlock with 'code' when Code is clicked", async () => {
    const user = userEvent.setup();
    const onAddBlock = vi.fn();
    render(<EditorToolbar onAddBlock={onAddBlock} />);
    await user.click(screen.getByRole("button", { name: /code/i }));
    expect(onAddBlock).toHaveBeenCalledWith("code");
  });
});
