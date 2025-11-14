/**
 * Configuration for allowed CORS origins
 */

// Agent app base URL - change this to update agent references everywhere
const AGENT_BASE_URL = process.env.AGENT_BASE_URL || "http://localhost:3003";

export const ALLOWED_ORIGINS = [
  "https://v0.dev",
  "https://preview.v0.dev",
  "https://*.v0.dev",
  "http://localhost:3000",
  "http://localhost:3001",
  AGENT_BASE_URL, // Agent app
  "http://localhost:5173", // Vite dev server
  "http://localhost:4173", // Vite preview
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  AGENT_BASE_URL.replace("localhost", "127.0.0.1"), // Agent app with 127.0.0.1
  "http://127.0.0.1:5173",
];
