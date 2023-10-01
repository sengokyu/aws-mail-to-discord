import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export interface SesToDiscordParams {
  bucketName: string;
  webhookUrl: string;
}

/**
 * Lambda function definition
 */
export class SesToDiscord extends Construct {
  readonly handlerFunction: lambda.IFunction;

  constructor(scope: Construct, id: string, params: SesToDiscordParams) {
    super(scope, id);

    this.handlerFunction = new NodejsFunction(this, "function", {
      // the entry will be derived from filename and id
      description: "Function for posting received email to Discord.",
      environment: {
        Powertools_SERVICE_NAME: "sesToDiscord",
        LOG_LEVEL: "INFO",
        BUCKET_NAME: params.bucketName,
        WEBHOOK_URL: params.webhookUrl,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      runtime: lambda.Runtime.NODEJS_LATEST,
    });
  }
}
