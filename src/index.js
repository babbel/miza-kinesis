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
    return (events) => {

      if (!Array.isArray(events)) throw 'Events needs to be an Array.';

      if (!events.length) throw 'Events are missing.';

      // Each PutRecords request can support up to only 500 records.
      if (events.length > 500) throw 'Events array can only have 500 records.';
  
      return emitEvents(kinesis, events, extendedConfig);
    };
  } 

  return (event) => {
    if (!event) throw 'Event is missing.';

    return emitEvent(kinesis, event, extendedConfig);
  };
};
