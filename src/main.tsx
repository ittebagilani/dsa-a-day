import { createRoot } from "react-dom/client";
import { PostHogProvider } from "posthog-js/react";
import App from "./App.tsx";
import "./index.css";
import { analyticsEnabled, posthogClient } from "./lib/analytics";

const app = analyticsEnabled() && posthogClient ? (
  <PostHogProvider client={posthogClient}>
    <App />
  </PostHogProvider>
) : (
  <App />
);

createRoot(document.getElementById("root")!).render(app);
