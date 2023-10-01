#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { MailToDiscordApp } from "../lib/mail-to-discord-app";
import { Recipient } from "../lib/recipient";

const domainName2EnvName = (domainName: string) =>
  "WEBHOOK_URL_" + domainName.toUpperCase().replace(/[^A-Z]/, "_");

const retrieveWebhookUrl = (domainName: string): string => {
  const envName = domainName2EnvName(domainName);

  if (!process.env[envName]) {
    throw new Error(`Environment variable not defined: ${envName}`);
  }

  return process.env[envName]!;
};

/**
 * Read environment variables
 * @returns
 */
const prepareRecipients = (): Recipient[] => {
  if (!process.env.RECIPIENT_DOMAIN_NAMES) {
    throw new Error("Environment variable not defined: RECIPIENT_DOMAIN_NAMES");
  }

  return process.env.RECIPIENT_DOMAIN_NAMES!.split(/,/).map((domainName) => ({
    domainName,
    webhookUrl: retrieveWebhookUrl(domainName),
  }));
};

const app = new cdk.App();

new MailToDiscordApp(app, "MailToDiscordApp", {
  env: {
    account: process.env.CDK_ACCOUNT,
    region: process.env.CDK_REGION,
  },
  recipients: prepareRecipients(),
});
