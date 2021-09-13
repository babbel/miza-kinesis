const crypto = require('crypto');

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