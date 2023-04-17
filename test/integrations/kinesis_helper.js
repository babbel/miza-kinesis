const AWS = require("aws-sdk");

const streamARN = "arn:aws:kinesis:eu-west-1:000000000000:stream/kinesis-test";
const localKinesisEndpoint = "http://localhost:4567";

const [, , , region] = streamARN.split(":");
const [, streamName] = streamARN.split("/");

const kinesisConfig = {
  arn: streamARN,
  region,
  endpoint: localKinesisEndpoint,
  maxRetries: 3,
  httpOptions: {
    connectTimeout: 1000,
    timeout: 1000,
  },
};

const kinesisClient = new AWS.Kinesis(kinesisConfig);


const getEventsFromAllShards = async() => {
  const shards = await kinesisClient.listShards({
    StreamName: streamName
  }).promise();
  return Promise.all(shards.Shards.map(({ShardId, SequenceNumberRange: {StartingSequenceNumber }}) => {
    return getEvents({ShardId, SequenceNumber: StartingSequenceNumber})
  }));
}

const getShardIterator = async ({ ShardId, SequenceNumber }) => {
  const params = {
    ShardId: ShardId,
    StreamName: streamName,
    ShardIteratorType: "AT_SEQUENCE_NUMBER",
    StartingSequenceNumber: SequenceNumber,
  };

  const { ShardIterator } = await kinesisClient
    .getShardIterator(params)
    .promise();
  return ShardIterator;
};

const getEvents = async (shardParams) => {
  const shardIterator = await getShardIterator(shardParams);
  const data = await kinesisClient
    .getRecords({ ShardIterator: shardIterator })
    .promise();
  return data["Records"].map((record) => record["Data"]);
};

module.exports = {
  getEvents,
  localKinesisEndpoint,
  kinesisConfig,
  getEventsFromAllShards
};
