import { word2lower } from "@/lib/utils";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";

export const SettingMenuItems = [
  {
    name: "Settings",
    path: "/settings",
  },
  {
    name: "Profile",
  },
];

export default function SheetBar() {
  const router = useRouter();
  const path = usePathname();
  return (
    <>
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
    </>
  );
}
