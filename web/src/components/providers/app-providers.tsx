"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ClerkProvider, useAuth, useClerk, useUser } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useMutation } from "convex/react";
import { Toaster } from "sonner";
import { getRequiredPublicConvexUrl } from "@/lib/env";
import { api } from "@convex/_generated/api";

const convex = new ConvexReactClient(getRequiredPublicConvexUrl());

type CurrentUserSyncContextValue = {
  status: "idle" | "syncing" | "error";
  message: string | null;
  retrySync: () => void;
};

const CurrentUserSyncContext = createContext<CurrentUserSyncContextValue>({
  status: "idle",
  message: null,
  retrySync: () => {},
});

function CurrentUserSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const ensureCurrentUser = useMutation(api.users.ensureCurrentUser);
  const seedGlossaryIfEmpty = useMutation(api.glossary.seedIfEmpty);
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const syncedUserId = useRef<string | null>(null);
  const [syncError, setSyncError] = useState<{
    userId: string;
    message: string;
  } | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const message =
    isSignedIn && user && syncError?.userId === user.id
      ? syncError.message
      : null;
  const status: CurrentUserSyncContextValue["status"] =
    !isLoaded || !isSignedIn || !user
      ? "idle"
      : message
        ? "error"
        : "syncing";

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !user) {
      syncedUserId.current = null;
      return;
    }

    if (syncedUserId.current === user.id) {
      return;
    }

    syncedUserId.current = user.id;

    void ensureCurrentUser({})
      .then(() => seedGlossaryIfEmpty({}))
      .then(() => {
        setSyncError((current) =>
          current?.userId === user.id ? null : current,
        );
      })
      .catch((error: unknown) => {
        syncedUserId.current = null;

        const nextMessage =
          error instanceof Error ? error.message : "Could not sync your account.";

        if (nextMessage.includes("is not provisioned for Paraluman access")) {
          void signOut({ redirectUrl: "/login?access=denied" });
          return;
        }

        setSyncError({
          userId: user.id,
          message: nextMessage,
        });
      });
  }, [
    ensureCurrentUser,
    isLoaded,
    isSignedIn,
    retryNonce,
    seedGlossaryIfEmpty,
    signOut,
    user,
  ]);

  return (
    <CurrentUserSyncContext.Provider
      value={{
        status,
        message,
        retrySync: () => {
          setSyncError(null);
          setRetryNonce((current) => current + 1);
        },
      }}
    >
      {children}
    </CurrentUserSyncContext.Provider>
  );
}

export function useCurrentUserSync() {
  return useContext(CurrentUserSyncContext);
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#73068e",
          colorText: "#18181b",
          colorBackground: "#fcfcfd",
          colorInputBackground: "#ffffff",
          colorInputText: "#18181b",
          borderRadius: "12px",
          fontFamily: "var(--font-sans)",
        },
      }}
      signInUrl="/login"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <CurrentUserSyncProvider>{children}</CurrentUserSyncProvider>
        <Toaster position="top-right" richColors />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
