require("./test_helper");

const EVENT_UUID_RESULT = "NEW UUID FOR THE EVENT";

const AWS = require("aws-sdk");
const kinesis = new AWS.Kinesis({ region: "eu-west-1" });

const emitEvent = require("../src/event");

const promise = sinon.stub().resolves();

describe("#emitEvent", () => {
  const config = {
    appName: "some name",
    kinesisStream: {
      resource: "test-stream",
    },
    maxRetries: 2,
  };

  const event = {
    data: "some data",
  };

  beforeEach(() => {
    putRecordStub = sinon.stub(kinesis, "putRecord").returns({ promise });
    clock = sinon.useFakeTimers();
    createdAt = new Date();
  });

  afterEach(() => {
    putRecordStub.restore();
    clock.restore();
  });

  describe("when calling emitEvent with kinesis, event, config", () => {
    it("calls putRecord on kinesis with right params", () => {
      const enrichedEvent = {
        created_at: createdAt,
        data: "some data",
        meta: {
          created_at: createdAt,
          event_uuid: EVENT_UUID_RESULT,
          producer: "some name",
          user_agent: "miza-kinesis",
        },
      };

      emitEvent(kinesis, event, config);

      expect(putRecordStub).to.have.been.calledOnce;
      expect(putRecordStub).to.have.been.calledWith({
        Data: JSON.stringify(enrichedEvent),
        PartitionKey: EVENT_UUID_RESULT,
        StreamName: "test-stream",
      });
      clock.restore();
    });

    it("returns a promise", () => {
      expect(emitEvent(kinesis, event, config)).to.be.a("promise");
    });

    it("fails when kinesis returns an error", async () => {
      const error = new Error("something went wrong");
      putRecordStub.returns({ promise: () => Promise.reject(error) });

      try {
        await emitEvent(kinesis, event, config);
      } catch (err) {
        expect(err).to.equal(error);
        expect(putRecordStub).to.have.callCount(3);
      }
    });

    it("fails when kinesis returns an error", async () => {
      const error = new Error("something went wrong");
      putRecordStub.returns({ promise: () => Promise.reject(error) });

      try {
        await emitEvent(kinesis, event, { ...config, maxRetries: undefined });
      } catch (err) {
        expect(err).to.equal(error);
        expect(putRecordStub).to.have.callCount(1);
      }
    });
  });

  describe("when calling emitEvent with PartitionKey in config", () => {
    it("calls putRecord on kinesis with the PartitionKey in config", () => {
      const config = {
        appName: "test-app",
        partitionKey: "uuid",
        kinesisStream: {
          resource: "test-stream",
        },
      };

      const enrichedEvent = {
        created_at: createdAt,
        data: "some data",
        meta: {
          created_at: createdAt,
          event_uuid: EVENT_UUID_RESULT,
          producer: "test-app",
          user_agent: "miza-kinesis",
        },
      };

      emitEvent(kinesis, event, config);
      expect(putRecordStub).to.have.been.calledWith({
        Data: JSON.stringify(enrichedEvent),
        PartitionKey: "uuid",
        StreamName: "test-stream",
      });
    });

    it("calls putRecord on kinesis with event uuid when PartitionKey is undefined", () => {
      const enrichedEvent = {
        created_at: createdAt,
        data: "some data",
        meta: {
          created_at: createdAt,
          event_uuid: EVENT_UUID_RESULT,
          producer: "some name",
          user_agent: "miza-kinesis",
        },
      };

      emitEvent(kinesis, event, config);
      expect(putRecordStub).to.have.been.calledWith({
        Data: JSON.stringify(enrichedEvent),
        PartitionKey: EVENT_UUID_RESULT,
        StreamName: "test-stream",
      });
    });
  });
});
