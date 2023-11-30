export const postToDiscord = async (webhookUrl: string, message: object) => {
  await fetch(webhookUrl, {
    method: "POST",
    body: JSON.stringify(message),
    headers: {
      "Content-Type": "application/json",
    },
  });
};
