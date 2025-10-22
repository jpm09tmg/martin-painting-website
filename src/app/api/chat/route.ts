import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages } from 'ai';

export const maxDuration = 120;

const SYSTEM = `You are a helpful assistant.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: SYSTEM,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}