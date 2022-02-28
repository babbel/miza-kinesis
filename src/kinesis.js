const Kinesis = require("aws-sdk/clients/kinesis");

module.exports = (streamConfig) =>
  new Kinesis({
    region: streamConfig.region,
    httpOptions: streamConfig.httpOptions,
    maxRetries: streamConfig.maxRetries,
  });
