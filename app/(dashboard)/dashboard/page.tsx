"use client";

import { FormEvent, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import va from "@vercel/analytics";
import clsx from "clsx";
import { LoadingCircle, SendIcon } from "../../icons";
// import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// import Textarea from "react-textarea-autosize";
import { toast } from "sonner";
import { useRecoilState } from "recoil";
import {
  functionsContextAtom,
  installedPluginsAtom,
  meAtom,
  openaiSettingAtom,
  pluginsAtom,
} from "../../../states/atom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import ChatBubble from "@/components/chat-bubble";
import { Textarea } from "@/components/ui/textarea";
// import ChatBubble from "@/components/chat-bubble";


export default function Chat() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [me, setMe] = useRecoilState(meAtom);
  const [openaiSetting] = useRecoilState(openaiSettingAtom);
  const [functionsContext, setFunctionsContext] =
    useRecoilState(functionsContextAtom);
  const [plugins, setPlugins] = useRecoilState(pluginsAtom);
  const [installedPlugins] = useRecoilState(installedPluginsAtom);

  const initialMessages: {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
  }[] = [
    {
      id: "1",
      role: "assistant",
      content: "Welcome to LUIM!",
    },
  ];

  async function init() {
    const me = await fetch("/api/me");
    const json = await me.json();
    setMe(json);
  }

  const { messages, input, setInput, handleSubmit, isLoading, setMessages } =
    useChat({
      onResponse: (response) => {
        if (response.status === 429) {
          toast.error("You have reached your request limit for the day.");
          va.track("Rate limited");
          return;
        } else {
          va.track("Chat initiated");
        }
        init();
      },
      onError: (error) => {
        va.track("Chat errored", {
          input,
          error: error.message,
        });
      },
      initialMessages: initialMessages,
    });

  const call_function = async (message: any) => {
    try {
      console.log(message);
      // if function call
      if (message?.function_call?.name) {
        const context = functionsContext?.find(
          (func: any) => func.name === message?.function_call?.name,
        );
        const plugin_name = context?.name.split("___")[0];
        const api_name = context?.name.split("___")[1];
        const plugin = installedPlugins.find(
          (plugin: any) => plugin.name === plugin_name,
        );
        const _manifest = await fetch(`/plugins/${plugin_name}.json`);
        const manifest = await _manifest.json();
        const api = manifest?.api?.find((api: any) => api.name === api_name);
        let hostname = manifest?.hostname || plugin?.url;
        let method = api?.method || "GET";
        let args = JSON.parse(message?.function_call?.arguments);

        // remove last backslash if exist
        if (hostname[hostname.length - 1] === "/")
          hostname = hostname.slice(0, hostname.length - 1);
        hostname = hostname + api?.url;
        console.log(api, "api");
        Object.keys(api?.parameters?.properties)?.map((prop: any) => {
          console.log(prop, "prop");
          const property = api?.parameters?.properties?.[prop];
          if (property?.dynamicPath) {
            console.log(property?.name, args[prop], "args");
            hostname = hostname + args[prop];
            delete args[prop];
          }
        });
        if (method === "GET") {
          let params = "?";
          Object.keys(args).map((key) => {
            params = params + key + "=" + JSON.stringify(args[key]) + "&";
          });
          hostname = `${hostname}${params}`;
          console.log(hostname);
        }
        const res = await fetch(`${hostname}`, {
          method: api?.method || "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: plugin?.authorization ? plugin?.authorization : "",
          },
          // body: JSON.parse(message?.function_call?.arguments)
        });
        console.log(res);
        if (!res.ok) {
          toast.error("Function call error");
          return "";
        } else {
          // set last message to assistant and res json
          const json = await res.json();
          return json;
          // edit last message
          // setMessages(messages)
        }
      }
    } catch (e: any) {
      toast.error(e.message);
      return null;
    }
  };

  const disabled = isLoading || input.length === 0;
  useEffect(() => {
    const call = async () => {
      // check last message is function call
      const lastMessage = messages[messages.length - 1] as any;
      if (lastMessage?.function_call && lastMessage?.content === "") {
        const data = await call_function(lastMessage);
        if (data) {
          setMessages(
            messages.map((message: any) => {
              if (message.id === lastMessage.id) {
                return {
                  ...message,
                  content:
                    'Call function "' +
                    lastMessage?.function_call?.name +
                    '" success' +
                    "\n" +
                    "```\n" +
                    JSON.stringify(
                      lastMessage?.function_call?.arguments,
                      null,
                      2,
                    ) +
                    "\n```" +
                    "\n" +
                    "```\n" +
                    JSON.stringify(data, null, 2) +
                    "\n```",
                };
              }
              return message;
            }),
          );
        } else {
          setMessages(
            messages.map((message: any) => {
              if (message.id === lastMessage.id) {
                return {
                  ...message,
                  content:
                    'Call function "' +
                    lastMessage?.function_call?.name +
                    '" failed' +
                    "```\n" +
                    JSON.stringify(
                      lastMessage?.function_call?.arguments,
                      null,
                      2,
                    ) +
                    "\n```",
                };
              }
              return message;
            }),
          );
        }
      }
    };
    call();
  }, [messages]);

  const fetchPlugins = async () => {
    const res = await fetch("/plugins/index.json");
    const json = await res.json();
    const keys = Object.keys(json);
    const _plugins = keys.map((key) => {
      return {
        ...json[key],
        name: key,
      };
    });
    setPlugins(_plugins);
  };

  const fetchFunctionsContext = async () => {
    const functions = await Promise.all(
      installedPlugins.map(async (plugin) => {
        if (!plugin?.isActive) return [];
        const res = await fetch(`/plugins/${plugin.name}.json`);
        const json = await res.json();
        const apis = json.api.map((api: any) => {
          return {
            ...api,
            name: `${plugin.name}___${api.name}`,
          };
        });
        return apis;
      }),
    );
    setFunctionsContext(functions.flat());
  };

  useEffect(() => {
    fetchFunctionsContext();
  }, [plugins]);

  useEffect(() => {
    init();
    fetchPlugins();
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e, {
      options: {
        body: {
          openai_key: openaiSetting?.apiKey,
          functions: functionsContext,
          plugins: installedPlugins,
        },
      },
    });
  };

  if (!me?.id) {
    return <div></div>;
  }

  return (
    <main className="flex flex-col items-center justify-between pb-40">
      <div className="flex w-full max-w-screen-md flex-1 flex-col gap-2">
        {messages?.map((message, i) => {
          if (message.role === "system") {
            return null;
          }
          return (
            <div
              key={i}
              className={clsx(
                "flex w-full items-center py-8",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div className="flex items-start gap-2 space-x-4 px-5 lg:gap-2">
                <div
                  className={clsx(
                    "p-1.5 text-white md:text-4xl",
                    // message.role === "assistant" ? "bg-green-500" : "bg-black",
                  )}
                >
                  {message.role === "user"
                    ? // <User width={20} />
                      null
                    : // <Bot width={20} />
                      "🤖"}
                </div>
                <ChatBubble role={message.role}>
                  <ReactMarkdown
                    className={`prose mt-1 w-full break-words prose-p:leading-relaxed ${
                      message.role == "user" ? "text-end text-white" : ""
                    }`}
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // open links in new tab
                      a: (props) => (
                        <a
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </ChatBubble>
                <div
                  className={clsx(
                    "p-1.5 text-white md:text-4xl",
                    // message.role === "assistant" ? "bg-green-500" : "bg-black",
                  )}
                >
                  {message.role === "user"
                    ? // <User width={20} />
                      "😎"
                    : // <Bot width={20} />
                      null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="fixed bottom-0 flex w-full max-w-4xl flex-col items-center space-y-3 p-2 pb-3 sm:px-4">
        <div className="flex w-full flex-wrap gap-4"></div>
        <form ref={formRef} onSubmit={onSubmit} className="relative w-full">
          {/* Hidded */}
          <input
            type="hidden"
            id="openai_key"
            name="openai_key"
            value={openaiSetting?.apiKey}
          />
          <Textarea
            ref={inputRef}
            tabIndex={0}
            required
            rows={1}
            autoFocus
            placeholder="Send a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                formRef.current?.requestSubmit();
                e.preventDefault();
              }
            }}
            spellCheck={false}
            className="h-9 w-full resize-none bg-white pr-10 focus:outline-none"
          />
          <div className="absolute right-0 top-0 flex h-full items-center gap-2 pr-2 sm:pr-6">
            <Button disabled={disabled}>
              {isLoading ? (
                <LoadingCircle />
              ) : (
                <SendIcon
                  className={clsx(
                    "h-4 w-4",
                    input.length === 0 ? "text-gray-300" : "text-white",
                  )}
                />
              )}
            </Button>
            <Dialog>
              <DialogTrigger>
                <Button type="button" variant="secondary">
                  Fx
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Plugins</DialogTitle>
                  <DialogDescription>
                    Plugins that you have installed
                  </DialogDescription>
                </DialogHeader>
                <Separator />
                <div>
                  {installedPlugins.map((plugin) => {
                    if (!plugin?.isActive) return null;
                    const _plugin = plugins.find(
                      (_plugin: any) => _plugin.name === plugin.name,
                    );
                    return (
                      <div
                        key={plugin.name}
                        className="flex items-center justify-between gap-4"
                      >
                        <p>{_plugin.title}</p>
                        <span className="me-3 flex h-3 w-3 rounded-full bg-green-500"></span>
                      </div>
                    );
                  })}
                </div>
                <Separator />
                <DialogHeader>
                  <DialogTitle>Functions</DialogTitle>
                  <DialogDescription>
                    Functions in plugins that will be used in chat
                  </DialogDescription>
                </DialogHeader>
                <Separator />
                {functionsContext?.map((func: any) => {
                  return (
                    <div
                      key={func.name}
                      className="items-between flex w-full flex-col gap-2"
                    >
                      <div>{func?.name + "()"}</div>
                      <span className="text-xs text-gray-400">
                        {func?.description}
                      </span>
                      <Separator />
                    </div>
                  );
                })}
              </DialogContent>
            </Dialog>
          </div>
        </form>
        <p className="flex gap-2 text-center text-xs text-gray-400">
          P.S. The more chat history you have, the more token you will spend.
          <p className="s text-center text-xs text-gray-400">
            Clear chat history{" "}
            <a
              className="cursor-pointer font-bold"
              onClick={() => setMessages([])}
            >
              here
            </a>
          </p>
        </p>
      </div>
    </main>
  );
}
