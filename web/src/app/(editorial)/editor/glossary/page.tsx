"use client";

import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { ProfileSyncCard } from "@/components/auth/profile-sync-card";
import { EditorialShell } from "@/components/editorial-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function GlossaryPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const viewer = useQuery(api.users.viewer, {});
  const glossary = useQuery(
    api.glossary.list,
    isLoaded && isSignedIn && viewer?.role === "editor" ? {} : "skip",
  );

  if (isLoaded && isSignedIn && viewer === null) {
    return (
      <EditorialShell
        description="Finalizing your Convex profile before loading the glossary."
        title="Editorial glossary"
      >
        <ProfileSyncCard
          description="Your Clerk account is signed in. We&apos;re finishing the Convex user record before opening the glossary."
          title="Syncing your newsroom profile"
        />
      </EditorialShell>
    );
  }

  if (isLoaded && isSignedIn && viewer && viewer.role !== "editor") {
    return (
      <EditorialShell
        description="This screen is restricted to editors."
        title="Editorial glossary"
      >
        <Card className="rounded-[2rem] border-white/90 bg-white/92">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">
              Editor access required
            </CardTitle>
            <CardDescription>
              Only editor accounts can access glossary management.
            </CardDescription>
          </CardHeader>
        </Card>
      </EditorialShell>
    );
  }

  return (
    <EditorialShell
      description="The MVP glossary is read-only in the interface, but it powers both the editorial reference table and the Google Cloud Translation glossary payload."
      title="Editorial glossary"
    >
      <Card className="rounded-[2rem] border-white/90 bg-white/92">
        <CardHeader>
          <CardTitle className="font-heading text-3xl">Seed terminology</CardTitle>
          <CardDescription>
            These entries keep Paraluman’s key names, titles, and newsroom terms consistent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-[1.5rem] border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>English term</TableHead>
                  <TableHead>Filipino term</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {glossary?.map((term) => (
                  <TableRow key={term._id}>
                    <TableCell className="font-medium">{term.englishTerm}</TableCell>
                    <TableCell>{term.filipinoTerm}</TableCell>
                    <TableCell className="capitalize">{term.category.replaceAll("_", " ")}</TableCell>
                    <TableCell className="max-w-md text-sm text-muted-foreground">
                      {term.notes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </EditorialShell>
  );
}
