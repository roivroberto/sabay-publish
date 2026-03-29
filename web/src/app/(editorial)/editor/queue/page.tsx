"use client";

import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { ProfileSyncCard } from "@/components/auth/profile-sync-card";
import { EditorialShell } from "@/components/editorial-shell";
import { EditorQueueClient } from "@/components/editor/editor-queue-client";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditorQueuePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const viewer = useQuery(api.users.viewer, {});

  if (isLoaded && isSignedIn && viewer === null) {
    return (
      <EditorialShell
        description="Finalizing your newsroom profile before opening the editor queue."
        title="Editor review queue"
      >
        <ProfileSyncCard
          description="Your Clerk account is signed in. We&apos;re finishing the Convex user record before opening the review queue."
          title="Syncing your newsroom profile"
        />
      </EditorialShell>
    );
  }

  if (isLoaded && isSignedIn && viewer && viewer.role !== "editor") {
    return (
      <EditorialShell
        description="This screen is restricted to editors."
        title="Editor review queue"
      >
        <Card className="rounded-[2rem] border-white/90 bg-white/92">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">
              Editor access required
            </CardTitle>
            <CardDescription>
              Only editor accounts can open the review queue.
            </CardDescription>
          </CardHeader>
        </Card>
      </EditorialShell>
    );
  }

  return (
    <EditorialShell
      description="Every story in NEEDS_REVIEW appears here with its author and QA warning count so editors can triage quickly."
      title="Editor review queue"
    >
      <EditorQueueClient />
    </EditorialShell>
  );
}
