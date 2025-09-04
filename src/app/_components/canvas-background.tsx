"use client";

import type { FunctionReturnType } from "convex/server";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { customToast } from "@/components/ui/lego-toast";
import { copyTextToClipboard } from "@/lib/clipboard-utils";
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

  useEffect(() => {
    if (!highlightedPun) return;

    if (toast.length) {
      toast.dismiss();
    }

    customToast({
      title: "⭐ 미리보기 화면입니다.",
      description: "제출하신 말장난은 검수가 끝난 뒤 정식 등록됩니다.",
      button: {
        label: "미리보기 종료",
        onClick: async () => {
          toast.dismiss();
          setShouldShowPunLoader(true);

          await new Promise<void>((r) => setTimeout(() => r(), 1000));

          router.push("/");
          setShouldShowPunLoader(false);
        },
      },
    });

    customToast({
      title: "링크를 저장하면 다시 방문할 수 있습니다.",
      button: {
        label: "링크 복사",
        onClick: async () => {
          await copyTextToClipboard(window.location.href);
          customToast({ title: "링크를 복사했습니다." });
        },
      },
    });

    return () => {
      toast.dismiss();
    };
  }, [highlightedPun, router, setShouldShowPunLoader]);

  return (
    <div
      className="relative h-screen w-screen bg-cover bg-center"
      style={{
        backgroundImage: `url(/backgrounds/2.jpg)`,
        boxShadow: highlightedPun
          ? "0 0 200px rgba(0,0,0,0.9) inset"
          : undefined,
      }}
    >
      {children}
    </div>
  );
}
