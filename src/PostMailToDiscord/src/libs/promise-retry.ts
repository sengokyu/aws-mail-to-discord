type Operation<T> = () => Promise<T>;

interface RetryConfig {
  count: number;
  delay: number;
}

const wait = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

/**
 * エラー時リトライする
 * @param operation
 * @param retryConfig
 * @returns
 */
export const promiseRetry = <T>(
  operation: Operation<T>,
  retryConfig: RetryConfig
): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    operation()
      .then(resolve)
      .catch((err) => {
        if (retryConfig.count > 0) {
          wait(retryConfig.delay)
            .then(() =>
              promiseRetry(operation, {
                count: retryConfig.count - 1,
                delay: retryConfig.delay,
              })
            )
            .then(resolve)
            .catch(reject);
        } else {
          reject(err);
        }
      });
  });
};
