import { useQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { Link, Route, Routes } from "react-router-dom";

function Health(): JSX.Element {
  const query = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error(`health failed: ${res.status}`);
      return (await res.json()) as { ok: boolean; service: string };
    },
  });

  if (query.data) return <p>{`API: ${query.data.service} ok=${query.data.ok}`}</p>;
  if (query.error)
    return <p>{`API unreachable — start it with \`turbo dev\` (${String(query.error)})`}</p>;
  return <p>Checking /api/health via dev proxy…</p>;
}

export function App(): JSX.Element {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>time-arena web skeleton</h1>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Health />} />
      </Routes>
    </main>
  );
}
