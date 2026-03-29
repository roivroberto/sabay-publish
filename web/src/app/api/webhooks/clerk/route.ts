import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { fetchMutation } from "convex/nextjs";
import { api } from "@convex/_generated/api";

export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request, {
      signingSecret: process.env.CLERK_WEBHOOK_SECRET,
    });

    if (event.type !== "user.created" && event.type !== "user.updated") {
      return NextResponse.json({ ok: true });
    }

    const primaryEmail = event.data.email_addresses?.find(
      (entry) => entry.id === event.data.primary_email_address_id,
    )?.email_address;

    if (!primaryEmail) {
      return NextResponse.json(
        { error: "Primary email missing from Clerk webhook payload." },
        { status: 400 },
      );
    }

    const displayName =
      [event.data.first_name, event.data.last_name].filter(Boolean).join(" ") ||
      event.data.username ||
      primaryEmail;
    const signingSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!signingSecret) {
      return NextResponse.json(
        { error: "CLERK_WEBHOOK_SECRET is not configured." },
        { status: 500 },
      );
    }

    await fetchMutation(api.users.upsertFromWebhook, {
      sharedSecret: signingSecret,
      clerkId: event.data.id,
      email: primaryEmail,
      displayName,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook verification failed.",
      },
      { status: 400 },
    );
  }
}
