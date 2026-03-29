"use client";

import type { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  RefreshCcw,
  SendHorizontal,
} from "lucide-react";
import { ProfileSyncCard } from "@/components/auth/profile-sync-card";
import { EditorialShell } from "@/components/editorial-shell";
import { StatusBadge } from "@/components/articles/status-badge";
import { shouldUsePublicMockTranslation } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

type QaWarning = {
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  field?: string;
};

export function ReviewClient({ articleId }: { articleId: Id<"articles"> }) {
  const router = useRouter();
  const shouldMockTranslation = shouldUsePublicMockTranslation();
  const { isLoaded, isSignedIn } = useAuth();
  const viewer = useQuery(api.users.viewer, {});
  const bundle = useQuery(
    api.articles.getReviewBundle,
    isLoaded && isSignedIn && viewer?.role === "editor"
      ? { articleId }
      : "skip",
  );
  const saveLocalizationEdits = useMutation(api.articles.saveLocalizationEdits);
  const requestRetranslation = useMutation(api.articles.requestRetranslation);
  const rejectArticle = useMutation(api.articles.rejectArticle);
  const approveAndPublish = useMutation(api.articles.approveAndPublish);
  const [translatedHeadline, setTranslatedHeadline] = useState("");
  const [translatedDeck, setTranslatedDeck] = useState("");
  const [translatedBody, setTranslatedBody] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);

  useEffect(() => {
    if (!bundle?.localization) {
      return;
    }

    setTranslatedHeadline(bundle.localization.translatedHeadline);
    setTranslatedDeck(bundle.localization.translatedDeck);
    setTranslatedBody(bundle.localization.translatedBody);
  }, [bundle]);

  async function handleSaveEdits() {
    try {
      setBusyAction("save");
      await saveLocalizationEdits({
        articleId,
        translatedHeadline,
        translatedDeck,
        translatedBody,
      });
      toast.success("Filipino edits saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save edits.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRetranslate() {
    try {
      setBusyAction("retranslate");
      const retranslationRequest = {
        articleId,
        ...(shouldMockTranslation ? { mockTranslation: true } : {}),
      };

      await requestRetranslation(retranslationRequest);
      toast.success("Re-translation requested. Refreshing the Filipino draft.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not re-translate.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleReject() {
    try {
      setBusyAction("reject");
      await rejectArticle({ articleId, note: rejectNote });
      toast.success("Article returned to the writer.");
      startTransition(() => {
        router.push("/editor/queue");
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reject the article.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handlePublish() {
    try {
      setBusyAction("publish");
      const result = await approveAndPublish({ articleId });
      toast.success("English and Filipino pages are now published.");
      startTransition(() => {
        router.push(result.filUrl);
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not publish the article.");
    } finally {
      setBusyAction(null);
    }
  }

  if (isLoaded && isSignedIn && viewer === null) {
    return (
      <EditorialShell
        description="Finalizing your Convex profile before opening review."
        title="Translation review"
      >
        <ProfileSyncCard
          description="Your Clerk account is signed in. We&apos;re finishing the Convex user record before opening review."
          title="Syncing your newsroom profile"
        />
      </EditorialShell>
    );
  }

  if (isLoaded && isSignedIn && viewer && viewer.role !== "editor") {
    return (
      <EditorialShell
        description="This review screen is restricted to editors."
        title="Translation review"
      >
        <Alert>
          <AlertTriangle data-icon="inline-start" />
          <AlertTitle>Editor access required</AlertTitle>
          <AlertDescription>
            Only editor accounts can review and publish translated articles.
          </AlertDescription>
        </Alert>
      </EditorialShell>
    );
  }

  if (bundle === undefined) {
    return (
      <EditorialShell
        description="Loading the side-by-side review workspace."
        title="Translation review"
      >
        <Card>
          <CardContent className="flex min-h-80 items-center justify-center">
            <LoaderCircle className="animate-spin text-primary" />
          </CardContent>
        </Card>
      </EditorialShell>
    );
  }

  if (bundle === null || !bundle.localization) {
    return (
      <EditorialShell
        description="This review screen is only available for editor-approved review access."
        title="Translation review"
      >
        <Alert>
          <AlertTriangle data-icon="inline-start" />
          <AlertTitle>Review unavailable</AlertTitle>
          <AlertDescription>
            The requested article is not ready for Filipino review yet.
          </AlertDescription>
        </Alert>
      </EditorialShell>
    );
  }

  const warnings = bundle.localization.qaWarnings;
  const isTranslating = bundle.article.status === "TRANSLATING";
  const disableReviewActions = busyAction !== null || isTranslating;

  return (
    <EditorialShell
      description="Editors compare the English source against the Filipino draft, resolve QA warnings, and then publish both language routes with one atomic action."
      title="Side-by-side translation review"
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.55fr]">
        <Card className="rounded-[2rem]">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="font-heading text-3xl">English source</CardTitle>
                <CardDescription>Read-only source of truth</CardDescription>
              </div>
              <StatusBadge status={bundle.article.status} />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <h2 className="font-heading text-4xl leading-tight">{bundle.article.headline}</h2>
            <p className="text-lg text-muted-foreground">{bundle.article.deck}</p>
            <ScrollArea className="h-[34rem] rounded-[1.5rem] border bg-muted/30 p-5">
              <div className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                {bundle.article.body}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-primary/10">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">Filipino draft</CardTitle>
            <CardDescription>
              Editable editor surface. Saving here marks the localization as human-edited.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Headline</span>
              <Textarea
                className="min-h-24"
                disabled={isTranslating}
                onChange={(event) => setTranslatedHeadline(event.target.value)}
                value={translatedHeadline}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Deck</span>
              <Textarea
                className="min-h-24"
                disabled={isTranslating}
                onChange={(event) => setTranslatedDeck(event.target.value)}
                value={translatedDeck}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Body</span>
              <Textarea
                className="min-h-[24rem] text-sm leading-7"
                disabled={isTranslating}
                onChange={(event) => setTranslatedBody(event.target.value)}
                value={translatedBody}
              />
            </label>
            <Button disabled={disableReviewActions} onClick={handleSaveEdits}>
              {busyAction === "save" ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
              Save Filipino edits
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          {bundle.article.translationError ? (
            <Alert className="border-destructive/20 bg-destructive/5">
              <AlertTriangle data-icon="inline-start" />
              <AlertTitle>Latest translation attempt failed</AlertTitle>
              <AlertDescription>{bundle.article.translationError}</AlertDescription>
            </Alert>
          ) : null}

          {isTranslating ? (
            <Alert className="border-primary/20 bg-primary/5">
              <LoaderCircle className="animate-spin" data-icon="inline-start" />
              <AlertTitle>Refreshing the Filipino draft</AlertTitle>
              <AlertDescription>
                Publish and edit actions are locked until the new translation
                finishes and the article returns to review.
              </AlertDescription>
            </Alert>
          ) : null}

          <Card className="sticky top-6 rounded-[2rem] border-primary/10 bg-white/95">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Publish bar</CardTitle>
              <CardDescription>
                One approval action publishes both locales together.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button disabled={disableReviewActions} onClick={handlePublish}>
                {busyAction === "publish" ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <CheckCircle2 data-icon="inline-start" />}
                Approve & Publish
              </Button>
              <Button
                disabled={disableReviewActions}
                onClick={handleRetranslate}
                variant="outline"
              >
                {busyAction === "retranslate" ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <RefreshCcw data-icon="inline-start" />}
                Re-translate
              </Button>
              <Dialog>
                <DialogTrigger
                  render={
                    <Button disabled={disableReviewActions} variant="secondary" />
                  }
                >
                  <SendHorizontal data-icon="inline-start" />
                  Reject & Return to Writer
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject & Return to Writer</DialogTitle>
                    <DialogDescription>
                      A note is required so the writer knows what to fix before translation is requested again.
                    </DialogDescription>
                  </DialogHeader>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Required editor note</span>
                    <Textarea
                      className="min-h-32"
                      onChange={(event) => setRejectNote(event.target.value)}
                      value={rejectNote}
                    />
                  </label>
                  <DialogFooter>
                    <Button
                      disabled={!rejectNote.trim() || disableReviewActions}
                      onClick={handleReject}
                      variant="secondary"
                    >
                      {busyAction === "reject" ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
                      Reject & Return to Writer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">QA warnings</CardTitle>
              <CardDescription>
                Deterministic checks for dates, numbers, glossary adherence, and leftover English.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {warnings.length ? (
                warnings.map((warning: QaWarning, index: number) => (
                  <Alert key={`${warning.type}-${index}`}>
                    <AlertTriangle data-icon="inline-start" />
                    <AlertTitle>{warning.message}</AlertTitle>
                    <AlertDescription>
                      Severity: {warning.severity}
                      {warning.field ? ` • Field: ${warning.field}` : ""}
                    </AlertDescription>
                  </Alert>
                ))
              ) : (
                <Alert>
                  <CheckCircle2 data-icon="inline-start" />
                  <AlertTitle>No QA warnings</AlertTitle>
                  <AlertDescription>
                    The Filipino draft passed the current deterministic checks.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </EditorialShell>
  );
}
