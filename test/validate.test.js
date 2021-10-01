const validate = require("../src/validate");

describe("#validate", () => {
  it("throws an error if appName is missing", () => {
    expect(() => validate({})).to.throw(
      "App name is missing. Set it up in a config."
    );
  });

  it("throws an error if kinesis arn is missing", () => {
    const config = {
      appName: "some appName",
    };

    expect(() => validate(config)).to.throw(
      "Kinesis arn is missing. Set it up in a config."
    );
  });
});
