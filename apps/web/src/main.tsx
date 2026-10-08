import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider.js";
import { App } from "./App.js";
import { TimeArenaPanel } from "./devtools/TimeArenaPanel.js";
import "./index.css";

function Root() {
  // Server state lives here, never in zustand. Fresh-but-calm defaults:
  // data goes stale after 30s, sticks around 5min, one retry, and refocus
  // revalidates (background refetch) instead of suspensing.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
      {/* Mounted once: framework adapter + library and product panels.
          eventBusConfig bridges to the Vite server bus (console piping,
          marketplace). Production builds strip this import and JSX. */}
      <TanStackDevtools
        config={{ position: "bottom-right" }}
        eventBusConfig={{ connectToServerBus: true }}
        plugins={[
          {
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel />,
            defaultOpen: true,
          },
          {
            name: "Time Arena",
            render: <TimeArenaPanel />,
          },
        ]}
      />
    </StrictMode>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("missing #root");

createRoot(root).render(<Root />);
