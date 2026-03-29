"use client";

import { SignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LoginSignIn() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const signUpDisabledUrl = "/login?mode=signup-disabled";

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (isLoaded && isSignedIn) {
    return null;
  }

  return (
    <SignIn
      fallbackRedirectUrl="/dashboard"
      path="/login"
      routing="path"
      signUpUrl={signUpDisabledUrl}
      withSignUp={false}
    />
  );
}
