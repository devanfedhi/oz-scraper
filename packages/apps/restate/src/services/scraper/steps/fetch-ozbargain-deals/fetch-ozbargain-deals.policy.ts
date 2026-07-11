export const fetchOzBargainDealsStepRetryPolicy = {
  initialRetryInterval: { seconds: 1 },
  retryIntervalFactor: 2,
  maxRetryInterval: { seconds: 10 },
  maxRetryAttempts: 4,
  maxRetryDuration: { seconds: 30 }
};
