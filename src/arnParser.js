const ARN_VALIDATOR =
  /^arn:aws:kinesis:([a-z\-0-9]+):((http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)|(\d+)):stream\/(.+)$/;

const parse = (arn) => {
  const match = arn.match(ARN_VALIDATOR);
  if (!match) throw "Arn is invalid";

  return {
    region: match[1],
    resource: match[3],
  };
};

module.exports = {
  parse,
};
