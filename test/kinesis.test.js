const AWS = require("aws-sdk");

const instantiateKinesis = require("../src/kinesis");

describe("#kinesis", () => {
  const config = {
    region: "fake region",
    httpOptions: {
      connectTimeout: 1000,
      timeout: 1000,
    },
    maxRetries: 20,
  };

  const kinesisClient = new AWS.Kinesis(config);

  it("creates kinesis with right options", () => {
    expect(instantiateKinesis(config))
      .excludingEvery("_clientId")
      .to.deep.eq(kinesisClient);
  });
});
