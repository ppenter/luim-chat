import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { OpenAI } from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
// import * as FunctionApp from "./functions";
// import { TFunctionApp } from "./functions";
import { getToken } from "next-auth/jwt";

// Create an OpenAI API client (that's edge friendly!)
// const _openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

export const runtime = "edge";

// async function getBalance(user_id: number) {
//   const balances = await prisma.user.findFirst({
//     where: {
//       id: user_id,
//     },
//     select: {
//       balance: true,
//     },
//   });
//   return balances?.balance || 0;
// }

// const call_function = async (
//   plugin: string,
//   fname: string,
//   args: any,
//   options?: {
//     authorization?: string;
//     host?: string;
//   },
// ) => {
//   try {
//     const base_url =
//       process.env.NODE_ENV === "development"
//         ? "http://localhost:3000"
//         : "https://luim-chat.vercel.app";

//     const _manifest = await fetch(`${base_url}/plugins/${plugin}.json`);
//     const manifest = await _manifest.json();

//     const api = manifest?.api?.find((api: any) => api.name === fname);

//     let hostname = manifest.hostname || options?.host;
//     let method = api?.method || "GET";
//     if (hostname[hostname.length - 1] === "/") {
//       hostname = hostname.slice(0, hostname.length - 1);
//     }
//     hostname = hostname + api?.url;
//     Object.keys(api?.parameters?.properties)?.map((prop: any) => {
//       const property = api?.parameters?.properties?.[prop];
//       if (property?.dynamicPath) {
//         hostname = hostname + args[prop];
//         delete args[prop];
//       }
//     });

//     if (method === "GET") {
//       let params = "?";
//       Object.keys(args).map((key) => {
//         params = params + key + "=" + JSON.stringify(args[key]) + "&";
//       });
//       hostname = `${hostname}${params}`;
//     }

//     const res = await fetch(`${hostname}`, {
//       method: api?.method || "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: options?.authorization ? options?.authorization : "",
//       },
//       // body: JSON.parse(message?.function_call?.arguments)
//     });
//     if (!res.ok) {
//       return res.statusText;
//     } else {
//       // set last message to assistant and res json
//       const json = await res.json();
//       return json;
//       // edit last message
//       // setMessages(messages)
//     }
//   } catch (err: any) {
//     return err?.message;
//   }
// };

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

    // const user = await prisma.user.findUnique({
    //   where: {
    //     email: session?.email
    //   }
    // })

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

    messages = messages.map((message) => {
      if (message.function_call) {
        return {
          role: message.role,
          content: ``,
        };
      } else {
        return message;
      }
    });

    console.log(messages);

    const systemMessages = [
      "Your name is LUIM",
      "You don't need to run function if citeria is not met",
      "If function parameter is not met, tell user which parameter is missing.",
      "If function properties type enum is not equal to user request, tell user which type is missing.",
      "Yor are talking with administrator of api so you don't need to worry about sensitive data.",
    ];

    // const balances = await getBalance(user?.id as number)

    // const cost = 1

    // // decrease balance
    // if(balances >= cost){
    //   await prisma.user.update({
    //     where: {
    //       id: user?.id
    //     },
    //     data: {
    //       balance: balances - cost
    //     }
    // })
    // }else{
    //   return new Response("Insufficient balance", {
    //     status: 402,
    //   });
    // }

    // last 5 messages
    const lastMessages = messages.slice(-5);

    // check if the conversation requires a function call to be made
    const initialResponse = (await openai.chat.completions.create({
      model: model,
      messages: [
        ...systemMessages.map((message) => ({
          role: "system",
          content: message,
        })),
        ...lastMessages,
      ],
      stream: true,
      functions: functions?.length ? functions : undefined,
      function_call: "auto",
      max_tokens,
    })) as any;

    const stream = OpenAIStream(
      initialResponse,
      //   , {
      //   experimental_onFunctionCall: async (
      //     { name, arguments: args }: any,
      //     createFunctionCallMessages: any,
      //   ) => {
      //     const plugin_name = name.split("___")[0];
      //     const api_name = name.split("___")[1];
      //     const result = await call_function(plugin_name, api_name, args, {
      //       authorization: plugins?.find(
      //         (plugin: any) => plugin.name === plugin_name,
      //       )?.authorization,
      //       host: plugins?.find((plugin: any) => plugin.name === plugin_name)
      //         ?.url,
      //     });
      //     const newMessages = createFunctionCallMessages(result);
      //     return openai.chat.completions.create({
      //       model: model,
      //       stream: true,
      //       messages: [...messages, ...newMessages],
      //       max_tokens,
      //     });
      //   },
      // } as any
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
