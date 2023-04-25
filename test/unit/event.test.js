require("./test_helper");

const EVENT_UUID_RESULT = "NEW UUID FOR THE EVENT";

const { KinesisClient } = require("@aws-sdk/client-kinesis");
const kinesis = new KinesisClient({ region: "eu-west-1" });
let kinesisStub;

const putRecordsStub = sinon.spy();

const emitEvent = proxyquire("../src/event", {
  "@aws-sdk/client-kinesis": { PutRecordCommand: putRecordsStub },
});

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
    kinesisStub = sinon.stub(kinesis, "send").resolves({});
    clock = sinon.useFakeTimers();
    createdAt = new Date();
  });

  afterEach(() => {
    kinesisStub.restore();
    putRecordsStub.resetHistory();
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

      expect(kinesisStub).to.have.been.calledOnce;
      expect(putRecordsStub).to.have.been.calledWith({
        Data: Buffer.from(JSON.stringify(enrichedEvent)),
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
      kinesisStub.rejects(error);

      try {
        await emitEvent(kinesis, event, config);
      } catch (err) {
        expect(err).to.equal(error);
        expect(putRecordsStub).to.have.callCount(3);
      }
    });

    it("fails when kinesis returns an error", async () => {
      const error = new Error("something went wrong");
      kinesisStub.rejects(error);

      try {
        await emitEvent(kinesis, event, { ...config, maxRetries: undefined });
      } catch (err) {
        expect(err).to.equal(error);
        expect(kinesisStub).to.have.callCount(1);
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
      expect(putRecordsStub).to.have.been.calledWith({
        Data: Buffer.from(JSON.stringify(enrichedEvent)),
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
      expect(putRecordsStub).to.have.been.calledWith({
        Data: Buffer.from(JSON.stringify(enrichedEvent)),
        PartitionKey: EVENT_UUID_RESULT,
        StreamName: "test-stream",
      });
    });
  });
});
