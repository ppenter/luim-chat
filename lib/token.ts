// import { encodingForModel } from "js-tiktoken";

export interface IMessage {
  role: "function" | "user" | "system" | "assistant";
  content: string;
}

export function calToken(text: string) {
//   const enc = encodingForModel("gpt-3.5-turbo-1106");
//   return enc.encode(text).length;
    return text.length;
}

export function calTokenFromContext(messages: IMessage[], functions?: any[]) {
  let token = 1;
  for (const message of messages) {
    token += 3;
    token += calToken(message.content);
    token += 2;
  }
  if (functions) {
    const func = JSON.stringify(functions);
    token += calToken(func);
  }
  token += 2;
  return token;
}
