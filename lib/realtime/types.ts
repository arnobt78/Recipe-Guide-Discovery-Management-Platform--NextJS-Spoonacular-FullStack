/**
 * Global realtime event types — maps to React Query invalidation domains.
 * Published on CRUD; consumed by SSE clients for cross-tab/page sync.
 */

export const APP_EVENT_TYPES = [
  "insights",
  "favourites",
  "collections",
  "mealPlan",
  "shoppingList",
  "notes",
  "images",
  "videos",
  "filterPresets",
  "user",
  "recipes",
] as const;

export type AppEventType = (typeof APP_EVENT_TYPES)[number];

/** Payload stored in Redis and sent over SSE */
export interface AppEventPayload {
  seq: number;
  type: AppEventType;
  ts: number;
}

export function isAppEventType(value: string): value is AppEventType {
  return (APP_EVENT_TYPES as readonly string[]).includes(value);
}
