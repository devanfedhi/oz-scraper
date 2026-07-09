export const databaseHealthcheckStepRetryPolicy = {
  initialRetryInterval: { milliseconds: 500 },
  retryIntervalFactor: 2,
  maxRetryInterval: { seconds: 5 },
  maxRetryAttempts: 3,
  maxRetryDuration: { seconds: 15 }
};
