import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export interface LambdaWithPowertoolsProps {
  readonly description: string;
  readonly entry: string;
  readonly environment: {
    BUCKET_NAME: string;
    WEBHOOK_URL: string;
  } & NodejsFunction["environment"];
  readonly functionName: string;
}

/**
 * Lambda function definition
 */
export class LambdaWithPowertools extends Construct {
  readonly handlerFunction: lambda.IFunction;

  constructor(scope: Construct, id: string, props: LambdaWithPowertoolsProps) {
    super(scope, id);

    // Create a Layer with Powertools for AWS Lambda (TypeScript)
    // See https://docs.powertools.aws.dev/lambda/typescript/latest/
    const powertoolsLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "PowertoolsLayer",
      `arn:aws:lambda:${
        cdk.Stack.of(this).region
      }:094274105915:layer:AWSLambdaPowertoolsTypeScript:25`
    );

    this.handlerFunction = new NodejsFunction(this, props.functionName, {
      description: props.description,
      entry: props.entry,
      environment: {
        ...props.environment,
        AWS_LAMBDA_LOG_LEVEL: "DEBUG",
        POWERTOOLS_SERVICE_NAME: props.functionName,
        POWERTOOLS_LOG_LEVEL: "DEBUG",
        POWERTOOLS_LOGGER_LOG_EVENT: "true",
        POWERTOOLS_LOGGER_SAMPLE_RATE: "0",
      },
      layers: [powertoolsLayer],
      logRetention: logs.RetentionDays.ONE_WEEK,
      runtime: lambda.Runtime.NODEJS_20_X,
      bundling: {
        // Exclude aws lambda powertools from a bundle
        externalModules: [
          "@aws-lambda-powertools/commons",
          "@aws-lambda-powertools/logger",
          "@aws-lambda-powertools/metrics",
          "@aws-lambda-powertools/tracer",
        ],
        minify: true,
        sourcesContent: false,
      },
      allowPublicSubnet: true,
    });
  }
}
