jest.mock("../../../../src/PostMailToDiscord/src/libs/discord-client");
jest.mock("../../../../src/PostMailToDiscord/src/libs/mail2discord");
jest.mock("../../../../src/PostMailToDiscord/src/libs/s3-client");

import { SESMail, SESReceipt } from "aws-lambda";
import { postToDiscord } from "../../../../src/PostMailToDiscord/src/libs/discord-client";
import { mail2discordMessage } from "../../../../src/PostMailToDiscord/src/libs/mail2discord";
import { getMailBodyFromS3 } from "../../../../src/PostMailToDiscord/src/libs/s3-client";
import { sesEventHandler } from "../../../../src/PostMailToDiscord/src/libs/ses-event-utils";

describe("Main", () => {
  beforeAll(() => {});

  describe("正常系", () => {
    it("S3から読み込みWebhookを呼ぶ", async () => {
      // Given
      const bucketName = "s3-bucket";
      const webHookUrl = "https://webhook/";
      const messageId = "message-id";
      const mail = {
        source: "source",
        messageId,
      } as SESMail;
      const receipt = {
        dkimVerdict: { status: "PASS" },
        spamVerdict: { status: "PASS" },
        spfVerdict: { status: "PASS" },
        virusVerdict: { status: "PASS" },
      } as SESReceipt;
      const records = [
        { ses: { receipt, mail }, eventSource: "", eventVersion: "" },
      ];
      const mailData = {};
      const discordMessage = {};

      (getMailBodyFromS3 as jest.Mock).mockReturnValue(
        Promise.resolve(mailData)
      );
      (mail2discordMessage as jest.Mock).mockReturnValue(
        Promise.resolve(discordMessage)
      );
      (postToDiscord as jest.Mock).mockReturnValue(Promise.resolve());

      // When
      await sesEventHandler(records, { bucketName, webHookUrl });

      // Then
      expect(getMailBodyFromS3).toHaveBeenCalledWith(bucketName, messageId);
      expect(mail2discordMessage).toHaveBeenCalledWith(mail, mailData);
      expect(postToDiscord).toHaveBeenCalledWith(webHookUrl, discordMessage);
    });
  });
});
