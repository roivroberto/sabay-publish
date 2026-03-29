import { redirect } from "next/navigation";
import { ParalumanLogo } from "@/components/brand/paraluman-logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoginSignIn } from "@/components/auth/login-sign-in";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ rest?: string[] }>;
  searchParams: Promise<{ access?: string; mode?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const blockedSignUpRoutes = new Set(["create", "sign-up", "signup"]);

  if (resolvedParams.rest?.some((segment) => blockedSignUpRoutes.has(segment))) {
    redirect("/login?mode=signup-disabled");
  }

  const accessDenied = resolvedSearchParams.access === "denied";
  const signUpDisabled = resolvedSearchParams.mode === "signup-disabled";

  return (
    <main className="editorial-shell flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <div className="grid w-full max-w-6xl gap-10 overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/92 p-6 shadow-[0_30px_100px_rgba(30,21,37,0.16)] lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
        <section className="newsroom-grid flex flex-col justify-between rounded-[2rem] border bg-[rgba(115,6,142,0.03)] p-8">
          <div className="flex flex-col gap-5">
            <span className="section-kicker">Paraluman</span>
            <ParalumanLogo />
            <h1 className="font-heading text-5xl font-semibold leading-none text-[var(--brand-ink)]">
              Human-in-the-loop bilingual publishing.
            </h1>
            <p className="max-w-lg text-base leading-7 text-muted-foreground">
              Writers submit the English source, Google Cloud Translation drafts the Filipino
              version, and editors publish both language routes together only after review.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>Roles are assigned from Convex and public sign-up is expected to remain disabled in Clerk.</p>
            <p>Sign in with a provisioned writer or editor account to access the editorial workspace.</p>
          </div>
        </section>

        <section className="flex items-center justify-center rounded-[2rem] border bg-white p-4">
          <div className="flex w-full max-w-md flex-col gap-4">
            {accessDenied ? (
              <Alert className="border-destructive/20 bg-destructive/5">
                <AlertTitle>Access not provisioned</AlertTitle>
                <AlertDescription>
                  This Clerk account is not in the newsroom allowlist. Sign in with a
                  provisioned account or ask an editor to add you first.
                </AlertDescription>
              </Alert>
            ) : null}
            {signUpDisabled ? (
              <Alert>
                <AlertTitle>Public sign-up is disabled</AlertTitle>
                <AlertDescription>
                  Paraluman accounts are provisioned by the newsroom. Sign in with an
                  existing writer or editor account.
                </AlertDescription>
              </Alert>
            ) : null}
            <LoginSignIn />
          </div>
        </section>
      </div>
    </main>
  );
}
