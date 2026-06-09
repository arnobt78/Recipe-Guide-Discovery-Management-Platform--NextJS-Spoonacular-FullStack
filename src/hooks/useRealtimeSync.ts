/**
 * EventSource hook — reconnects after each server stream window (~8s on Vercel).
 */

"use client";

import { useEffect, useRef } from "react";
import type { AppEventType } from "../utils/queryInvalidation";

export interface RealtimeEvent {
  seq: number;
  type: AppEventType;
  ts: number;
}

interface UseRealtimeSyncOptions {
  enabled?: boolean;
  onEvent: (event: RealtimeEvent) => void;
}

const RECONNECT_DELAY_MS = 500;

export function useRealtimeSync({
  enabled = true,
  onEvent,
}: UseRealtimeSyncOptions): void {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const lastSeqRef = useRef(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      es = new EventSource("/api/events/stream");

      es.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(msg.data) as RealtimeEvent;
          if (parsed.seq > lastSeqRef.current) {
            lastSeqRef.current = parsed.seq;
            onEventRef.current(parsed);
          }
        } catch {
          // ignore malformed payloads
        }
      };

      es.onerror = () => {
        es?.close();
        es = null;
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [enabled]);
}
