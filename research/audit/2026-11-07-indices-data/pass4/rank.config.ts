import { defineConfig } from "vitest/config";
export default defineConfig({ test: { include: ["research/audit/2026-11-07-indices-data/pass4/*.test.ts"], isolate: false } });
