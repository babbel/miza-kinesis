const instantiateKinesis = require("../../src/kinesis");

// These assert the *resolved* client config. The previous version deep-compared
// the returned client against one built from the same object, so it passed for
// any key name -- including one the SDK ignores.
describe("#kinesis", () => {
  const config = {
    region: "fake region",
    connectionTimeout: 5000,
    timeout: 10000,
  };

  it("passes the region through", async () => {
    const kinesis = instantiateKinesis(config);

    expect(await kinesis.config.region()).to.eq("fake region");
  });

  it("applies connectionTimeout and timeout to the request handler", async () => {
    const { requestHandler } = instantiateKinesis(config).config;

    // `httpHandlerConfigs()` stays empty until the first request, so the
    // handler's own config promise is the only pre-flight route in.
    const handlerConfig = await requestHandler.configProvider;

    expect(handlerConfig.connectionTimeout).to.eq(5000);
    expect(handlerConfig.requestTimeout).to.eq(10000);
  });

  context("when maxRetries is given", () => {
    it("translates it to maxAttempts, counting the first try", async () => {
      const kinesis = instantiateKinesis({ ...config, maxRetries: 3 });

      expect(await kinesis.config.maxAttempts()).to.eq(4);
    });

    it("supports disabling retries with maxRetries: 0", async () => {
      const kinesis = instantiateKinesis({ ...config, maxRetries: 0 });

      expect(await kinesis.config.maxAttempts()).to.eq(1);
    });

    // The option was inert for three years, so no consumer's value has ever
    // been exercised. A numeric string must not concatenate into "21".
    it("coerces numeric strings", async () => {
      const kinesis = instantiateKinesis({ ...config, maxRetries: "2" });

      expect(await kinesis.config.maxAttempts()).to.eq(3);
    });

    [
      [-1, "-1"],
      [1.5, "1.5"],
      [NaN, "NaN"],
      ["many", '"many"'],
      [{}, "an object"],
    ].forEach(([value, label]) => {
      it(`rejects ${label}`, () => {
        expect(() =>
          instantiateKinesis({ ...config, maxRetries: value })
        ).to.throw(/kinesisStream.maxRetries must be an integer >= 0/);
      });
    });
  });

  context("when maxAttempts is given", () => {
    it("uses it verbatim and ignores maxRetries", async () => {
      const kinesis = instantiateKinesis({
        ...config,
        maxAttempts: 5,
        maxRetries: 99,
      });

      expect(await kinesis.config.maxAttempts()).to.eq(5);
    });

    // "Total tries" of zero is meaningless, and rejecting it up front is what
    // keeps a falsy maxAttempts from quietly falling through to maxRetries.
    it("rejects 0, rather than falling back to maxRetries", () => {
      expect(() =>
        instantiateKinesis({ ...config, maxAttempts: 0, maxRetries: 3 })
      ).to.throw(/kinesisStream.maxAttempts must be an integer >= 1/);
    });
  });

  context("when neither is given", () => {
    // Both are resolved from the ambient environment, so a developer with
    // either set would otherwise see this fail.
    const saved = {};
    before(() => {
      ["AWS_MAX_ATTEMPTS", "AWS_CONFIG_FILE"].forEach((key) => {
        saved[key] = process.env[key];
      });
      delete process.env.AWS_MAX_ATTEMPTS;
      process.env.AWS_CONFIG_FILE = "/dev/null";
    });
    after(() => {
      Object.entries(saved).forEach(([key, value]) => {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      });
    });

    it("falls back to the SDK default", async () => {
      const kinesis = instantiateKinesis(config);

      expect(await kinesis.config.maxAttempts()).to.eq(3);
    });

    it("honours AWS_MAX_ATTEMPTS", async () => {
      process.env.AWS_MAX_ATTEMPTS = "7";

      try {
        const kinesis = instantiateKinesis(config);

        expect(await kinesis.config.maxAttempts()).to.eq(7);
      } finally {
        delete process.env.AWS_MAX_ATTEMPTS;
      }
    });
  });

  context("when endpoint is given", () => {
    it("passes it through", async () => {
      const kinesis = instantiateKinesis({
        ...config,
        endpoint: "http://localhost:4568",
      });

      expect((await kinesis.config.endpoint()).hostname).to.eq("localhost");
    });
  });
});
