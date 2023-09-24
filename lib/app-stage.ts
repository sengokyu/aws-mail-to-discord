import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaStack } from "./lambda-stack";
import { S3BucketStack } from "./s3bucket-stack";
import { sanitizeId } from "./libs/sanitize-id";
import { SesRuleSetStack } from "./ses-rule-set-stack";

export interface AppStageProps extends cdk.StageProps {
  webhookUrl: string;
  recipientDomainNames: string[];
}

/**
 * App Stage
 */
export class AppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: AppStageProps) {
    super(scope, id, props);

    // SES Rule stack
    const sesRuleSetStack = new SesRuleSetStack(this, "SesRuleSetStack", props);

    // Mixing up
    props.recipientDomainNames.forEach((domainName) => {
      const idPostfix = sanitizeId(domainName);

      // S3 Bucket stacks
      const s3BucketStack = new S3BucketStack(
        this,
        `S3BucketStack-${idPostfix}`,
        {
          ...props,
          bucketName: `inbox.${domainName}`,
        }
      );

      // Lambda stack
      const lambdaStack = new LambdaStack(this, `LambdaStack-${idPostfix}`, {
        ...props,
        bucketName: s3BucketStack.bucket.bucketName,
      });

      s3BucketStack.grantAccessFor(lambdaStack.handlerFunction);

      sesRuleSetStack.addSesRule(
        domainName,
        s3BucketStack.bucket,
        lambdaStack.handlerFunction
      );

      // Setup dependency
      sesRuleSetStack.addDependency(s3BucketStack);
      sesRuleSetStack.addDependency(lambdaStack);
    });
  }
}
