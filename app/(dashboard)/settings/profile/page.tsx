"use client";
import { meAtom } from "@/states/atom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRecoilState } from "recoil";
import { signOut } from "next-auth/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Profile() {
  const [me] = useRecoilState(meAtom);
  if (!me) return null;
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex flex-col gap-2">
        <p className="text-2xl font-bold">Profile</p>
        <p>This is your profile.</p>
        <Separator className="mt-2" />
      </div>
      <div className="mt-4 flex flex-col gap-4">
        <Label className="flex flex-col gap-4">
          Name
          <Input value={me?.name} readOnly />
        </Label>
        <Label className="flex flex-col gap-4">
          Email
          <Input value={me?.email} readOnly />
        </Label>
      </div>
      <div className="flex w-full justify-end gap-4">
        <Dialog>
          <DialogTrigger>
            <Button variant="destructive">Sign out</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                You will logout from your account.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-4">
              <DialogClose>Cancel</DialogClose>
              <Button variant="destructive" onClick={() => signOut()}>
                Sign out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
