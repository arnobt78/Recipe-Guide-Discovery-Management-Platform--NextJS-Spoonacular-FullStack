/**
 * Realtime publish — Redis seq increment on CRUD events.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const incrMock = vi.fn().mockResolvedValue(1);
const setMock = vi.fn().mockResolvedValue(undefined);

vi.mock("../redis", () => ({
  incrCache: (...args: unknown[]) => incrMock(...args),
  setCache: (...args: unknown[]) => setMock(...args),
}));

describe("publishAppEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    incrMock.mockResolvedValue(42);
  });

  it("increments seq and stores last event payload", async () => {
    const { publishAppEvent, REALTIME_KEYS } = await import("../realtime/publish");
    const payload = await publishAppEvent("favourites");

    expect(incrMock).toHaveBeenCalledWith(REALTIME_KEYS.seq);
    expect(setMock).toHaveBeenCalledWith(
      REALTIME_KEYS.last,
      expect.objectContaining({ seq: 42, type: "favourites" }),
      120,
    );
    expect(payload?.seq).toBe(42);
    expect(payload?.type).toBe("favourites");
  });
});
