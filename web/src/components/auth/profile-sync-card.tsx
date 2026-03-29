"use client";

import { AlertTriangle, LoaderCircle } from "lucide-react";
import { useCurrentUserSync } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ProfileSyncCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { status, message, retrySync } = useCurrentUserSync();

  if (status === "error") {
    return (
      <Card className="rounded-[2rem] border-white/90 bg-white/92">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-3xl">
            <AlertTriangle className="text-destructive" />
            Could not sync your newsroom profile
          </CardTitle>
          <CardDescription>{message ?? description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={retrySync} type="button" variant="outline">
            Retry sync
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[2rem] border-white/90 bg-white/92">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-3xl">
          <LoaderCircle className="animate-spin text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
