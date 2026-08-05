const { KinesisClient } = require("@aws-sdk/client-kinesis");
const { NodeHttpHandler } = require("@smithy/node-http-handler");

// AWS SDK v2 took `maxRetries` (retries *in addition to* the first try). v3
// replaced it with `maxAttempts` (total tries) and silently ignores unknown
// keys, so `maxRetries` has had no effect since v4.0.0 dropped SDK v2.
const toMaxAttempts = (maxRetries) =>
  maxRetries === undefined ? undefined : maxRetries + 1;

module.exports = ({
  region,
  maxRetries,
  maxAttempts,
  connectionTimeout,
  timeout,
  endpoint,
}) => {
  const kinesisConfig = {
    region,
    requestHandler: new NodeHttpHandler({
      connectionTimeout,
      requestTimeout: timeout,
    }),
    // Left undefined, the SDK falls back to AWS_MAX_ATTEMPTS / its own default.
    maxAttempts: maxAttempts ?? toMaxAttempts(maxRetries),
  };
  if (endpoint) {
    kinesisConfig.endpoint = endpoint;
  }
  return new KinesisClient(kinesisConfig);
};
