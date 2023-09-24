import { SESMail } from "aws-lambda";
import { mail2discordMessage } from "../../../lib/libs/mail2discord";

describe("mail2discordMessage", () => {
  it("convert mail to discord message", async () => {
    // Given
    const sesMail: SESMail = {
      source: "janedoe@example.com",
      timestamp: "1970-01-01T00:00:00.000Z",
      destination: ["johndoe@example.com"],
      messageId: "",
      headersTruncated: true,
      headers: [],
      commonHeaders: {
        from: ["Jane Doe <janedoe@example.com>"],
        date: "Wed, 7 Oct 2015 12:34:56 -0700",
        returnPath: "janedoe@example.com",
        messageId: "<0123456789example.com>",
        subject: "Test Subject",
      },
    };
    const mail = [
      'From: "I am sender" <sender@example.com>',
      "Date: Tue, 4 Jun 2013 07:44:39 +0530",
      "",
      "Mail text.",
    ].join("\r\n");

    // When
    const actual = await mail2discordMessage(sesMail, mail);

    // Then
    expect(actual).toEqual({
      embed: [
        {
          author: {
            icon_url: undefined,
            name: "Jane Doe <janedoe@example.com>",
            url: undefined,
          },
          color: 16339606,
          description: "Mail text.",
          timestamp: "2015-10-07T19:34:56.000Z",
          title: "Test Subject",
        },
      ],
    });
  });
});
