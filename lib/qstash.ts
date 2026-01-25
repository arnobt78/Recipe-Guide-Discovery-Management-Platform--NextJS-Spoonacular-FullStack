/**
 * Upstash QStash Client
 *
 * Centralized QStash client for scheduled tasks and job queues
 * Following DEVELOPMENT_RULES.md: Centralized utilities, reusable functions
 */

import { Client } from "@upstash/qstash";

/**
 * QStash client instance
 * Uses environment variables for connection
 */
export const qstash = new Client({
  token: process.env.QSTASH_TOKEN || "",
});

/**
 * Schedule a task to run at a specific time
 *
 * @param url - URL endpoint to call
 * @param body - Request body (optional)
 * @param schedule - Cron expression or delay in seconds
 * @returns Task ID
 */
export async function scheduleTask(
  url: string,
  body?: unknown,
  schedule?: string | number
): Promise<string> {
  try {
    if (schedule) {
      // Schedule with cron or delay
      const response = await qstash.publishJSON({
        url,
        body: body || {},
        ...(typeof schedule === "number"
          ? { delay: schedule }
          : { cron: schedule }),
      });
      return response.messageId;
    } else {
      // Immediate execution
      const response = await qstash.publishJSON({
        url,
        body: body || {},
      });
      return response.messageId;
    }
  } catch (error) {
    console.error("QStash schedule error:", error);
    throw error;
  }
}

/**
 * Cancel a scheduled task
 *
 * @param messageId - Task message ID
 */
export async function cancelTask(messageId: string): Promise<void> {
  try {
    await qstash.messages.delete(messageId);
  } catch (error) {
    console.error("QStash cancel error:", error);
    throw error;
  }
}

/**
 * Get task status
 *
 * @param messageId - Task message ID
 * @returns Task status
 */
export async function getTaskStatus(messageId: string) {
  try {
    return await qstash.messages.get(messageId);
  } catch (error) {
    console.error("QStash get status error:", error);
    throw error;
  }
}

/**
 * Verify QStash webhook signature
 * Use this in API routes to verify incoming QStash requests
 *
 * @param request - Next.js request object
 * @returns True if signature is valid
 */
export async function verifyQStashSignature(
  request: Request
): Promise<boolean> {
  try {
    const signature = request.headers.get("upstash-signature");
    if (!signature) {
      return false;
    }

    const body = await request.text();
    const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
    const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;

    // Try current key
    if (currentSigningKey) {
      const isValid = await qstash.verify({
        signature,
        body,
        signingKey: currentSigningKey,
      });
      if (isValid) return true;
    }

    // Try next key (for key rotation)
    if (nextSigningKey) {
      const isValid = await qstash.verify({
        signature,
        body,
        signingKey: nextSigningKey,
      });
      if (isValid) return true;
    }

    return false;
  } catch (error) {
    console.error("QStash signature verification error:", error);
    return false;
  }
}
