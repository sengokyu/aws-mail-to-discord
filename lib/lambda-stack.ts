import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { LambdaWithPowertools } from "../construts/lambda-with-powertools";
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

    // Lambda function
    const lambda = new LambdaWithPowertools(this, "function", {
      description: "Read email from S3 and post to discord.",
      entry: path.resolve("src/PostMailToDiscord/src/index.ts"),
      environment: {
        BUCKET_NAME: props.bucketName,
        WEBHOOK_URL: props.webhookUrl,
      },
      functionName: "PostMailToDiscord",
    });

    this.handlerFunction = lambda.handlerFunction;
  }
}
