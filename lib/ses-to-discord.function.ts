import { Logger } from "@aws-lambda-powertools/logger";
import { SESHandler, SESReceipt } from "aws-lambda";
import { mail2discordMessage } from "./libs/mail2discord";
import { S3 } from "@aws-sdk/client-s3";

const BUCKET_NAME = process.env.BUCKET_NAME!;
const WEBHOOK_URL = process.env.WEBHOOK_URL!;

const s3 = new S3();
const logger = new Logger();

const getDataFromS3 = (messageId: string) =>
  s3.getObject({ Bucket: BUCKET_NAME, Key: messageId });

const isSpam = (receipt: SESReceipt): boolean =>
  receipt.dkimVerdict.status === "FAIL" ||
  receipt.spamVerdict.status === "FAIL" ||
  receipt.spfVerdict.status === "FAIL" ||
  receipt.virusVerdict.status === "FAIL";

const postMessage = async (message: object) => {
  await fetch(WEBHOOK_URL, {
    method: "POST",
    body: JSON.stringify(message),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const checkEnvironment = (): void => {
  if (!BUCKET_NAME) {
    throw new Error("BUCKET_NAME not defined.");
  }

  if (!WEBHOOK_URL) {
    throw new Error("WEBHOOK_URL not defined.");
  }
};

export const handler: SESHandler = async (event) => {
  checkEnvironment();

  event.Records.forEach(async (record) => {
    if (isSpam(record.ses.receipt)) {
      logger.info(
        `Skip spam. Source: ${record.ses.mail.source}, Message-ID: ${record.ses.mail.messageId}`
      );
      return;
    }

    try {
      const data = await getDataFromS3(record.ses.mail.messageId);

      if (!data.Body) {
        logger.warn("Skip empty message.");
        return;
      }

      const mailSource = await data.Body.transformToString();
      const message = await mail2discordMessage(record.ses.mail, mailSource);
      await postMessage(message);
    } catch (ex) {
      logger.error("Cannot post message.", JSON.stringify(ex));
    }
  });
};
