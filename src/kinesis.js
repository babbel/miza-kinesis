const { KinesisClient } = require("@aws-sdk/client-kinesis");
const { NodeHttpHandler } = require("@aws-sdk/node-http-handler");

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
      socketTimeout: timeout,
    }),
    maxRetries,
  };
  if (endpoint) {
    kinesisConfig.endpoint = endpoint;
  }
  return new KinesisClient(kinesisConfig);
};
