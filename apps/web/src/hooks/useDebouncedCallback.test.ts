import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDebouncedCallback } from "./useDebouncedCallback.js";

describe("useDebouncedCallback", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("collapses a burst into one trailing call with the latest args", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 600));

    result.current.call("a");
    result.current.call("b");
    result.current.call("c");
    vi.advanceTimersByTime(599);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("c");
  });

  it("flushes pending work immediately and cancels the timer", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 600));

    result.current.call("a");
    result.current.flush();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("a");
    vi.advanceTimersByTime(10_000);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("drops pending work on cancel", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 600));

    result.current.call("a");
    result.current.cancel();
    result.current.flush();
    vi.advanceTimersByTime(10_000);
    expect(fn).not.toHaveBeenCalled();
  });
});
