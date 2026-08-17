const { KinesisClient } = require("@aws-sdk/client-kinesis");
const { NodeHttpHandler } = require("@smithy/node-http-handler");

// AWS SDK v2 took `maxRetries` (retries *in addition to* the first try). v3
// replaced it with `maxAttempts` (total tries) and silently ignores unknown
// keys, so `maxRetries` has had no effect since v4.0.0 dropped SDK v2.
//
// Because the option was inert for three years, no consumer's value has ever
// been exercised -- a `maxRetries: process.env.FOO` that did nothing would
// otherwise start concatenating ("2" + 1 === "21" attempts). Coerce numeric
// strings, reject anything else loudly at construction time.
const toInteger = (value, name, min) => {
  if (value === undefined || value === null) return undefined;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min) {
    throw `${name} must be an integer >= ${min}, got ${JSON.stringify(value)}`;
  }

  return parsed;
};

module.exports = ({
  region,
  maxRetries,
  maxAttempts,
  connectionTimeout,
  timeout,
  endpoint,
}) => {
  const attempts = toInteger(maxAttempts, "kinesisStream.maxAttempts", 1);
  const retries = toInteger(maxRetries, "kinesisStream.maxRetries", 0);

  const kinesisConfig = {
    region,
    requestHandler: new NodeHttpHandler({
      connectionTimeout,
      requestTimeout: timeout,
    }),
    // Left undefined, the SDK resolves AWS_MAX_ATTEMPTS, then the shared
    // config's `max_attempts`, then its own default of 3.
    maxAttempts: attempts ?? (retries === undefined ? undefined : retries + 1),
  };
  if (endpoint) {
    kinesisConfig.endpoint = endpoint;
  }
  return new KinesisClient(kinesisConfig);
};
