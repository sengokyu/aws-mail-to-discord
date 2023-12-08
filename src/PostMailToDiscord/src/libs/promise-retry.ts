type Operation<T> = () => Promise<T>;

interface PromiseRetryConfig {
  // エラー発生後のリトライ回数
  count: number;
  // エラー発生後の待ち時間(ms)
  delay: number;
}

const wait = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

/**
 * エラー時リトライする
 * @param operation
 * @param config
 * @returns
 */
export const promiseRetry = async <T>(
  operation: Operation<T>,
  config: PromiseRetryConfig
): Promise<T> => {
  try {
    return await operation();
  } catch (err) {
    if (config.count === 0) {
      throw err;
    }

    await wait(config.delay);

    return await promiseRetry(operation, {
      count: config.count - 1,
      delay: config.delay,
    });
  }
};
