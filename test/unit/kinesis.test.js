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

  it("applies connectionTimeout and timeout to the request handler", () => {
    const { requestHandler } = instantiateKinesis(config).config;

    expect(requestHandler.configProvider).to.be.a("promise");
    return requestHandler.configProvider.then((handlerConfig) => {
      expect(handlerConfig.connectionTimeout).to.eq(5000);
      expect(handlerConfig.requestTimeout).to.eq(10000);
    });
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
  });

  context("when neither is given", () => {
    it("falls back to the SDK default", async () => {
      const kinesis = instantiateKinesis(config);

      expect(await kinesis.config.maxAttempts()).to.eq(3);
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
