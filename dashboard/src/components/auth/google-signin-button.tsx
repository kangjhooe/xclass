"use client";

import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function GoogleSignInButton() {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full justify-center gap-2"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
    >
      <FcGoogle className="h-4 w-4" />
      Continue with Google
    </Button>
  );
}

