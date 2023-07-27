const { KinesisClient } = require("@aws-sdk/client-kinesis");
const { NodeHttpHandler } = require("@smithy/node-http-handler");

module.exports = ({
  region,
  maxRetries,
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
    maxRetries,
  };
  if (endpoint) {
    kinesisConfig.endpoint = endpoint;
  }
  return new KinesisClient(kinesisConfig);
};
