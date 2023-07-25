const {
  ListShardsCommand,
  GetShardIteratorCommand,
  GetRecordsCommand,
  KinesisClient,
} = require("@aws-sdk/client-kinesis");
const { NodeHttpHandler } = require("@smithy/node-http-handler");

const streamARN = "arn:aws:kinesis:eu-west-1:000000000000:stream/kinesis-test";
const localKinesisEndpoint = "http://localhost:4567";

const [, , , region] = streamARN.split(":");
const [, streamName] = streamARN.split("/");

const kinesisConfig = {
  arn: streamARN,
  region,
  endpoint: localKinesisEndpoint,
  maxRetries: 3,
  requestHandler: new NodeHttpHandler({ connectionTimeout: 5000 }),
};

const kinesisClient = new KinesisClient(kinesisConfig);

const getEventsFromAllShards = async () => {
  const listShardCommand = new ListShardsCommand({ StreamName: streamName });
  const shards = await kinesisClient.send(listShardCommand);
  return Promise.all(
    shards.Shards.map(
      ({ ShardId, SequenceNumberRange: { StartingSequenceNumber } }) => {
        return getEvents({ ShardId, SequenceNumber: StartingSequenceNumber });
      }
    )
  );
};

const getShardIterator = async ({ ShardId, SequenceNumber }) => {
  const getShardIteratorCommand = new GetShardIteratorCommand({
    ShardId: ShardId,
    StreamName: streamName,
    ShardIteratorType: "AT_SEQUENCE_NUMBER",
    StartingSequenceNumber: SequenceNumber,
  });

  const { ShardIterator } = await kinesisClient.send(getShardIteratorCommand);
  return ShardIterator;
};

const getEvents = async (shardParams) => {
  const ShardIterator = await getShardIterator(shardParams);
  const getRecordsCommand = new GetRecordsCommand({ ShardIterator });
  const data = await kinesisClient.send(getRecordsCommand);
  return data["Records"].map((record) => record["Data"]);
};

module.exports = {
  getEvents,
  localKinesisEndpoint,
  kinesisConfig,
  getEventsFromAllShards,
};
