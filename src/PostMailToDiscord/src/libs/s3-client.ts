import { Logger } from "@aws-lambda-powertools/logger";
import { S3 } from "@aws-sdk/client-s3";

const logger = new Logger();
const s3 = new S3();

export const getMailBodyFromS3 = async (
  bucketName: string,
  messageId: string
): Promise<string | undefined> => {
  logger.debug("Try to get data from S3.", { bucketName, messageId });

  const data = await s3.getObject({ Bucket: bucketName, Key: messageId });

  if (!data.Body) {
    logger.warn("Mail body is empty.", { messageId });
    return;
  }

  return await data.Body.transformToString();
};
