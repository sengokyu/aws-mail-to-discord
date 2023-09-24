import * as cdk from "aws-cdk-lib";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { SesToDiscord } from "./ses-to-discord";

export interface LambdaStackProps extends cdk.StackProps {
  bucketName: string;
  webhookUrl: string;
}

/**
 * Lambda function stack
 */
export class LambdaStack extends cdk.Stack {
  readonly handlerFunction: IFunction;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // Lambda function
    this.handlerFunction = new SesToDiscord(this, "function", {
      bucketName: props.bucketName,
      webhookUrl: props.webhookUrl,
    }).handlerFunction;
  }
}
