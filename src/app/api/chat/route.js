import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 120;

export async function POST(req) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
  });

  return result.toDataStreamResponse();
}
