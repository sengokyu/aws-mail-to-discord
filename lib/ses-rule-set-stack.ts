import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { ReceiptRuleSet } from "aws-cdk-lib/aws-ses";
import * as actions from "aws-cdk-lib/aws-ses-actions";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  AwsSdkCall,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";

export class SesRuleSetStack extends cdk.Stack {
  private readonly ruleSet: ReceiptRuleSet;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SES rule set
    this.ruleSet = new ReceiptRuleSet(this, "RuleSet", {
      dropSpam: false,
      receiptRuleSetName: "default",
    });

    const awsSdkCall: AwsSdkCall = {
      service: "SES",
      action: "setActiveReceiptRuleSet",
      physicalResourceId: PhysicalResourceId.of("DefaultSesCustomResource"),
      parameters: {
        RuleSetName: this.ruleSet.receiptRuleSetName,
      },
    };

    // Activate rule set
    new AwsCustomResource(this, "ses_default_rule_set_custom_resource", {
      onCreate: awsSdkCall,
      onUpdate: awsSdkCall,
      logRetention: RetentionDays.ONE_WEEK,
      policy: AwsCustomResourcePolicy.fromStatements([
        new PolicyStatement({
          sid: "SesCustomResourceSetActiveReceiptRuleSet",
          effect: Effect.ALLOW,
          actions: ["ses:SetActiveReceiptRuleSet"],
          resources: ["*"],
        }),
      ]),
      timeout: Duration.seconds(30),
    });
  }

  /**
   *
   * @param domainName
   * @param s3bucket
   * @param lambdaFunction
   */
  addSesRule(
    domainName: string,
    s3bucket: IBucket,
    lambdaFunction: IFunction
  ): void {
    this.ruleSet.addRule(`Rule-${domainName}`, {
      enabled: true,
      receiptRuleName: `CatchAll-${domainName}`,
      recipients: [domainName, `.${domainName}`],
      actions: [
        // Store to S3 bucket
        new actions.S3({ bucket: s3bucket }),
        // Invoke lambda function
        new actions.Lambda({
          function: lambdaFunction,
          invocationType: actions.LambdaInvocationType.EVENT,
        }),
      ],
    });
  }
}
