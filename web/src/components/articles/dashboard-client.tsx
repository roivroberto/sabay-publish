"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { Plus, ArrowRight, Languages } from "lucide-react";
import { api } from "@convex/_generated/api";
import { ProfileSyncCard } from "@/components/auth/profile-sync-card";
import { EditorialShell } from "@/components/editorial-shell";
import { StatusBadge } from "@/components/articles/status-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function DashboardClient() {
  const { isLoaded, isSignedIn } = useAuth();
  const viewer = useQuery(api.users.viewer, {});
  const data = useQuery(
    api.articles.getDashboardData,
    isLoaded && (!isSignedIn || viewer) ? {} : "skip",
  );

  if (isLoaded && isSignedIn && viewer === null) {
    return (
      <EditorialShell
        description="Finalizing your Convex profile before loading the newsroom dashboard."
        title="Writer and editor dashboard"
      >
        <ProfileSyncCard
          description="Your Clerk account is signed in. We&apos;re finishing the Convex user record before loading your dashboard."
          title="Syncing your newsroom profile"
        />
      </EditorialShell>
    );
  }

  return (
    <EditorialShell
      description="Track every English draft, surface rejection notes, and move stories into bilingual review without leaving the newsroom workflow."
      title="Writer and editor dashboard"
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardDescription>Your role</CardDescription>
              <CardTitle className="font-heading text-3xl">
                {data?.viewer?.role ?? "Loading"}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardDescription>Your drafts and stories</CardDescription>
              <CardTitle className="font-heading text-3xl">
                {data?.ownArticles.length ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardDescription>Needs review now</CardDescription>
              <CardTitle className="font-heading text-3xl">
                {data?.reviewQueueCount ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="rounded-[2rem] border-white/90 bg-white/92">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="font-heading text-3xl">
                Your article pipeline
              </CardTitle>
              <CardDescription>
                Rejected stories return to draft with the latest editor note intact.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className={cn(buttonVariants(), "rounded-full")} href="/articles/new">
                <Plus data-icon="inline-start" />
                Create new article
              </Link>
              {data?.viewer?.role === "editor" ? (
                <Link
                  className={buttonVariants({ variant: "outline" })}
                  href="/editor/queue"
                >
                  <Languages className="mr-2" />
                  Open review queue
                </Link>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-[1.5rem] border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Headline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Editor note</TableHead>
                    <TableHead className="text-right">Open</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.ownArticles?.length ? (
                    data.ownArticles.map((article) => (
                      <TableRow key={article._id}>
                        <TableCell className="max-w-md align-top">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{article.headline}</span>
                            <span className="text-xs text-muted-foreground">
                              /{article.slug}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <StatusBadge status={article.status} />
                        </TableCell>
                        <TableCell className="capitalize align-top">
                          {article.category}
                        </TableCell>
                        <TableCell className="max-w-sm align-top text-sm text-muted-foreground">
                          {article.latestEditorNote ?? "No notes"}
                        </TableCell>
                        <TableCell className="text-right align-top">
                          <Link
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" }),
                              "rounded-full",
                            )}
                            href={`/articles/${article._id}`}
                          >
                            Open
                            <ArrowRight data-icon="inline-end" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="py-10 text-center text-muted-foreground" colSpan={5}>
                        No articles yet. Start with an English draft and move it into translation.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </EditorialShell>
  );
}
