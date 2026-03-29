import Image from "next/image";
import Link from "next/link";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import { ParalumanLogo } from "@/components/brand/paraluman-logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FILIPINO_DISCLOSURE, type AppLocale } from "@/lib/constants";
import { formatPublishedDate } from "@/lib/format";
import { canUseOptimizedImage } from "@/lib/image-hosts";

type PublishedArticle = NonNullable<
  FunctionReturnType<typeof api.public.getPublishedArticle>
>;

export function PublicArticleLayout({
  article,
  locale,
}: {
  article: PublishedArticle;
  locale: AppLocale;
}) {
  const canOptimizeHeroImage = canUseOptimizedImage(article.heroImageUrl);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-white/92">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="section-kicker">Paraluman Newsroom</span>
            <ParalumanLogo href={`/${locale}/articles/${article.slug}`} />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Link href={article.alternatePaths.en}>
              <Badge variant={locale === "en" ? "default" : "outline"}>English</Badge>
            </Link>
            <Link href={article.alternatePaths.fil}>
              <Badge variant={locale === "fil" ? "default" : "outline"}>Filipino</Badge>
            </Link>
          </div>
        </div>
      </header>

      <article className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-5">
            <span className="section-kicker">{article.category}</span>
            <h1 className="font-heading text-5xl font-semibold leading-none text-[var(--brand-ink)] sm:text-6xl">
              {article.headline}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              {article.deck}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>By {article.byline}</span>
              <span>{formatPublishedDate(article.publishedAt)}</span>
            </div>
          </div>
          <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] border bg-muted">
            {canOptimizeHeroImage ? (
              <Image
                alt={article.heroImageAlt}
                className="object-cover"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                src={article.heroImageUrl}
              />
            ) : (
              // Fall back to a plain image when editors publish a remote host
              // outside the optimization allowlist so the article still renders.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={article.heroImageAlt}
                className="h-full w-full object-cover"
                loading="eager"
                src={article.heroImageUrl}
              />
            )}
          </div>
        </section>

        <p className="max-w-3xl text-sm text-muted-foreground">{article.heroImageCaption}</p>

        {locale === "fil" ? (
          <Alert className="max-w-3xl border-primary/20 bg-primary/5">
            <AlertTitle>AI-assisted translation disclosure</AlertTitle>
            <AlertDescription>{FILIPINO_DISCLOSURE}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
          <div className="whitespace-pre-wrap font-serif text-lg leading-9 text-[var(--brand-ink)]">
            {article.body}
          </div>
          <aside className="flex flex-col gap-4 rounded-[2rem] border bg-white/92 p-5">
            <span className="section-kicker">Article Pair</span>
            <p className="text-sm text-muted-foreground">
              English and Filipino versions share the same publish timestamp and slug.
            </p>
            <Link className="text-sm font-medium text-primary underline-offset-4 hover:underline" href={article.alternatePaths.en}>
              Read the English version
            </Link>
            <Link className="text-sm font-medium text-primary underline-offset-4 hover:underline" href={article.alternatePaths.fil}>
              Read the Filipino version
            </Link>
          </aside>
        </div>
      </article>
    </main>
  );
}
