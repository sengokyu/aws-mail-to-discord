import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { SesRuleSetStack } from "../../lib/ses-rule-set-stack";

describe("SesToDiscord", () => {
  it("create a lambda function", () => {
    // Given
    const app = new cdk.App();
    const webhookUrl = "https://webhook.example.com/";

    // When
    const instance = new SesRuleSetStack(app, "SesToDiscord", {
      dropSpam: true,
      ruleSetName: "Ses rule set",
    });

    // Then
    const template = Template.fromStack(instance);

    template.hasResourceProperties("AWS::Lambda::Function", {});
  });
});
