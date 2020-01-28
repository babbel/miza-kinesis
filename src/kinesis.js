const AWS = require('aws-sdk');

module.exports = (streamConfig) => new AWS.Kinesis({
  region: streamConfig.region,
  httpOptions: streamConfig.httpOptions,
  maxRetries: streamConfig.maxRetries
});
