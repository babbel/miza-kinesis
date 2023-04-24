require("./test_helper");

const EVENT_UUID_RESULT = "NEW UUID FOR THE EVENT";

const { KinesisClient } = require("@aws-sdk/client-kinesis");
const kinesis = new KinesisClient({ region: "eu-west-1" });
const putRecordsStub = sinon.spy();
const { enrichMeta } = require("../../src/enrich");

const emitEventsInBatches = proxyquire("../src/emitEventsInBatches", {
  "@aws-sdk/client-kinesis": { PutRecordCommand: putRecordsStub },
});

const { expect } = require("chai");

describe("#emitEventsInBatches", () => {
  beforeEach(() => {
    clock = sinon.useFakeTimers();
    createdAt = new Date().toISOString();

    kinesisStub = sinon
      .stub(kinesis, "send")
      .resolves({ FailedRecordCount: 0 });
  });

  afterEach(() => {
    kinesisStub.restore();
    clock.restore();
    putRecordsStub.resetHistory();
  });

  const config = {
    appName: "some name",
    kinesisStream: {
      resource: "test-stream",
    },
    maxRetries: 2,
    type: "BATCH",
  };

  let events = [
    {
      data: "some data",
    },
  ];

  describe("when calling emitEventsInBatches with kinesis, events, config", () => {
    it("calls putRecords on kinesis with right params", () => {
      emitEventsInBatches(kinesis, events, config);
      expect(putRecordsStub).to.have.been.calledWith({
        Records: events.map((event) => ({
          Data: JSON.stringify(enrichMeta(event, config.appName)),
          PartitionKey: EVENT_UUID_RESULT,
        })),
        StreamName: "test-stream",
      });
    });

    it("returns a promise", () => {
      expect(emitEventsInBatches(kinesis, events, config)).to.be.a("promise");
    });

    it("puts 2 records into Kinesis stream using 1 call to Kinesis", async () => {
      events.push({
        data: "event 1",
      });

      emitEventsInBatches(kinesis, events, config);

      expect(kinesisStub).to.have.been.calledOnce;
    });

    it("puts 501 records into Kinesis stream using 2 calls to Kinesis", async () => {
      events = [...Array(501).keys()].map((num) => ({ name: `event:${num}` }));

      await emitEventsInBatches(kinesis, events, config);

      expect(kinesisStub).to.have.been.calledTwice;

      expect(putRecordsStub.args[0][0]).to.deep.equal({
        StreamName: "test-stream",
        Records: events.slice(0, 500).map((event) => ({
          Data: JSON.stringify(enrichMeta(event, config.appName)),
          PartitionKey: EVENT_UUID_RESULT,
        })),
      });

      expect(putRecordsStub.args[1][0]).to.deep.equal({
        StreamName: "test-stream",
        Records: events.slice(500, 501).map((event) => ({
          Data: JSON.stringify(enrichMeta(event, config.appName)),
          PartitionKey: EVENT_UUID_RESULT,
        })),
      });
    });

    it("fails when kinesis returns an error", async () => {
      const error = new Error("something went wrong");
      kinesisStub.rejects(error);

      try {
        await emitEventsInBatches(kinesis, events, config);
      } catch (err) {
        expect(err).to.equal(error);
        expect(putRecordsStub).to.have.callCount(3);
      }
    });

    context("on (partial) failure, when config.maxRetries", () => {
      it("is undefined, putRecordsStub is called 1 time", async () => {
        const error = new Error("something went wrong");
        kinesisStub.rejects(error);

        try {
          await emitEventsInBatches(
            kinesis,
            [
              {
                data: "event 1",
              },
            ],
            { ...config, maxRetries: undefined }
          );
        } catch (err) {
          expect(err).to.equal(error);
        }
        expect(putRecordsStub).to.have.callCount(1);
      });

      it(`${config.maxRetries}, putRecordsStub is called 6 times`, async () => {
        const data = {
          FailedRecordCount: 2,
          Records: [
            { SequenceNumber: 1 },
            {
              SequenceNumber: 2,
              ErrorCode: 123,
              ErrorMessage: "FailedWithErrorOnRecord1",
            },
            {
              SequenceNumber: 3,
              ErrorCode: 456,
              ErrorMessage: "FailedWithErrorOnRecord2",
            },
          ],
        };
        kinesisStub.resolves(data);

        events = [...Array(3).keys()].map((num) => ({ name: `event:${num}` }));

        const result = await emitEventsInBatches(kinesis, events, {
          ...config,
          ipv4: "ipv4",
        });

        expect(result).to.deep.equal([
          {
            status: "rejected",
            reason: [
              {
                failedEvent: enrichMeta(events[1], config.appName, "ipv4"),
                failureMessage: "123: FailedWithErrorOnRecord1",
              },
              {
                failedEvent: enrichMeta(events[2], config.appName, "ipv4"),
                failureMessage: "456: FailedWithErrorOnRecord2",
              },
            ],
          },
        ]);
        expect(putRecordsStub).to.have.callCount(6);
      });
    });
  });
  context(
    "when calling emitEventsInBatches with PartitionKey in config",
    () => {
      it("calls putRecord on kinesis with the PartitionKey in config", () => {
        const configWithPartitionKey = { ...config, partitionKey: "uuid" };

        emitEventsInBatches(kinesis, events, configWithPartitionKey);
        expect(putRecordsStub).to.have.been.calledWith({
          Records: events.map((event) => ({
            Data: JSON.stringify(enrichMeta(event, config.appName)),
            PartitionKey: "uuid",
          })),
          StreamName: "test-stream",
        });
      });
    }
  );
});
