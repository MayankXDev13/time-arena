import { useCallback, useRef } from "react";

export function useDebouncedCallback<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number,
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const pending = useRef<{ timer: ReturnType<typeof setTimeout> | null; args: TArgs | null }>({
    timer: null,
    args: null,
  });

  const cancel = useCallback(() => {
    if (pending.current.timer !== null) {
      clearTimeout(pending.current.timer);
      pending.current.timer = null;
    }
    pending.current.args = null;
  }, []);

  const flush = useCallback(() => {
    const args = pending.current.args;
    cancel();
    if (args !== null) fnRef.current(...args);
  }, [cancel]);

  const call = useCallback(
    (...args: TArgs) => {
      cancel();
      pending.current.args = args;
      pending.current.timer = setTimeout(() => {
        pending.current.timer = null;
        pending.current.args = null;
        fnRef.current(...args);
      }, delay);
    },
    [cancel, delay],
  );

  return { call, flush, cancel };
}
