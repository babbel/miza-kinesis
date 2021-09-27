const arnParser = require('./arnParser');
const emitEvent  = require('./event');
const validate = require('./validate');
const instantiateKinesis = require('./kinesis');
const emitEventsInBatches = require('./emitEventsInBatches')

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

      if (!Array.isArray(events)) throw new Error('Events needs to be an Array.');

      if (!events.length) throw new Error('Events are missing.');

      return emitEventsInBatches(kinesis, events, extendedConfig);
    };
  } 
  
  return (event) => {
    if (!event) throw 'Event is missing.';
    
    return emitEvent(kinesis, event, extendedConfig);
  };
};
