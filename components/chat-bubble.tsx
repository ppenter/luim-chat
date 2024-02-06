import React from "react";

export interface ChatBubbleProps {
  children: React.ReactNode;
  role: "user" | "assistant" | "function";
}

export default function ChatBubble({ children }: ChatBubbleProps) {
  // if (role == "function") {
  //   return (
  //     <div
  //       className={`relative w-fit space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-slate-900`}
  //     >
  //       {children}
  //     </div>
  //   );
  // }
  return (
    <div
      className={`w-full`}
    >
      {children}
    </div>
  );
}
