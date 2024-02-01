// @ts-nocheck

"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { getProviders, signIn } from "next-auth/react";

function SignIn() {
  const [providers, setProviders] = useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      const providers = await getProviders();
      setProviders(providers);
    };
    fetchData();
  }, []);

  if (!providers) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      {Object.values(providers).map((provider) => {
        return (
          <div key={provider.name}>
            <Button onClick={() => signIn(provider.id)}>
              Sign in with {provider.name}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export default SignIn;
