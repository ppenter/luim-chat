import "../globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import Toaster from "../toaster";
import { Analytics } from "@vercel/analytics/react";
import { Provider } from "../provider";
import Navbar from "@/components/nav-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LUIM | Chat",
  description: "LUIM Ai - Chatbot for your business",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="en">
      <div className={inter.className + " flex h-screen flex-col"}>
        <Provider>
          <div>
            <Navbar />
          </div>
          <div className="flex-1 pt-16">{children}</div>
        </Provider>
        <Toaster />
      </div>
      <Analytics />
    </div>
  );
}
