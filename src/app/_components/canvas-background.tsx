"use client";

import type { FunctionReturnType } from "convex/server";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";
import { customToast } from "@/components/ui/lego-toast";
import { shouldShowPunLoader as shouldShowPunLoaderAtom } from "@/store/pun";
import type { api } from "../../../convex/_generated/api";

export function CanvasBackground({
  highlightedPun,
  children,
}: {
  highlightedPun: FunctionReturnType<typeof api.puns.getPunByPubKey> | null;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [_, setShouldShowPunLoader] = useAtom(shouldShowPunLoaderAtom);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isPending) {
      setShouldShowPunLoader(true);
    } else {
      setShouldShowPunLoader(false);
    }
  }, [isPending, setShouldShowPunLoader]);

  useEffect(() => {
    if (!highlightedPun) return;

    if (toast.length) {
      toast.dismiss();
    }

    const timerId_2 = setTimeout(() => {
      customToast({
        title: "⭐ 미리보기 화면입니다.",
        description: "제출하신 말장난은 검수가 끝난 뒤 등록됩니다.",
        button: {
          label: "미리보기 종료",
          onClick: async () => {
            startTransition(async () => {
              toast.dismiss();

              await new Promise<void>((r) => setTimeout(() => r(), 1000));

              router.push("/");
            });
          },
        },
      });
    }, 100);

    return () => {
      toast.dismiss();
      clearTimeout(timerId_2);
    };
  }, [highlightedPun, router]);

  // Ensure loader overlay never persists after back/forward or tab restore
  useEffect(() => {
    function hideLoader() {
      setShouldShowPunLoader(false);
    }
    function handleVisibility() {
      if (document.visibilityState === "visible") hideLoader();
    }
    window.addEventListener("pageshow", hideLoader);
    document.addEventListener("visibilitychange", handleVisibility);
    // Run once on mount as a safety
    hideLoader();
    return () => {
      window.removeEventListener("pageshow", hideLoader);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [setShouldShowPunLoader]);

  return (
    <div
      className="relative h-screen w-screen bg-cover bg-center"
      style={{
        backgroundImage: `url(/backgrounds/2.jpg)`,
      }}
    >
      {children}
    </div>
  );
}
