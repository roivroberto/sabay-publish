import type { Id } from "@convex/_generated/dataModel";
import { requireClerkUser } from "@/lib/clerk-guards";
import { ReviewClient } from "@/components/editor/review-client";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = await params;

  await requireClerkUser();
  return <ReviewClient articleId={articleId as Id<"articles">} />;
}
