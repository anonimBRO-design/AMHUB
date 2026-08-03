import { apiLogger } from "@/lib/api/logger";

/**
 * Mock fallback gate for the DAL layer.
 *
 * Several DAL functions fall back to fabricated rows from `data/mock-data.ts`
 * when a query errors OR returns empty (TODO BUG-1 / TD-3). That hides real
 * DB failures and can render fake data in production.
 *
 * Policy:
 * - query error -> dev: log + mock · prod: rethrow (never hide DB failures)
 * - empty       -> dev: mock (keeps the dev UI populated) · prod: real empty
 *                  (null / [] / 0, so pages 404 or render empty states)
 */
export const isMockFallbackEnabled = (): boolean =>
	process.env.NODE_ENV !== "production";

export function serveMockFallback<T>(label: string, produce: () => T): T {
	apiLogger.warn(`[mock-fallback] ${label}: serving mock data`, {
		route: "dal",
	});
	return produce();
}
