import { S3 } from "@aws-sdk/client-s3";
import { promiseRetry } from "./promise-retry";

const s3 = new S3();

export const getMailBodyFromS3 = async (
  bucketName: string,
  messageId: string
): Promise<string> => {
  const data = await promiseRetry(
    () => s3.getObject({ Bucket: bucketName, Key: messageId }),
    { count: 3, delay: 8000 }
  );

  if (!data.Body) {
    throw new Error("Mail body is empty.");
  }

  return await data.Body.transformToString();
};
