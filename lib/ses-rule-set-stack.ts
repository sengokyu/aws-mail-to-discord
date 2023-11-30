import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ses from "aws-cdk-lib/aws-ses";
import * as actions from "aws-cdk-lib/aws-ses-actions";
import { Construct } from "constructs";

interface SesRuleSetStackProps extends cdk.StackProps {
  dropSpam: boolean;
  ruleSetName: string;
}

export class SesRuleSetStack extends cdk.Stack {
  private readonly ruleSet: ses.ReceiptRuleSet;

  constructor(scope: Construct, id: string, props: SesRuleSetStackProps) {
    super(scope, id, props);

    // SES rule set
    this.ruleSet = new ses.ReceiptRuleSet(this, "ReceiptRuleSet", {
      dropSpam: props.dropSpam,
      receiptRuleSetName: props.ruleSetName,
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
    s3bucket: s3.IBucket,
    lambdaFunction: lambda.IFunction
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
