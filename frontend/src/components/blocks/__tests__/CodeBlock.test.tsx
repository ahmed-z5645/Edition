import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeBlock } from "../CodeBlock";
import type { CodeBlock as CodeBlockType } from "@/lib/types/blocks";

const baseBlock: CodeBlockType = {
  id: "block-2",
  post_id: "post-1",
  parent_block_id: null,
  type: "code",
  content: { code: "console.log('hello')", language: "javascript" },
  grid_layout_desktop: { colStart: 1, colSpan: 2, rowStart: 1, rowSpan: 4 },
  grid_layout_mobile: { colStart: 1, colSpan: 2, rowStart: 1, rowSpan: 4 },
  float_position: null,
  z_index: 0,
  sort_order: 0,
  created_at: "2025-01-01T00:00:00",
  updated_at: "2025-01-01T00:00:00",
};

describe("CodeBlock", () => {
  it("renders code content in view mode", () => {
    render(<CodeBlock block={baseBlock} />);
    expect(screen.getByText("console.log('hello')")).toBeInTheDocument();
  });

  it("renders language label in view mode", () => {
    render(<CodeBlock block={baseBlock} />);
    expect(screen.getByText("javascript")).toBeInTheDocument();
  });

  it("shows textarea with code in edit mode", () => {
    render(<CodeBlock block={baseBlock} isEditing />);
    expect(screen.getByDisplayValue("console.log('hello')")).toBeInTheDocument();
  });

  it("shows language select in edit mode", () => {
    render(<CodeBlock block={baseBlock} isEditing />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect((select as HTMLSelectElement).value).toBe("javascript");
  });

  it("calls onUpdate when code changes in edit mode", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(<CodeBlock block={baseBlock} isEditing onUpdate={onUpdate} />);
    const textarea = screen.getByDisplayValue("console.log('hello')");
    await user.type(textarea, ";");
    expect(onUpdate).toHaveBeenCalled();
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall.code).toContain("console.log('hello')");
  });

  it("calls onUpdate when language changes in edit mode", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(<CodeBlock block={baseBlock} isEditing onUpdate={onUpdate} />);
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "python");
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ language: "python" })
    );
  });
});
