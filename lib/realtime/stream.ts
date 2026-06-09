/**
 * SSE stream handler — polls Redis seq for ~8s (Vercel Hobby safe window).
 * Client reconnects via EventSource for continuous cross-tab sync.
 */

import { getLastAppEvent } from "./publish";
import type { AppEventPayload } from "./types";

const STREAM_DURATION_MS = 8000;
const POLL_INTERVAL_MS = 1000;

export function createAppEventStream(): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let lastSeq = 0;
      const startedAt = Date.now();

      const push = (text: string) => {
        controller.enqueue(encoder.encode(text));
      };

      // Initial connection comment (keeps proxies alive)
      push(": connected\n\n");

      const poll = async () => {
        try {
          const event: AppEventPayload | null = await getLastAppEvent();
          if (event && event.seq > lastSeq) {
            lastSeq = event.seq;
            push(`data: ${JSON.stringify(event)}\n\n`);
          } else {
            push(": heartbeat\n\n");
          }
        } catch {
          push(": heartbeat\n\n");
        }
      };

      await poll();

      const interval = setInterval(async () => {
        if (Date.now() - startedAt >= STREAM_DURATION_MS) {
          clearInterval(interval);
          push(": reconnect\n\n");
          controller.close();
          return;
        }
        await poll();
      }, POLL_INTERVAL_MS);
    },
  });
}

export const SSE_HEADERS: HeadersInit = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};
