"use client";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import { ReactNode, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (document) {
      document.addEventListener("gesturestart", function (e) {
        e.preventDefault();
        (document as any).body.style.zoom = 0.99;
      });

      document.addEventListener("gesturechange", function (e) {
        e.preventDefault();

        (document as any).body.style.zoom = 0.99;
      });
      document.addEventListener("gestureend", function (e) {
        e.preventDefault();
        (document as any).body.style.zoom = 1;
      });
    }
  }, []);
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, height=device-height, initial-scale:1, user-scalable=no"
        />
        <meta name="HandheldFriendly" content="true" />
      </head>
      <body className={inter.className + " flex flex-col"}>{children}</body>
      <Analytics />
    </html>
  );
}
