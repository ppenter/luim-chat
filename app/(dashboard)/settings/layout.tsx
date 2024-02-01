"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";

import { ReactNode } from "react";
import { word2lower } from "@/lib/utils";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SheetBar, { SettingMenuItems } from "@/components/sheet-bar";
import { Separator } from "@/components/ui/separator";

export default function RootLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = usePathname();

  //   const [functionAppConfig, setFunctionAppConfig] = useRecoilState(
  //     functionAppConfigAtom,
  //   );

  // const function_list = Object.keys(functions)

  return (
    <div className="flex h-full">
      <div className="border-r p-4 pt-6">
        <Sheet>
          <SheetTrigger>
            <HamburgerMenuIcon />
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col gap-2">
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <Separator />
            <SheetBar />
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden h-full w-[240px] flex-col gap-4 border-r p-4 md:flex">
        {SettingMenuItems.map((item) => {
          const _path = item?.path || word2lower(item.name);
          return (
            <Button
              key={_path}
              onClick={() => router.push(item?.path || `/settings/${_path}`)}
              className="hover:bg-secondary hover:text-primary"
              variant={
                path === (item?.path ? item?.path : `/settings/${_path}`)
                  ? "secondary"
                  : "ghost"
              }
            >
              {item.name}
            </Button>
          );
        })}
      </div>
      <div className="flex flex-1 flex-col gap-2">{children}</div>
    </div>
  );
}
