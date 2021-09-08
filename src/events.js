const { enrichMeta, partitionKey } = require('./utils/dataToBlob');

module.exports = (kinesis, events, config) => {
  const records = events.map(event => {
    const enrichedEvent = enrichMeta(event, config.appName, config.ipv4);
    return {
      Data: JSON.stringify(enrichedEvent),
      PartitionKey: config.partitionKey || partitionKey(enrichedEvent),
    }
  })

  const params = {
    Records: records,
    StreamName: config.kinesisStream.resource
  };

  return kinesis.putRecords(params).promise();
};
