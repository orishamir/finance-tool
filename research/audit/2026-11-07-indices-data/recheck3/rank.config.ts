import { defineConfig } from "vitest/config";
export default defineConfig({ test: { include: ["research/audit/2026-11-07-indices-data/recheck3/*.test.ts"], isolate: false } });
