const arnParser = require("../src/arnParser");

describe("#parse", () => {
  context("when receiving an invalide ARN", () => {
    const testArn =
      "arn/aws/kinesis/eu-west-1/111122223333/stream/test-stream-1";

    it("throws that arn is invalid", () => {
      expect(() => arnParser.parse(testArn)).to.throw("Arn is invalid");
    });
  });

  context("when receiving an ARN using the Lambda syntax", () => {
    const testArn = "arn:aws:lambda:us-east-1:123456789012:function:lambdaName";

    it("throws that arn is invalid", () => {
      expect(() => arnParser.parse(testArn)).to.throw("Arn is invalid");
    });
  });

  context("when receiving an ARN using the Kinesis syntax", () => {
    const testArn =
      "arn:aws:kinesis:eu-west-1:111122223333:stream/test-stream-1";

    it("returns an object with parsed ARN", () => {
      expect(arnParser.parse(testArn)).to.eql({
        region: "eu-west-1",
        resource: "test-stream-1",
      });
    });
  });
});
