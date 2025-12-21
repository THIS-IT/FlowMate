import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoadingOverlay } from "./LoadingOverlay";

describe("LoadingOverlay", () => {
  it("renders nothing when show is false", () => {
    const { container } = render(<LoadingOverlay show={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders overlay with default label when show is true", () => {
    render(<LoadingOverlay show />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders custom label when provided", () => {
    render(<LoadingOverlay show label="Processing request" />);
    expect(screen.getByText("Processing request")).toBeInTheDocument();
  });
});
