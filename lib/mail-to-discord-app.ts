import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaStack } from "./lambda-stack";
import { S3BucketStack } from "./s3bucket-stack";
import { sanitizeId } from "./libs/sanitize-id";
import { SesRuleSetStack } from "./ses-rule-set-stack";
import * as iam from "aws-cdk-lib/aws-iam";

export interface MailToDiscordAppProps extends cdk.StageProps {
  webhookUrl: string;
  recipientDomainNames: string[];
}

/**
 * App Stage
 */
export class MailToDiscordApp extends cdk.Stage {
  constructor(scope: Construct, id: string, props: MailToDiscordAppProps) {
    super(scope, id, props);

    // SES Rule stack
    const sesRuleSetStack = new SesRuleSetStack(this, "SesRuleSetStack", {
      ...props,
      dropSpam: false,
      ruleSetName: "default",
    });

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

      // Setup SES rule
      sesRuleSetStack.addSesRule(
        domainName,
        s3BucketStack.bucket,
        lambdaStack.handlerFunction
      );

      // Setup permission
      const sesPrincipal = new iam.ServicePrincipal("ses.amazonaws.com", {
        conditions: {
          StringEquals: { "aws:SourceAccount": this.account },
        },
      });
      s3BucketStack.bucket.grantRead(lambdaStack.handlerFunction);
      s3BucketStack.bucket.grantDelete(lambdaStack.handlerFunction);
      s3BucketStack.bucket.grantPut(sesPrincipal);
      lambdaStack.handlerFunction.grantInvoke(sesPrincipal);

      // Setup stack dependency
      sesRuleSetStack.addDependency(s3BucketStack);
      sesRuleSetStack.addDependency(lambdaStack);
    });
  }
}
