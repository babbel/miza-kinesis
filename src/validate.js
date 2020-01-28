module.exports = (config) => {
  if (!config || !config.appName) throw 'App name is missing. Set it up in a config.';
  if (!config.kinesisStream || !config.kinesisStream.arn) throw 'Kinesis arn is missing. Set it up in a config.';
};
