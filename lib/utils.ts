import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { encodingForModel } from "js-tiktoken";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const word2lower = (word: string) => {
  // lower word and replace spaces with dashes and underscores with dashes
  return word.toLowerCase().replace(/ /g, "-").replace(/_/g, "-");
};

export const lower2word = (lower: string) => {
  // replace dashes with spaces and capitalize first letter and replace underscores with spaces
  return lower
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
};

export const extract_form_data = (form: HTMLFormElement) => {
  const data = form;
  let json = {} as any;
  for (const target in data) {
    if (!isNaN(parseInt(target))) {
      const input = data[target] as HTMLInputElement;
      if (input.name && input.value) {
        json[input.name] = input.value;
      }
    }
  }
  return json;
};

export const json2urlparams = (json: any) => {
  // convert json to url params if value is array, join with comma and add blanket
  let params = "";
  for (const key in json) {
    if (Array.isArray(json[key])) {
      params += `${key}=["${json[key].join('","')}"]&`;
    } else {
      params += `${key}=${json[key]}&`;
    }
  }
  return params;
};

export interface IMessage {
  role: "function" | "user" | "system" | "assistant";
  content: string;
}

export function calToken(text: string) {
  const enc = encodingForModel("gpt-3.5-turbo-1106");
  return enc.encode(text).length;
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

export function nFormatter(num: number, digits: number | undefined) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
  const item = lookup.findLast((item) => num >= item.value);
  return item
    ? (num / item.value).toFixed(digits).replace(regexp, "").concat(item.symbol)
    : "0";
}
