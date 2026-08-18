import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình HMR cho GitHub Codespaces: truy cập qua domain forwarding HTTPS
// (https://<codespace>-<port>.app.github.dev) nên WebSocket phải đi qua wss/443
// về đúng domain đó thay vì localhost.
const codespaceName = process.env.CODESPACE_NAME;
const forwardingDomain =
  process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || "app.github.dev";
const devPort = 5173;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
    port: devPort,
    strictPort: true,
    allowedHosts: forwardingDomain
      ? [`.${forwardingDomain}`, ".github.dev"]
      : undefined,
    hmr:
      codespaceName && forwardingDomain
        ? {
            protocol: "wss" as const,
            host: `${codespaceName}-${devPort}.${forwardingDomain}`,
            clientPort: 443,
          }
        : undefined,
  },
});
