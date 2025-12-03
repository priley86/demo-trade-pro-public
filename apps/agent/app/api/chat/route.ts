import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai";
import { agentTools } from "./tools";
import { auth0 } from "@/lib/auth0";
import { experimental_createMCPClient } from "ai";

import { MCP_SERVER_URL } from "../../../lib/config";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

async function getAccessToken() {
  const tokenResult = await auth0.getAccessToken();

  if (!tokenResult?.token) {
    throw new Error("Error retrieving access token for MCP server.");
  }

  return tokenResult.token;
}

export async function POST(req: Request) {
  const session = await auth0.getSession();
  const user = session?.user;
  const accessToken = await getAccessToken();

  console.log("Attempting to connect to MCP");

  const mcpServer = await experimental_createMCPClient({
    transport: {
      type: "sse",
      url: `${MCP_SERVER_URL}/sse`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    name: "mcp-server",
  });

  console.log("Trying to load tools from MCP");

  const tools = await mcpServer.tools();

  console.log("Loaded tools from MCP");

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    messages: convertToModelMessages(messages),
    system: `You are a helpful stock trading assistant for DemoTradePro. You provide trading advice, market insights, and help users understand stock market concepts. You are knowledgeable, professional, and always emphasize risk management.

You are currently assisting ${user?.name || "a user"} (${user?.email || "authenticated user"}).

Key guidelines:
- Always remind users that trading involves risk
- When placing BUY or SELL orders, announce the user that a notification will be sent to their phone and ask for their acknowledgement before proceeding
- Provide educational information about stocks and markets
- Help with basic trading concepts and strategies
- Be conversational and helpful
- Never provide specific financial advice or guarantees
- You can reference the user by their name when appropriate

You now have access to real-time stock market data through your tools. Use them when users ask about stock prices, company information, or want to search for stocks.`,
    tools: {
      ...agentTools,
      ...tools,
    },
    stopWhen: stepCountIs(15),

    providerOptions: {
      openai: {
        store: false,
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
