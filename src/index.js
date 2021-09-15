const chunk = require('lodash.chunk');

const arnParser = require('./arnParser');
const { emitEvent, emitEvents }  = require('./event');
const validate = require('./validate');
const instantiateKinesis = require('./kinesis');

module.exports = (config = {}) => {
  validate(config);

  const arnConfig = arnParser.parse(config.kinesisStream.arn);

  const extendedConfig = Object.assign({}, config);
  extendedConfig.kinesisStream = Object.assign(extendedConfig.kinesisStream, arnConfig);

  const kinesis = instantiateKinesis(extendedConfig.kinesisStream);

  if (config.endpoint) {
    kinesis.endpoint = config.endpoint;
  }

  if (config.type && config.type === 'BATCH') {
    return async (events) => {

      if (!Array.isArray(events)) throw new Error('Events needs to be an Array.');

      if (!events.length) throw new Error('Events are missing.');

      const emitEventsPromises = chunk(events, 500).map(chunkedEvents => 
        emitEvents(kinesis, chunkedEvents, extendedConfig));

      const results = await Promise.allSettled(emitEventsPromises);
      const failures = results.filter((result) => result.status === 'rejected');

      if (failures.length > 0) {
        throw new Error(`Tracking of events failed: ${failures}`);
      }
    };
  } 

  return (event) => {
    if (!event) throw 'Event is missing.';

    return emitEvent(kinesis, event, extendedConfig);
  };
};
