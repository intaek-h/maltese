"use client";

import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import type { PunStatusType } from "../../../../../../convex/types/pun";

export function Action({ id }: { id: Id<"puns"> }) {
  const mutate = useMutation(api.puns.changePunStatus);

  async function changePunStatus({
    punId,
    status,
  }: {
    status: PunStatusType;
    punId: Id<"puns">;
  }) {
    const res = await mutate({
      punId,
      status,
    });

    if (!res.success) {
      alert("실패했습니다");
    }
  }

  return (
    <div className="flex gap-2 items-center justify-end">
      <Button
        onClick={() => changePunStatus({ punId: id, status: "hidden" })}
        variant="outline"
        size="sm"
      >
        가리기
      </Button>
      <Button
        onClick={() => changePunStatus({ punId: id, status: "visible" })}
        variant="default"
        size="sm"
      >
        확인
      </Button>
    </div>
  );
}
