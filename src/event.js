const { enrichMeta, partitionKey } = require("./enrich");
const { PutRecordCommand } = require('@aws-sdk/client-kinesis');

const emitEvent = (kinesis, event, config) => {
  const enrichedEvent = enrichMeta(event, config.appName, config.ipv4);

  const putRecordCommand = new PutRecordCommand({
    Data: JSON.stringify(enrichedEvent),
    PartitionKey: config.partitionKey || partitionKey(enrichedEvent),
    StreamName: config.kinesisStream.resource,
  });
  return kinesis.send(putRecordCommand);
};

const emitEventWithRetry = async (kinesis, event, config, retries) => {
  try {
    return await emitEvent(kinesis, event, config);
  } catch (error) {
    if (retries === 0) throw error;
    return await emitEventWithRetry(kinesis, event, config, retries - 1);
  }
};

module.exports = (kinesis, event, config) => {
  const retries = config.maxRetries || 0;
  return emitEventWithRetry(kinesis, event, config, retries);
};
