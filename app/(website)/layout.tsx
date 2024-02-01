import { Button } from "@/components/ui/button";
import "../globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className + " flex flex-col"}>
        <div className="flex w-full items-center justify-between bg-white px-12 py-6">
          <Link href="/" className="text-2xl font-bold tracking-widest">
            LUIM
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="link" className="flex items-center gap-2">
              Docs
            </Button>
            <Button variant="link" className="flex items-center gap-2">
              Pricing
            </Button>
            <Link href="/dashboard">
              <Button variant="secondary" className="flex items-center gap-2">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
        {children}
      </body>
      <Analytics />
    </html>
  );
}
