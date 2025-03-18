import { join } from "node:path";
import { defineConfig } from "@tanstack/start/config";
import type { App } from "vinxi";
import { cloudflare } from 'unenv'
import { parseEnv } from "./app/lib/env";
import { getCloudflareProxyEnv, isInCloudflareCI } from "./app/lib/cloudflare";

await parseEnv();

const app = defineConfig({
  server: {
    preset: "cloudflare-pages",
    unenv: cloudflare,
    rollupConfig: {
      external: ["node:async_hooks"],
    },
  },
  vite: {
    define: await proxyCloudflareEnv(),
  },
});

async function proxyCloudflareEnv() {
  if (isInCloudflareCI()) return undefined;

  const env = await getCloudflareProxyEnv();

  const viteDefine = Object.fromEntries(
    Object.entries(env)
      .filter(([key]) => key.startsWith("VITE_"))
      .map(([key, value]) => [`import.meta.env.${key}`, `"${value}"`])
  );

  return viteDefine;
}

function withGlobalMiddleware(app: App) {
  return {
    ...app,
    config: {
      ...app.config,
      routers: app.config.routers.map((router) => ({
        ...router,
        middleware:
          router.target !== "server"
            ? undefined
            : join("app", "global-middleware.ts"),
      })),
    },
  };
}

export default withGlobalMiddleware(app);
