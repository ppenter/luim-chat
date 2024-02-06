/* eslint-disable no-unsafe-optional-chaining */
"use client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { AlertCircleIcon } from "lucide-react";
import { getProviders, signIn } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const query = useParams();
  const [providers, setProviders] = useState<any>(null);

  const fetchProviders = async () => {
    const res = await getProviders();
    setProviders(res);
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const { error } = query;

  return (
    <div className="grid h-screen w-screen lg:grid-cols-2">
      <div className="hidden h-full bg-black text-white lg:block"></div>
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
        <div className="fixed left-0 top-0 flex w-screen justify-between p-4">
          <Button
            variant="link"
            onClick={(e) => {
              e.preventDefault();
              router.push("/dashboard");
            }}
            className="text-2xl font-bold text-black lg:text-white"
          >
            LUIM
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-2xl font-bold">Sign In</span>
            <span className="">Sign in to your account to continue</span>
          </div>
          <Separator />
          {providers &&
            Object.values(providers).map((provider: any) => {
              console.log(provider);
              const Icon = Icons?.[provider.id as keyof typeof Icons];
              console.log(Icon);
              return (
                <Button
                  key={provider.name}
                  variant="secondary"
                  onClick={() =>
                    signIn(provider.id, {
                      callbackUrl: "/dashboard",
                    })
                  }
                  className="flex items-center justify-center gap-4"
                >
                  <div>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span>Sign in with {provider.name}</span>
                </Button>
              );
            })}
          {error && (
            <Alert variant="destructive" className="flex items-center gap-4">
              <AlertCircleIcon />
              <span className="ml-2">{error}</span>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
