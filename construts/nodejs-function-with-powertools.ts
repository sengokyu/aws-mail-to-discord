import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";

export interface NodejsFunctionWithPowertoolsProps extends NodejsFunctionProps {
  readonly logLevel: "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";
}

/**
 * Nodejs function with Powertools
 */
export class NodejsFunctionWithPowertools extends NodejsFunction {
  constructor(
    scope: Construct,
    id: string,
    props: NodejsFunctionWithPowertoolsProps
  ) {
    super(scope, id, {
      ...props,
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
      environment: {
        ...props.environment,
        AWS_LAMBDA_LOG_LEVEL: props.logLevel,
        POWERTOOLS_SERVICE_NAME: id,
        POWERTOOLS_LOG_LEVEL: props.logLevel,
        POWERTOOLS_LOGGER_LOG_EVENT: "true",
        POWERTOOLS_LOGGER_SAMPLE_RATE: "0",
      },
    });

    this.addLayers(this.createPowertoolsLayer());
  }

  private createPowertoolsLayer(): lambda.ILayerVersion {
    // Create a Layer with Powertools for AWS Lambda (TypeScript)
    // See https://docs.powertools.aws.dev/lambda/typescript/latest/
    return lambda.LayerVersion.fromLayerVersionArn(
      this,
      "PowertoolsLayer",
      `arn:aws:lambda:${
        cdk.Stack.of(this).region
      }:094274105915:layer:AWSLambdaPowertoolsTypeScript:25`
    );
  }
}
