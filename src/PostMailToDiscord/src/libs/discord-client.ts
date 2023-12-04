import { promiseRetry } from "./promise-retry";

export const postToDiscord = async (
  url: string,
  message: object
): Promise<void> => {
  const request = new Request(url, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  await promiseRetry(
    async () => {
      const response = await fetch(request);

      if (!response.ok) {
        throw new Error("Response was not ok.", {
          cause: { status: response.status, text: await response.text },
        });
      }
    },
    { count: 5, delay: 3000 }
  );
};
