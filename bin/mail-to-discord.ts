#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { MailToDiscordApp } from "../lib/mail-to-discord-app";

const app = new cdk.App();

new MailToDiscordApp(app, "MailToDiscordApp", {
  env: {
    account: process.env.CDK_ACCOUNT,
    region: process.env.CDK_REGION,
  },
  webhookUrl: process.env.WEBHOOK_URL!,
  recipientDomainNames: process.env.RECIPIENT_DOMAIN_NAMES!.split(/,/),
});

