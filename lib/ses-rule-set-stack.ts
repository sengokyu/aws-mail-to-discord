import * as cdk from "aws-cdk-lib";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { ReceiptRuleSet } from "aws-cdk-lib/aws-ses";
import * as actions from "aws-cdk-lib/aws-ses-actions";
import { Construct } from "constructs";

interface SesRuleSetStackProps extends cdk.StackProps {
  dropSpam: boolean;
  ruleSetName: string;
}

export class SesRuleSetStack extends cdk.Stack {
  private readonly ruleSet: ReceiptRuleSet;

  constructor(scope: Construct, id: string, props: SesRuleSetStackProps) {
    super(scope, id, props);

    // SES rule set
    this.ruleSet = new ReceiptRuleSet(this, "ReceiptRuleSet", {
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
