const chunk = require('lodash.chunk');
const { enrichMeta, partitionKey } = require('./enrich')

const MAX_RECORDS = 500; 

const emitEvents = async (kinesis, events, config, retries) => {
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

  try {
    const { FailedRecordCount, Records } = await kinesis.putRecords(params).promise();
    if(FailedRecordCount !== 0) {
      const failedEvents = [];
      Records.forEach((failedRecord, index) => {
        if (failedRecord.ErrorCode) {
          failedEvents.push({
            failedEvent: events[index],
            failureMessage: `${failedRecord.ErrorCode}: ${failedRecord.ErrorMessage}`
          });
        }
      });

      if (retries === 0) throw failedEvents; 
      await emitEvents(kinesis, failedEvents.map(failed => failed.failedEvent), config, retries - 1);
    }
  } catch(error) {
    if (retries === 0) throw error
    await emitEvents(kinesis, events, config, retries - 1);
  }
};

module.exports = (kinesis, events, extendedConfig) => {
  const retries = extendedConfig.maxRetries || 1;
  const emitEventsPromises = chunk(events, MAX_RECORDS).map(chunkedEvents => 
    emitEvents(kinesis, chunkedEvents, extendedConfig, retries));
  return Promise.allSettled(emitEventsPromises);
};
