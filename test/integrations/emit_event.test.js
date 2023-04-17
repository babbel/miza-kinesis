const events = require("../../index");
const {
  getEvents,
  kinesisConfig,
  localKinesisEndpoint,
} = require("./kinesis_helper");

const config = {
  appName: "application-name",
  kinesisStream: { ...kinesisConfig },
  ipv4: "127.0.0.1", // optional
  endpoint: localKinesisEndpoint,
};

const event = {
  name: "request:performed",
  meta: {},
};

const emitEvent = events(config);

describe("emitEvent", () => {
  describe("emits one event", () => {

    it("pushes an event to kinesis and finds it back", async () => {
      const data = await emitEvent(event);
      const kinesisData = await getEvents(data);
      const eventFromKinesis = kinesisData.map(JSON.parse)[0];
      expect(eventFromKinesis.name).to.equal(event.name);
    });

    it("contains all the expected meta keys", async () => {
      const data = await emitEvent(event);
      const kinesisData = await getEvents(data);
      const eventFromKinesis = kinesisData.map(JSON.parse)[0];
      const metaKeys = Object.keys(eventFromKinesis.meta);
      ["created_at", "event_uuid", "producer", "user_agent", "ipv4"].forEach(
        (expectedkey) => {
          expect(metaKeys).to.contain(expectedkey);
        }
      );
    });
  });
});
