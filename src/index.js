const arnParser = require('./arnParser');
const emitEvent = require('./event');
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

  return (event) => {
    if (!event) throw 'Event is missing.';

    return emitEvent(kinesis, event, extendedConfig);
  };
};
