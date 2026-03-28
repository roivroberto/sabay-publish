"use client";

import Link from "next/link";
import type { Doc } from "@convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAuditTimestamp, formatPublishedDate } from "@/lib/format";

function formatActionLabel(action: Doc<"audit_logs">["action"]) {
  switch (action) {
    case "article_created":
      return "Article created";
    case "article_updated":
      return "English source updated";
    case "translation_requested":
      return "Translation requested";
    case "translation_completed":
      return "Translation completed";
    case "translation_failed":
      return "Translation failed";
    case "qa_checks_completed":
      return "QA checks completed";
    case "editor_edit":
      return "Filipino draft edited";
    case "retranslation_requested":
      return "Re-translation requested";
    case "article_rejected":
      return "Returned to writer";
    case "article_approved":
      return "Approved for bilingual publish";
    case "article_published":
      return "English and Filipino pages published";
  }
}

function summarizeMetadata(metadata: Doc<"audit_logs">["metadata"]) {
  const details: string[] = [];

  if (typeof metadata.qaWarningsCount === "number") {
    details.push(
      `${metadata.qaWarningsCount} QA warning${metadata.qaWarningsCount === 1 ? "" : "s"}`,
    );
  }

  if (metadata.glossaryApplied !== undefined) {
    details.push(
      metadata.glossaryApplied ? "Glossary applied" : "Glossary not applied",
    );
  }

  if (metadata.mode === "retranslate") {
    details.push("Machine rerun from review");
  }

  if (metadata.locale) {
    details.push(`Locale: ${metadata.locale}`);
  }

  if (metadata.slug) {
    details.push(`Slug: /${metadata.slug}`);
  }

  if (metadata.rejectionReason) {
    details.push(`Editor note: ${metadata.rejectionReason}`);
  }

  if (metadata.error) {
    details.push(`Error: ${metadata.error}`);
  }

  return details;
}

export function WorkflowHistory({
  auditLogs,
  publication,
}: {
  auditLogs: Array<Doc<"audit_logs">>;
  publication?:
    | {
        approvedAt: number;
        publishedAt: number;
        enUrl: string;
        filUrl: string;
      }
    | null;
}) {
  return (
    <Card className="rounded-[2rem]">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Workflow history</CardTitle>
        <CardDescription>
          Translation events, editor actions, and publication milestones for this article.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {publication ? (
          <div className="rounded-[1.5rem] border border-primary/10 bg-primary/5 p-4">
            <p className="text-sm font-medium text-foreground">Published article pair</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Approved {formatAuditTimestamp(publication.approvedAt)}. Public publish date:{" "}
              {formatPublishedDate(publication.publishedAt)}.
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                href={publication.enUrl}
              >
                Open English article
              </Link>
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                href={publication.filUrl}
              >
                Open Filipino article
              </Link>
            </div>
          </div>
        ) : null}

        {auditLogs.length ? (
          <div className="flex flex-col gap-3">
            {auditLogs.map((entry) => {
              const details = summarizeMetadata(entry.metadata);

              return (
                <div
                  className="rounded-[1.5rem] border bg-muted/20 p-4"
                  key={entry._id}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-foreground">
                      {formatActionLabel(entry.action)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatAuditTimestamp(entry.timestamp)}
                    </p>
                  </div>
                  {details.length ? (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {details.join(" • ")}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Activity will appear here after the article enters the workflow.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
