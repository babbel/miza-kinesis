const { enrichMeta, partitionKey } = require('./utils/dataToBlob');

const emitEvent = (kinesis, event, config) => {
  const enrichedEvent = enrichMeta(event, config.appName, config.ipv4);

  const params = {
    Data: JSON.stringify(enrichedEvent),
    PartitionKey: config.partitionKey || partitionKey(enrichedEvent),
    StreamName: config.kinesisStream.resource
  };
  return kinesis.putRecord(params).promise();
};

const emitEvents = (kinesis, events, config) => {
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

module.exports = {
  emitEvent,
  emitEvents,
};