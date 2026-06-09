/**
 * Global SSE listener — invalidates React Query on cross-tab CRUD events.
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRealtimeSync } from "../../hooks/useRealtimeSync";
import { invalidateByAppEvent } from "../../utils/queryInvalidation";

export default function RealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  useRealtimeSync({
    onEvent: (event) => {
      invalidateByAppEvent(queryClient, event.type);
    },
  });

  return <>{children}</>;
}
