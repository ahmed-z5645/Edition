import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PublishButton } from "../PublishButton";

describe("PublishButton", () => {
  it("renders Publish text when idle", () => {
    render(<PublishButton canPublish onPublish={() => {}} isPublishing={false} />);
    expect(screen.getByRole("button", { name: "Publish" })).toBeInTheDocument();
  });

  it("renders Publishing... when isPublishing is true", () => {
    render(<PublishButton canPublish onPublish={() => {}} isPublishing />);
    expect(screen.getByRole("button", { name: "Publishing..." })).toBeInTheDocument();
  });

  it("is disabled when canPublish is false", () => {
    render(<PublishButton canPublish={false} onPublish={() => {}} isPublishing={false} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when isPublishing is true", () => {
    render(<PublishButton canPublish onPublish={() => {}} isPublishing />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls onPublish when clicked and enabled", async () => {
    const user = userEvent.setup();
    const onPublish = vi.fn();
    render(<PublishButton canPublish onPublish={onPublish} isPublishing={false} />);
    await user.click(screen.getByRole("button"));
    expect(onPublish).toHaveBeenCalledOnce();
  });

  it("does not call onPublish when disabled", async () => {
    const user = userEvent.setup();
    const onPublish = vi.fn();
    render(<PublishButton canPublish={false} onPublish={onPublish} isPublishing={false} />);
    await user.click(screen.getByRole("button"));
    expect(onPublish).not.toHaveBeenCalled();
  });
});
