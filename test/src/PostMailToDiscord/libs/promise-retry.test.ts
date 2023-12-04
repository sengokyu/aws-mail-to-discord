import { promiseRetry } from "../../../../src/PostMailToDiscord/src/libs/promise-retry";

describe("promiseRetry", () => {
  const wait = (delay: number) =>
    new Promise((resolve) => setTimeout(resolve, delay));

  it("常に成功", async () => {
    let executedCount = 0;

    // Given
    const operation = () =>
      new Promise(async (resolve) => {
        await wait(1);
        resolve(++executedCount);
      });
    const retryConfig = { count: 3, delay: 1 };

    // When
    const actual = await promiseRetry(operation, retryConfig);

    // Then
    expect(actual).toBe(1);
  });

  it("指定回数リトライするが失敗", (done) => {
    let executedCount = 0;

    // Given
    const operation = () => {
      return new Promise(async (_, reject) => {
        await wait(1);
        reject(++executedCount);
      });
    };
    const retryConfig = { count: 3, delay: 1 };

    // When
    promiseRetry(operation, retryConfig)
      .then(() => {
        // ここには来ない
        expect.assertions(0);
      })
      .catch((err) => {
        // Then
        expect(err).toBe(4); // 初回+3回リトライ
        done();
      });
  }, 6000);

  it("リトライして成功する", async () => {
    let executedCount = 0;

    // Given
    const operation = () => {
      return new Promise(async (resolve, reject) => {
        await wait(1);

        // 3回目で成功
        if (++executedCount === 3) {
          resolve(executedCount);
        } else {
          reject(executedCount);
        }
      });
    };
    const retryConfig = { count: 3, delay: 1 };

    // When
    const actual = await promiseRetry(operation, retryConfig);

    // Then
    expect(actual).toBe(3); // 初回+2回で成功
  });

  it("リトライさせないで失敗", (done) => {
    let executedCount = 0;

    // Given
    const operation = () => {
      return new Promise(async (_, reject) => {
        await wait(1);
        reject(++executedCount);
      });
    };
    const retryConfig = { count: 0, delay: 1 };

    // When
    promiseRetry(operation, retryConfig)
      .then(() => {
        // ここには来ない
        expect.assertions(0);
      })
      .catch((err) => {
        // Then
        expect(err).toBe(1); // 初回のみ
        done();
      });
  });
});
