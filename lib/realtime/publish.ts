/**
 * Redis-backed event bus for global realtime invalidation (SSE subscribers).
 * Short-lived streams on Vercel — clients reconnect after each window.
 */

import { incrCache, setCache } from "../redis";
import type { AppEventPayload, AppEventType } from "./types";

export const REALTIME_KEYS = {
  seq: "app:events:seq",
  last: "app:events:last",
} as const;

/** TTL for last event payload — enough for SSE poll windows */
const EVENT_TTL_SECONDS = 120;

/**
 * Publish a domain event after successful CRUD.
 * Increments global seq so SSE clients detect changes.
 */
export async function publishAppEvent(type: AppEventType): Promise<AppEventPayload | null> {
  try {
    const seq = await incrCache(REALTIME_KEYS.seq);
    if (seq <= 0) return null;

    const payload: AppEventPayload = { seq, type, ts: Date.now() };
    await setCache(REALTIME_KEYS.last, payload, EVENT_TTL_SECONDS);
    return payload;
  } catch (error) {
    console.error("publishAppEvent error:", error);
    return null;
  }
}

/** Read latest event (SSE poll helper) */
export async function getLastAppEvent(): Promise<AppEventPayload | null> {
  const { getCache } = await import("../redis");
  return getCache<AppEventPayload>(REALTIME_KEYS.last);
}
