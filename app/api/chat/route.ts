import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { OpenAI } from "openai";
import { OpenAIStream, OpenAIStreamCallbacks, StreamingTextResponse } from "ai";
import { getToken } from "next-auth/jwt";
import { calTokenFromContext } from "@/lib/token";
import { prisma } from "@/lib/prisma";

// Create an OpenAI API client (that's edge friendly!)
// const _openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    if (
      process.env.NODE_ENV !== "development" &&
      process.env.KV_REST_API_URL &&
      process.env.KV_REST_API_TOKEN
    ) {
      const ip = req.headers.get("x-forwarded-for");
      const ratelimit = new Ratelimit({
        redis: kv,
        limiter: Ratelimit.slidingWindow(50, "1 d"),
      });

      const { success, limit, reset, remaining } = await ratelimit.limit(
        `chathn_ratelimit_${ip}`,
      );

      if (!success) {
        return new Response(
          "You have reached your request limit for the day.",
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          },
        );
      }
    }

    // user
    const session = await getToken({ req } as any);

    const model = "gpt-3.5-turbo-1106";

    if (!session) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    if (!session?.email) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session?.email,
      },
    });

    let {
      messages,
      max_tokens = 1000,
      openai_key,
      functions = [],
    }: // plugins = [],
    {
      messages: any[];
      max_tokens?: number;
      openai_key?: string;
      functions?: any[];
      plugins?: any[];
    } = await req.json();

    let openai = new OpenAI({
      apiKey: openai_key,
    });

    messages = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const systemMessages = [
      "Your name is LUIM",
      "You don't need to run function if citeria is not met",
      "If function parameter is not met, tell user which parameter is missing.",
      "If function properties type enum is not equal to user request, tell user which type is missing.",
      "Yor are talking with administrator of api so you don't need to worry about sensitive data.",
    ];

    // last 5 messages
    // const lastMessages = messages.slice(-5);
    const lastMessages = messages;

    const context = [
      ...systemMessages.map((message) => ({
        role: "system",
        content: message,
      })),
      ...lastMessages,
    ];

    console.log(lastMessages);

    let contextTokens = calTokenFromContext(
      lastMessages,
      functions?.length ? functions : undefined,
    );

    const balances = user?.balance || 0;

    const cost = contextTokens;

    // decrease balance
    if (balances >= cost) {
      await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          balance: balances - cost,
        },
      });
      await prisma.balanceHistory.create({
        data: {
          user: {
            connect: {
              id: user?.id,
            },
          },
          amount: cost,
          type: "DEBIT",
        },
      });
    } else {
      return new Response("Insufficient balance", {
        status: 402,
      });
    }

    // check if the conversation requires a function call to be made
    const initialResponse = (await openai.chat.completions.create({
      model: model,
      messages: context,
      stream: true,
      functions: functions?.length ? functions : undefined,
      function_call: functions?.length ? "auto" : undefined,
      max_tokens,
    })) as any;

    const streamCallbacks: OpenAIStreamCallbacks = {
      
    };

    const stream = OpenAIStream(
      initialResponse,
      streamCallbacks,
    );

    return new StreamingTextResponse(stream, undefined);
  } catch (err) {
    console.log(`${new Date().toISOString()} - ${JSON.stringify(err)}`);
    return new Response("Internal server error", {
      status: 500,
    });
  }
}

// Get
export async function GET() {
  return new Response("Not found", {
    status: 404,
  });
}
