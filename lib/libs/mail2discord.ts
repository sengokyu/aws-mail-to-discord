import { EmbedBuilder } from "@discordjs/builders";
import { SESMail } from "aws-lambda";
import { createHash } from "crypto";
import { simpleParser } from "mailparser";

const sender2color = (sender?: string): number => {
  // Make number per sender
  const hash = createHash("md5");
  hash.update(sender ?? "");
  return parseInt("0x" + hash.digest("hex").substring(0, 6));
};

/**
 * Convert mail to Discord message
 * @param src
 * @returns
 */
export const mail2discordMessage = async (
  sesMail: SESMail,
  src: string
): Promise<object> => {
  const parsed = await simpleParser(src);
  const builder = new EmbedBuilder();

  const authorName = Array.isArray(sesMail.commonHeaders.from)
    ? sesMail.commonHeaders.from[0]
    : sesMail.commonHeaders.from;
  const timestamp = Date.parse(sesMail.commonHeaders.date);

  builder.setAuthor({ name: authorName ?? "Unknown" });
  builder.setColor(sender2color(authorName));
  builder.setDescription(parsed.text ?? null);
  if (!isNaN(timestamp)) {
    builder.setTimestamp(timestamp);
  }
  builder.setTitle(sesMail.commonHeaders.subject ?? "No title");

  return { embed: [builder.toJSON()] };
};
