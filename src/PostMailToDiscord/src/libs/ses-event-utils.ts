import { Logger } from "@aws-lambda-powertools/logger";
import { SESEventRecord, SESReceipt } from "aws-lambda";
import { postToDiscord } from "./discord-client";
import { mail2discordMessage } from "./mail2discord";
import { getMailBodyFromS3 } from "./s3-client";

const isSpam = (receipt: SESReceipt): boolean =>
  receipt.dkimVerdict.status === "FAIL" ||
  receipt.spamVerdict.status === "FAIL" ||
  receipt.spfVerdict.status === "FAIL" ||
  receipt.virusVerdict.status === "FAIL";

const logger = new Logger();

export const sesEventHandler = async (
  records: SESEventRecord[],
  config: { bucketName: string; webHookUrl: string }
) => {
  const tasks = records
    .filter((record) => {
      if (isSpam(record.ses.receipt)) {
        logger.info("Skip spam.", {
          source: record.ses.mail.source,
          messageId: record.ses.mail.messageId,
        });
        return false;
      } else {
        return true;
      }
    })
    .map(async (record) => {
      try {
        logger.debug("Try to get data from S3.", {
          bucketName: config.bucketName,
          messageId: record.ses.mail.messageId,
        });
        const mail = await getMailBodyFromS3(
          config.bucketName,
          record.ses.mail.messageId
        );

        logger.debug("Converting mail.", { mail });
        const message = await mail2discordMessage(record.ses.mail, mail);

        logger.debug("Try to post a message.", {
          webHookUrl: config.webHookUrl,
          message,
        });
        await postToDiscord(config.webHookUrl, message);
      } catch (err) {
        logger.error("Post message failed.", err as Error);
      }
    });

  await Promise.all(tasks);
};
