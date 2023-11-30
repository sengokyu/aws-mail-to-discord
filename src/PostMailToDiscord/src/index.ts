import { LambdaInterface } from "@aws-lambda-powertools/commons";
import { Logger } from "@aws-lambda-powertools/logger";
import { SESEvent } from "aws-lambda";
import { postToDiscord } from "./libs/discord-client";
import { mail2discordMessage } from "./libs/mail2discord";
import { getMailBodyFromS3 } from "./libs/s3-client";
import { isSpam } from "./libs/ses-event-utils";

const BUCKET_NAME = process.env.BUCKET_NAME!;
const WEBHOOK_URL = process.env.WEBHOOK_URL!;

const logger = new Logger();

const checkEnvironment = (): void => {
  if (!BUCKET_NAME) {
    throw new Error("BUCKET_NAME not defined.");
  }

  if (!WEBHOOK_URL) {
    throw new Error("WEBHOOK_URL not defined.");
  }
};

class Lambda implements LambdaInterface {
  @logger.injectLambdaContext({ logEvent: true })
  public async handler(event: SESEvent, _context: unknown): Promise<void> {
    checkEnvironment();

    const tasks = event.Records.map(async (record) => {
      if (isSpam(record.ses.receipt)) {
        logger.info("Skip spam.", {
          source: record.ses.mail.source,
          messageId: record.ses.mail.messageId,
        });
        return;
      }

      try {
        const mailSource = await getMailBodyFromS3(
          BUCKET_NAME,
          record.ses.mail.messageId
        );

        if (!mailSource) {
          return;
        }

        const message = await mail2discordMessage(record.ses.mail, mailSource);

        logger.debug("Try to post a message.", { message });
        await postToDiscord(WEBHOOK_URL, message);
      } catch (ex) {
        logger.error("Cannot post message.", ex as Error);
      }
    });

    await Promise.all(tasks);
  }
}

const instance = new Lambda();
export const handler = instance.handler.bind(instance); // handlerメソッドのなかでthisを使えるようにする
