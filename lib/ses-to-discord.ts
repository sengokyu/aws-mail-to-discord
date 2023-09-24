import { IFunction } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export interface SesToDiscordParams {
  bucketName: string;
  webhookUrl: string;
}

/**
 * Lambda function definition
 */
export class SesToDiscord extends Construct {
  readonly handlerFunction: IFunction;

  constructor(scope: Construct, id: string, params: SesToDiscordParams) {
    super(scope, id);

    this.handlerFunction = new NodejsFunction(this, "function", {
      // the entry will be derived from filename and id
      environment: {
        Powertools_SERVICE_NAME: "sesToDiscord",
        LOG_LEVEL: "INFO",
        BUCKET_NAME: params.bucketName,
        WEBHOOK_URL: params.webhookUrl,
      },
      logRetention: RetentionDays.ONE_WEEK,
    });
  }
}
