"use node";

import { formatPun } from "../../src/lib/pun-utils";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import DiscordLogger from "../discord";

export const notifyPunQueueStatus = internalAction({
  handler: async (ctx) => {
    if (process.env.CONVEX_ENV !== "production") return;

    const puns = await ctx.runQuery(internal.puns._getQueuedPuns);

    const logger = new DiscordLogger(
      process.env.DISCORD_MALTESE_BOT_TOKEN || "",
      process.env.DISCORD_INTAEK_ALERTS_CHANNEL_ID || "",
    );

    try {
      await logger.info(
        `${puns.length} 개 검수 대기중`,
        puns.length === 0
          ? undefined
          : puns.map((p) => formatPun(p.firstRow, p.secondRow)),
      );
    } catch (err) {
      console.error("Logger not ready:", err);
    }
  },
});
