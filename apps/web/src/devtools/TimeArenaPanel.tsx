import { useQueryClient } from "@tanstack/react-query";
import { useTimerStore } from "@/stores/useTimerStore";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "4px 12px",
        fontSize: 12,
      }}
    >
      <span style={{ opacity: 0.6 }}>{label}</span>
      <span style={{ fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}

/**
 * Product panel for the Time Arena domain: live timer snapshot plus the
 * server-state cache footprint. Registered through the TanStackDevtools
 * plugins prop; runtime event flow arrives via the time-arena EventClient.
 */
export function TimeArenaPanel() {
  const queryClient = useQueryClient();
  const { isRunning, mode, elapsed, targetDuration, selectedCategoryId, sessionId } =
    useTimerStore();
  const cache = queryClient.getQueryCache().getAll();

  return (
    <div style={{ padding: "8px 0" }}>
      <Row label="timer" value={isRunning ? "running" : "idle"} />
      <Row label="mode" value={mode} />
      <Row label="elapsed" value={`${elapsed}s / ${targetDuration}s`} />
      <Row label="category" value={selectedCategoryId ?? "(none)"} />
      <Row label="session" value={sessionId ?? "(none)"} />
      <Row label="cached queries" value={String(cache.length)} />
      <Row
        label="fetching"
        value={String(cache.filter((q) => q.state.fetchStatus === "fetching").length)}
      />
    </div>
  );
}
