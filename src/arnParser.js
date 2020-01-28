const ARN_VALIDATOR = /^arn:aws:kinesis:([a-z\-0-9]+):(\d+):stream\/(.+)$/;

const parse = (arn) => {
  const match = arn.match(ARN_VALIDATOR);
  if (!match) throw 'Arn is invalid';

  return {
    region: match[1],
    resource: match[3]
  };
};

module.exports = {
  parse
};
