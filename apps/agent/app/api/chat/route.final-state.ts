import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from 'ai';
import { auth0 } from '../../../lib/auth0';
import { NextResponse } from 'next/server';
import { agentTools } from './tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// todo: update me to final state of using new MCP server for tools...

export async function POST(req: Request) {
  // Verify user is authenticated
  const session = await auth0.getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const user = session.user;

  const result = streamText({
    model: openai('gpt-4.1-mini'),
    messages: convertToModelMessages(messages),
    system: `You are a helpful stock trading assistant for DemoTradePro. You provide trading advice, market insights, and help users understand stock market concepts. You are knowledgeable, professional, and always emphasize risk management.

You are currently assisting ${user.name || 'a user'} (${user.email || 'authenticated user'}).

Key guidelines:
- Always remind users that trading involves risk
- Provide educational information about stocks and markets
- Help with basic trading concepts and strategies
- Be conversational and helpful
- Never provide specific financial advice or guarantees
- You can reference the user by their name when appropriate

You now have access to real-time stock market data through your tools. Use them when users ask about stock prices, company information, or want to search for stocks.`,
    tools: agentTools,
    stopWhen: stepCountIs(15),
  });

  return result.toUIMessageStreamResponse();
}
