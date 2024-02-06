"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useRecoilState } from "recoil";
import { useEffect } from "react";
import { meAtom } from "@/states/atom";
import { nFormatter } from "@/lib/utils";
import { LightningBoltIcon } from "@radix-ui/react-icons";

export default function Navbar() {
  const [me, setMe] = useRecoilState(meAtom);
  const fetchMe = async () => {
    const data = await fetch("/api/me");
    const me = await data.json();
    setMe(me);
  };

  useEffect(() => {
    fetchMe();
  }, []);

  if (!me)
    return (
      <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center gap-4">
        <p className="text-4xl font-bold">LUIM</p>
        <svg
          className="h-8 w-8 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );

  return (
    <div className="z-50 fixed bg-white dark:bg-black flex w-full items-center justify-between border-b px-5 py-4">
      <Link href="/dashboard" className="text-2xl font-bold tracking-widest">
        LUIM
      </Link>
      <div className="flex gap-4">
        <Link
          href="/settings/profile"
          className="flex items-center gap-2 sm:flex"
        >
          <Button
            variant="secondary"
            className="flex w-14 items-center justify-start gap-2 sm:w-full"
          >
            <p className="truncate">{me?.email || ""}</p>
          </Button>
        </Link>
        {/* <Button variant="outline" className="flex items-center gap-2">
            <p>Hobby</p>
          </Button> */}
        <Button variant="outline" className="flex items-center gap-2">
          <p className="flex gap-2 items-center"><LightningBoltIcon/> {nFormatter(me?.balance, 2) || 0}</p>
        </Button>
        <Link href="/settings" className="flex items-center gap-2">
        <Button 
        size='icon'
        variant='outline' className="flex items-center gap-2">
          <Settings size={16}/>
        </Button>
        </Link>
      </div>
    </div>
  );
}
