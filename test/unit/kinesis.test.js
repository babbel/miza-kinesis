const { KinesisClient } = require('@aws-sdk/client-kinesis');
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler');

const instantiateKinesis = require("../../src/kinesis");

describe("#kinesis", () => {
  const config = {
    region: "fake region",
    requestHandler: new NodeHttpHandler({connectionTimeout: 5000}),
    maxRetries: 20,
  };

  const kinesisClient = new KinesisClient(config);

  it("creates kinesis with right options", () => {
    expect(instantiateKinesis(config))
      .excludingEvery("_clientId")
      .to.deep.eq(kinesisClient);
  });
});