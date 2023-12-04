import { LambdaInterface } from "@aws-lambda-powertools/commons";
import { Logger } from "@aws-lambda-powertools/logger";
import { SESEvent } from "aws-lambda";
import { sesEventHandler } from "./libs/ses-event-utils";

const checkEnvironment = (): void => {
  if (!process.env.BUCKET_NAME) {
    throw new Error("BUCKET_NAME not defined.");
  }

  if (!process.env.WEBHOOK_URL) {
    throw new Error("WEBHOOK_URL not defined.");
  }
};

checkEnvironment();

const logger = new Logger();
const config = {
  bucketName: process.env.BUCKET_NAME!,
  webHookUrl: process.env.WEBHOOK_URL!,
};

class Lambda implements LambdaInterface {
  @logger.injectLambdaContext({ logEvent: true })
  public handler(event: SESEvent, _context: unknown): Promise<void> {
    return sesEventHandler(event.Records, config);
  }
}

const instance = new Lambda();
export const handler = instance.handler.bind(instance); // handlerメソッドのなかでthisを使えるようにする
