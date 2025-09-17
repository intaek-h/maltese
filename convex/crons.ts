import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "notify pun queues",
  "0 0,12 * * *",
  internal.actions.discord.notifyPunQueueStatus,
);

export default crons;
