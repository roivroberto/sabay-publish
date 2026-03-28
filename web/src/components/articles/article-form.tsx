"use client";

import type { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, LoaderCircle, Sparkles } from "lucide-react";
import { ARTICLE_CATEGORIES } from "@/lib/constants";
import { slugifyHeadline } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/articles/status-badge";
import { WorkflowHistory } from "@/components/articles/workflow-history";
import { cn } from "@/lib/utils";

type FormState = {
  headline: string;
  deck: string;
  slug: string;
  byline: string;
  category: (typeof ARTICLE_CATEGORIES)[number];
  heroImageUrl: string;
  heroImageCaption: string;
  heroImageAlt: string;
  body: string;
};

const emptyState: FormState = {
  headline: "",
  deck: "",
  slug: "",
  byline: "",
  category: "news",
  heroImageUrl: "",
  heroImageCaption: "",
  heroImageAlt: "",
  body: "",
};

export function ArticleForm({ articleId }: { articleId?: Id<"articles"> }) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoading: isConvexAuthLoading, isAuthenticated: isConvexAuthenticated } =
    useConvexAuth();
  const bundle = useQuery(
    api.articles.getArticleBundle,
    articleId && isLoaded && isSignedIn && !isConvexAuthLoading && isConvexAuthenticated
      ? { articleId }
      : "skip",
  );
  const createArticle = useMutation(api.articles.createArticle);
  const updateArticle = useMutation(api.articles.updateArticle);
  const submitForTranslation = useMutation(api.articles.submitForTranslation);
  const [form, setForm] = useState<FormState>(emptyState);
  const [isSaving, setIsSaving] = useState(false);
  const [manualSlug, setManualSlug] = useState(false);
  const deferredHeadline = useDeferredValue(form.headline);

  useEffect(() => {
    if (!bundle?.article) {
      return;
    }

    setForm({
      headline: bundle.article.headline,
      deck: bundle.article.deck,
      slug: bundle.article.slug,
      byline: bundle.article.byline,
      category: bundle.article.category,
      heroImageUrl: bundle.article.heroImageUrl,
      heroImageCaption: bundle.article.heroImageCaption,
      heroImageAlt: bundle.article.heroImageAlt,
      body: bundle.article.body,
    });
    setManualSlug(true);
  }, [bundle]);

  useEffect(() => {
    if (manualSlug) {
      return;
    }

    setForm((current) => ({
      ...current,
      slug: slugifyHeadline(deferredHeadline),
    }));
  }, [deferredHeadline, manualSlug]);

  const currentStatus = bundle?.article?.status ?? "DRAFT";
  const isReadOnly = Boolean(articleId && currentStatus !== "DRAFT");
  const disableFormControls = isSaving || isReadOnly;

  async function persistArticle(mode: "draft" | "translate") {
    try {
      setIsSaving(true);

      const targetArticleId = articleId
        ? await updateArticle({
            articleId,
            ...form,
          })
        : await createArticle(form);

      if (mode === "translate") {
        await submitForTranslation({ articleId: targetArticleId });
        toast.success("Translation requested. The Filipino draft is now generating.");
      } else {
        toast.success(articleId ? "Draft updated." : "Draft created.");
      }

      startTransition(() => {
        router.replace(`/articles/${targetArticleId}`);
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save the article.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (articleId && (!isLoaded || isConvexAuthLoading || bundle === undefined)) {
    return (
      <Card>
        <CardContent className="flex min-h-72 items-center justify-center">
          <LoaderCircle className="animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (articleId && bundle === null) {
    return (
      <Alert>
        <AlertCircle data-icon="inline-start" />
        <AlertTitle>Article unavailable</AlertTitle>
        <AlertDescription>
          This article could not be loaded with your current permissions.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="rounded-[2rem] border-white/90 bg-white/92">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-2">
              <CardTitle className="font-heading text-3xl">
                {articleId ? "Edit English source article" : "Start a new English draft"}
              </CardTitle>
              <CardDescription>
                The article body stays plain text for the MVP. Translation is only generated
                for the headline, deck, and body.
              </CardDescription>
            </div>
            <StatusBadge status={currentStatus} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Headline</span>
              <Input
                disabled={disableFormControls}
                onChange={(event) =>
                  setForm((current) => ({ ...current, headline: event.target.value }))
                }
                placeholder="Student voters turn out in record numbers"
                value={form.headline}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Slug</span>
              <Input
                disabled={disableFormControls}
                onChange={(event) => {
                  setManualSlug(true);
                  setForm((current) => ({ ...current, slug: slugifyHeadline(event.target.value) }));
                }}
                placeholder="student-voters-turn-out-in-record-numbers"
                value={form.slug}
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Deck</span>
            <Textarea
              className="min-h-24"
              disabled={disableFormControls}
              onChange={(event) =>
                setForm((current) => ({ ...current, deck: event.target.value }))
              }
              placeholder="A quick standfirst that frames the story and its urgency."
              value={form.deck}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Byline</span>
              <Input
                disabled={disableFormControls}
                onChange={(event) =>
                  setForm((current) => ({ ...current, byline: event.target.value }))
                }
                placeholder="Ana Reyes"
                value={form.byline}
              />
            </label>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Category</span>
              <Select
                disabled={disableFormControls}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    category: value as FormState["category"],
                  }))
                }
                value={form.category}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a desk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ARTICLE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-sm font-medium">Hero image URL</span>
              <Input
                disabled={disableFormControls}
                onChange={(event) =>
                  setForm((current) => ({ ...current, heroImageUrl: event.target.value }))
                }
                placeholder="https://images.example.com/story.jpg"
                value={form.heroImageUrl}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Hero caption</span>
              <Textarea
                className="min-h-24"
                disabled={disableFormControls}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    heroImageCaption: event.target.value,
                  }))
                }
                value={form.heroImageCaption}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Hero alt text</span>
              <Textarea
                className="min-h-24"
                disabled={disableFormControls}
                onChange={(event) =>
                  setForm((current) => ({ ...current, heroImageAlt: event.target.value }))
                }
                value={form.heroImageAlt}
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Body</span>
            <Textarea
              className="min-h-[24rem] text-sm leading-7"
              disabled={disableFormControls}
              onChange={(event) =>
                setForm((current) => ({ ...current, body: event.target.value }))
              }
              placeholder="Paste the English article body here. Paragraph breaks are preserved."
              value={form.body}
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <Button disabled={disableFormControls} onClick={() => persistArticle("draft")}>
              {isSaving ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
              Save Draft
            </Button>
            <Button
              className="shadow-[0_16px_40px_rgba(115,6,142,0.18)]"
              disabled={disableFormControls}
              onClick={() => persistArticle("translate")}
              variant="secondary"
            >
              <Sparkles data-icon="inline-start" />
              Submit for Translation
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        {isReadOnly ? (
          <Alert className="border-primary/20 bg-primary/5">
            <AlertCircle data-icon="inline-start" />
            <AlertTitle>Editing is locked</AlertTitle>
            <AlertDescription>
              This article is currently in <strong>{currentStatus}</strong>. English source
              edits are only allowed while the article is in draft.
            </AlertDescription>
          </Alert>
        ) : null}

        {bundle?.article?.translationError ? (
          <Alert className="border-destructive/20 bg-destructive/5">
            <AlertCircle data-icon="inline-start" />
            <AlertTitle>Translation failed</AlertTitle>
            <AlertDescription>{bundle.article.translationError}</AlertDescription>
          </Alert>
        ) : null}

        {bundle?.article?.latestEditorNote ? (
          <Alert className="border-primary/20 bg-primary/5">
            <AlertCircle data-icon="inline-start" />
            <AlertTitle>Latest editor note</AlertTitle>
            <AlertDescription>{bundle.article.latestEditorNote}</AlertDescription>
          </Alert>
        ) : null}

        <Card className="rounded-[2rem]">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Workflow notes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
            <p>
              Save early while you shape the English source. Slug collisions are resolved
              server-side, so the final URL may gain a numeric suffix when another draft already
              owns the same slug.
            </p>
            <p>
              Submit for translation only when the headline, deck, body, byline, and hero
              metadata are complete. Google Cloud Translation only touches the headline, deck,
              and body in this MVP.
            </p>
            <div
              className={cn(
                "rounded-[1.5rem] border border-primary/10 bg-muted/60 p-4",
              )}
            >
              <p className="font-medium text-foreground">Current Filipino readiness</p>
              <p className="mt-2 text-sm">
                {bundle?.localization
                  ? "A Filipino draft exists and can now move through review."
                  : "No Filipino draft exists yet for this article."}
              </p>
            </div>
          </CardContent>
        </Card>

        {articleId && bundle ? (
          <WorkflowHistory
            auditLogs={bundle.auditLogs}
            publication={bundle.publication}
          />
        ) : null}
      </div>
    </div>
  );
}
