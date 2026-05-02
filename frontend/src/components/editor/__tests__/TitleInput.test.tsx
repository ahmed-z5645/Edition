import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TitleInput } from "../TitleInput";

describe("TitleInput", () => {
  it("renders with the provided value", () => {
    render(<TitleInput value="My Week" onChange={() => {}} />);
    expect(screen.getByDisplayValue("My Week")).toBeInTheDocument();
  });

  it("shows placeholder text", () => {
    render(<TitleInput value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText("Title your week...")).toBeInTheDocument();
  });

  it("calls onChange with new value on typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TitleInput value="" onChange={onChange} />);
    await user.type(screen.getByPlaceholderText("Title your week..."), "A");
    expect(onChange).toHaveBeenCalledWith("A");
  });

  it("renders an input element", () => {
    render(<TitleInput value="test" onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
