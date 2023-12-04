import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import { NodejsFunctionWithPowertools } from "../construts/nodejs-function-with-powertools";
import path = require("path");

export interface LambdaStackProps extends cdk.StackProps {
  bucketName: string;
  webhookUrl: string;
}

/**
 * Lambda function stack
 */
export class LambdaStack extends cdk.Stack {
  readonly handlerFunction: lambda.IFunction;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    this.handlerFunction = new NodejsFunctionWithPowertools(this, id, {
      logLevel: "INFO",
      description: "Read email from S3 and post to discord.",
      entry: path.resolve("src/PostMailToDiscord/src/index.ts"),
      environment: {
        BUCKET_NAME: props.bucketName,
        WEBHOOK_URL: props.webhookUrl,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(15),
    });
  }
}
