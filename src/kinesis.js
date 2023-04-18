const { KinesisClient } = require('@aws-sdk/client-kinesis');
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler');

module.exports = ({region, maxRetries, connectionTimeout}) =>
  new KinesisClient({
    region,
    requestHandler: new NodeHttpHandler({connectionTimeout}),
    maxRetries,
  });
