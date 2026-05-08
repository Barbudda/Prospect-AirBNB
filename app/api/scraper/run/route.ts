import { NextRequest } from "next/server";
import { runScraper } from "@/lib/services/scraper/scraperController";
import type { ProgressEvent } from "@/lib/services/scraper/types";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const input = await req.json();

  if (!input.targetDescription?.trim() || !input.location?.trim()) {
    return new Response(
      JSON.stringify({ error: "targetDescription and location are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ProgressEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch { /* stream closed */ }
      };

      try {
        await runScraper(input, send);
      } catch (error) {
        send({ type: "error", message: error instanceof Error ? error.message : "Unknown error" });
      } finally {
        try { controller.close(); } catch { /* already closed */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
}
