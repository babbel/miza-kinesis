const chunk = require('lodash.chunk');
const { enrichMeta, partitionKey } = require('./enrich')

const MAX_RECORDS = 500; 
const RETRY = {
  attempts: 3,
  interval: (retryCount) => 1000 * (retryCount),
};

const wait = (time) => (
  new Promise((resolve) => {
    setTimeout(resolve, time);
  })
);

const emitEvents = async (kinesis, events, config, attempt = 1) => {
  console.log('emitEvents: events', events.length)  

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

  const { FailedRecordCount, Records } = await kinesis.putRecords(params).promise();

  if (FailedRecordCount > 0) {
    let failedEvents = [];
    for (const [ index, failedRecord ] of Records) {
      if (failedRecord.ErrorCode) {
        failedEvents.push({ failedRecord, failedEvent: events[index]});
      }
    }

    if (attempt < RETRY.attempts) {
      await wait(RETRY.interval(attempt));
      attempt += 1;

      emitEvents(kinesis, failedEvents.map((_, failedEvent) => failedEvent), extendedConfig, attempt); 
    } else {
      throw new Error(failedEvents)
    }
  }
};

module.exports = (kinesis, events, extendedConfig) => {
  const emitEventsPromises = chunk(events, MAX_RECORDS).map(chunkedEvents => 
    emitEvents(kinesis, chunkedEvents, extendedConfig));

  return Promise.allSettled(emitEventsPromises);
};