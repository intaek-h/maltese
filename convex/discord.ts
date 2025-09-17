"use node";

import { Client, GatewayIntentBits, type TextBasedChannel } from "discord.js";

type LogLevel = "error" | "warn" | "info" | "debug" | "success";

class DiscordLogger {
  private client: Client;
  private channelId: string;
  private ready: Promise<void>;

  constructor(token: string, channelId: string) {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });
    this.channelId = channelId;

    this.ready = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error("Discord client failed to get ready within 3 seconds"),
        );
      }, 3000);

      this.client.once("ready", () => {
        clearTimeout(timeout);
        console.log(`Discord bot logged in as ${this.client.user?.tag}`);
        resolve();
      });
    });

    void this.client.login(token);
  }

  async log(
    level: LogLevel,
    message: string,
    data: unknown = null,
  ): Promise<void> {
    await this.ready;

    try {
      const channel = await this.client.channels.fetch(this.channelId);
      if (!channel || !("isTextBased" in channel) || !channel.isTextBased()) {
        throw new Error(
          "Configured channel is not text-based or could not be fetched",
        );
      }

      const emoji = this.getLevelEmoji(level);

      let logMessage = `${emoji} ${message}`;

      if (data !== null && data !== undefined) {
        logMessage += `\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
      }

      if (logMessage.length > 2000) {
        logMessage = logMessage.substring(0, 1997) + "...";
      }

      if (!("send" in channel)) {
        throw new Error("Channel does not support sending messages");
      }

      await channel.send(logMessage);
    } catch (error) {
      console.error("Failed to send Discord log:", error);
    }
  }

  getLevelEmoji(level: LogLevel | string): string {
    const emojis: Record<LogLevel, string> = {
      error: "❌",
      warn: "⚠️",
      info: "◽",
      debug: "🔧",
      success: "✅",
    };
    const normalized = level.toLowerCase() as LogLevel;
    return emojis[normalized] ?? "📝";
  }

  error(message: string, data?: unknown): Promise<void> {
    return this.log("error", message, data);
  }
  warn(message: string, data?: unknown): Promise<void> {
    return this.log("warn", message, data);
  }
  info(message: string, data?: unknown): Promise<void> {
    return this.log("info", message, data);
  }
  debug(message: string, data?: unknown): Promise<void> {
    return this.log("debug", message, data);
  }
  success(message: string, data?: unknown): Promise<void> {
    return this.log("success", message, data);
  }
}

export default DiscordLogger;
