import { act, fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

function renderApp() {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, "", "/");
});

describe("task crud", () => {
  it("adds, edits, and deletes a task", async () => {
    renderApp();
    fireEvent.change(screen.getByLabelText(/new task/i), { target: { value: "Write design doc" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(screen.getByRole("button", { name: "Write design doc" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Edit task$/i }));
    const editInput = screen.getByRole("textbox", { name: /task name/i });
    fireEvent.change(editInput, { target: { value: "Write API design" } });
    fireEvent.keyDown(editInput, { key: "Enter" });
    expect(screen.getByRole("button", { name: "Write API design" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /delete task/i }));
    expect(screen.queryByRole("button", { name: "Write API design" })).not.toBeInTheDocument();
  });
});

describe("task completion", () => {
  it("marks a task complete via checkbox and disables title selection", () => {
    renderApp();
    fireEvent.change(screen.getByLabelText(/new task/i), { target: { value: "Ship feature" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    const rowCheckbox = screen.getByRole("checkbox", { name: /mark.*ship feature.*complete/i });
    fireEvent.click(rowCheckbox);
    expect(screen.getByRole("checkbox", { name: /mark.*ship feature.*not done/i })).toBeChecked();
    expect(screen.getByRole("button", { name: "Ship feature" })).toBeDisabled();
  });
});

describe("task persistence", () => {
  it("restores tasks from localStorage after remount", () => {
    vi.useFakeTimers();
    const { unmount } = renderApp();
    fireEvent.change(screen.getByLabelText(/new task/i), { target: { value: "Saved task" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    unmount();
    renderApp();
    expect(screen.getByRole("button", { name: "Saved task" })).toBeInTheDocument();
    vi.useRealTimers();
  });
});

describe("sprint fullscreen shortcut", () => {
  it("toggles fullscreen with f unless focus is in a text field", () => {
    renderApp();
    expect(screen.queryByRole("button", { name: /exit fullscreen/i })).not.toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: "f" });
    });
    expect(screen.getByRole("button", { name: /exit fullscreen/i })).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: "f" });
    });
    expect(screen.queryByRole("button", { name: /exit fullscreen/i })).not.toBeInTheDocument();

    const input = screen.getByLabelText(/new task/i);
    act(() => {
      input.focus();
      fireEvent.keyDown(input, { key: "f", bubbles: true });
    });
    expect(screen.queryByRole("button", { name: /exit fullscreen/i })).not.toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: "f" });
    });
    expect(screen.getByRole("button", { name: /exit fullscreen/i })).toBeInTheDocument();
  });
});

describe("sprint task selection lock", () => {
  it("blocks switching tasks after start (including after pause) until restart", () => {
    vi.useFakeTimers();
    renderApp();

    fireEvent.change(screen.getByLabelText(/new task/i), { target: { value: "Alpha" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    fireEvent.change(screen.getByLabelText(/new task/i), { target: { value: "Beta" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    fireEvent.click(screen.getByRole("button", { name: "Alpha" }));
    expect(screen.getByRole("button", { name: "Alpha" })).toHaveAttribute("aria-current", "true");

    fireEvent.click(screen.getByRole("button", { name: /^Start timer$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Pause timer$/i }));

    const betaTitle = screen.getByRole("button", { name: "Beta" });
    expect(betaTitle).toBeDisabled();
    fireEvent.click(betaTitle);
    expect(screen.getByRole("button", { name: "Alpha" })).toHaveAttribute("aria-current", "true");

    fireEvent.click(screen.getByRole("button", { name: /^Restart timer$/i }));
    expect(betaTitle).not.toBeDisabled();
    fireEvent.click(betaTitle);
    expect(screen.getByRole("button", { name: "Beta" })).toHaveAttribute("aria-current", "true");

    vi.useRealTimers();
  });

  it("allows switching tasks by title click before timer start", () => {
    renderApp();
    fireEvent.change(screen.getByLabelText(/new task/i), { target: { value: "Alpha" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    fireEvent.change(screen.getByLabelText(/new task/i), { target: { value: "Beta" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    fireEvent.click(screen.getByRole("button", { name: "Alpha" }));
    fireEvent.click(screen.getByRole("button", { name: "Beta" }));
    expect(screen.getByRole("button", { name: "Beta" })).toHaveAttribute("aria-current", "true");
  });
});

describe("analytics route shortcut", () => {
  it("toggles between tasks and analytics with a unless focus is in a text field", () => {
    renderApp();
    expect(screen.getByRole("heading", { name: /task board/i })).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: "a" });
    });
    expect(screen.getByRole("heading", { name: /daily goal/i })).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: "A" });
    });
    expect(screen.getByRole("heading", { name: /task board/i })).toBeInTheDocument();

    const input = screen.getByLabelText(/new task/i);
    act(() => {
      input.focus();
      fireEvent.keyDown(input, { key: "a", bubbles: true });
    });
    expect(screen.getByRole("heading", { name: /task board/i })).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: "a" });
    });
    expect(screen.getByRole("heading", { name: /daily goal/i })).toBeInTheDocument();
  });
});

describe("timer", () => {
  it("starts, pauses and restarts one-hour timer", () => {
    vi.useFakeTimers();
    renderApp();

    fireEvent.change(screen.getByLabelText(/new task/i), { target: { value: "Deep work" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    fireEvent.click(screen.getByRole("button", { name: "Deep work" }));

    fireEvent.click(screen.getByRole("button", { name: /^Start timer$/i }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText("00:59:57")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Pause timer$/i }));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText("00:59:57")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Restart timer$/i }));
    expect(screen.getByText("01:00:00")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("does not reset countdown when switching to analytics and back", () => {
    vi.useFakeTimers();
    renderApp();
    fireEvent.change(screen.getByLabelText(/new task/i), { target: { value: "Deep work" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    fireEvent.click(screen.getByRole("button", { name: "Deep work" }));
    fireEvent.click(screen.getByRole("button", { name: /^Start timer$/i }));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("00:59:55")).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: "a" });
    });
    expect(screen.getByRole("heading", { name: /daily goal/i })).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: "a" });
    });
    expect(screen.getByRole("heading", { name: /task board/i })).toBeInTheDocument();
    expect(screen.getByText("00:59:55")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
