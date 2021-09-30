const chunk = require('lodash.chunk');
const omit = require('lodash.omit');
const { enrichMeta, partitionKey } = require('./enrich')

const MAX_RECORDS = 500; 

const enrichRecords = (events, config) => {
  return events.map(event => {
    const enrichedEvent = enrichMeta(event, config.appName, config.ipv4);
    return {
      Data: JSON.stringify(enrichedEvent),
      PartitionKey: config.partitionKey || partitionKey(enrichedEvent),
    }
  })
};

const emitEvents = async (kinesis, records, config, retries) => {
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
            failedRecord: records[index],
            failedEvent: JSON.parse(records[index].Data),
            failureMessage: `${failedRecord.ErrorCode}: ${failedRecord.ErrorMessage}`
          });
        }
      });

      if (retries === 0) throw failedEvents.map(failed => omit(failed, ['failedRecord'])); 

      return await emitEvents(kinesis, failedEvents.map(failed => failed.failedRecord), config, retries - 1);
    }
  } catch(error) {
    if (retries === 0) throw error
    return await emitEvents(kinesis, records, config, retries - 1);
  }
};

module.exports = (kinesis, events, config) => {
  const retries = config.maxRetries || 0;
  const emitEventsPromises = chunk(events, MAX_RECORDS).map(async (chunkedEvents) => {
    const enrichedRecords = enrichRecords(chunkedEvents, config);
    return await emitEvents(kinesis, enrichedRecords, config, retries);
  });
  return Promise.allSettled(emitEventsPromises);
};
