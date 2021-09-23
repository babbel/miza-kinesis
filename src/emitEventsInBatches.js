const crypto = require('crypto');
const chunk = require('lodash.chunk');

const MAX_RECORDS = 500; 
const RETRY = {
  attempts: 3,
  interval: (retryCount) => 1000 * (retryCount),
};

const newHash = (event) => crypto.createHash('md5').update(JSON.stringify(event)).digest('hex');

const partitionKey = (event) => (
  event.uuid || // user identifier
  event.tracking_uuid || (event.meta && event.meta.udid) || // browser or mobile device identifier
  (event.meta && event.meta.event_uuid) || // event identifier
  newHash(event) // fallback
);

const enrichMeta = (event, appName, ipv4) => {
  const createdAt = new Date().toISOString();

  const enrichedEvent = Object.assign({ created_at: createdAt }, event);

  enrichedEvent.meta = Object.assign({
    created_at: createdAt,
    event_uuid: crypto.randomBytes(16).toString('hex'),
    producer: appName,
    user_agent: 'miza-kinesis',
    ipv4
  }, enrichedEvent.meta);

  return enrichedEvent;
};

const wait = (time) => (
  new Promise((resolve) => {
    setTimeout(resolve, time);
  })
);

const emitEvents = async (kinesis, events, config, attempt = 1) => {
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
  console.log('here')
  const emitEventsPromises = chunk(events, MAX_RECORDS).map(chunkedEvents => 
    emitEvents(kinesis, chunkedEvents, extendedConfig));

  return Promise.allSettled(emitEventsPromises);
};