import { promiseRetry } from "../../../../src/PostMailToDiscord/src/libs/promise-retry";

describe("promiseRetry", () => {
  const wait = (delay: number) =>
    new Promise((resolve) => setTimeout(resolve, delay));

  it("常に成功", async () => {
    let executedCount = 0;

    // Given
    const operation = async () => {
      await wait(1);
      return ++executedCount;
    };
    const retryConfig = { count: 3, delay: 1 };

    // When
    const actual = await promiseRetry(operation, retryConfig);

    // Then
    expect(actual).toBe(1);
  });

  it("指定回数リトライするが失敗", async () => {
    let executedCount = 0;

    // Given
    const operation = async () => {
      await wait(1);
      throw ++executedCount;
    };
    const retryConfig = { count: 3, delay: 1 };

    try {
      // When
      await promiseRetry(operation, retryConfig);
      // ここには来ない
      expect.assertions(0);
    } catch (err) {
      // Then
      expect(err).toBe(4); // 初回+3回リトライ
    }
  }, 6000);

  it("リトライして成功する", async () => {
    let executedCount = 0;

    // Given
    const operation = async () => {
      await wait(1);

      // 3回目で成功
      if (++executedCount === 3) {
        return executedCount;
      } else {
        throw executedCount;
      }
    };

    const retryConfig = { count: 3, delay: 1 };

    // When
    const actual = await promiseRetry(operation, retryConfig);

    // Then
    expect(actual).toBe(3); // 初回+2回で成功
  });

  it("リトライさせないで失敗", async () => {
    let executedCount = 0;

    // Given
    const operation = async () => {
      await wait(1);
      throw ++executedCount;
    };
    const retryConfig = { count: 0, delay: 1 };

    try {
      // When
      await promiseRetry(operation, retryConfig);
      // ここには来ない
      expect.assertions(0);
    } catch (err) {
      // Then
      expect(err).toBe(1); // 初回のみ
    }
  });
});
