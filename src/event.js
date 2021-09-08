const { enrichMeta, partitionKey } = require('./utils/dataToBlob');

module.exports = (kinesis, event, config) => {
  const enrichedEvent = enrichMeta(event, config.appName, config.ipv4);

  const params = {
    Data: JSON.stringify(enrichedEvent),
    PartitionKey: config.partitionKey || partitionKey(enrichedEvent),
    StreamName: config.kinesisStream.resource
  };

  return kinesis.putRecord(params).promise();
};
