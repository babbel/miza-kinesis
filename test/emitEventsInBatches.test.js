const omit = require('lodash.omit');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const emitEventsInBatches = require('../src/emitEventsInBatches');
const { enrichMeta } = require('../src/enrich')

const HASH_RESULT = 'NEW HASH FOR THE EVENT';

const digestStub = sinon.stub();
digestStub.withArgs('hex').returns(HASH_RESULT);

// const createHashStub = sinon.stub(crypto, 'createHash');
// createHashStub.withArgs('md5').returns({
//   update: () => ({
//     digest: digestStub
//   })
// });

const EVENT_UUID_RESULT = 'NEW UUID FOR THE EVENT';

const toStringStub = sinon.stub();
toStringStub.withArgs('hex').returns(EVENT_UUID_RESULT);

// const randomBytesStub = sinon.stub(crypto, 'randomBytes');
// randomBytesStub.withArgs(16).returns({ toString: toStringStub });

const kinesis = new AWS.Kinesis({ region: 'eu-west-1' });

describe('#emitEvent', () => {

  beforeEach(() => {
    putRecordsStub = sinon.stub(kinesis, 'putRecords').returns({
      promise: () => Promise.resolve({ FailedRecordCount: 0 }),
    });
    clock = sinon.useFakeTimers();
    createdAt = new Date();
  });

  afterEach(() => {
    putRecordsStub.restore();
    clock.restore();
  });

  const config = {
    appName: 'some name',
    kinesisStream: {
      resource: 'test-stream'
    }
  };

  let events = [{
    data: 'some data'
  }];


  describe('when calling emitEventsInBatches with kinesis, events, config', () => {
    it('calls putRecords on kinesis with right params', () => {
      emitEventsInBatches(kinesis, events, { ...config, type: 'BATCH'});
      expect(putRecordsStub).to.have.been.calledWith({
        Records: events.map((event) => (
          {
            Data: JSON.stringify(enrichMeta(event, config.appName)),
            PartitionKey: EVENT_UUID_RESULT
          }
        )),
        StreamName: 'test-stream'
      });
    });

    it('returns a promise', () => {
      expect(emitEventsInBatches(kinesis, events, config)).to.be.a('promise');
    });

    it('puts 2 records into Kinesis stream using 1 call to Kinesis', async () => {
      events.push({
        data: 'event 1'
      });

      emitEventsInBatches(kinesis, events, { ...config, type: 'BATCH'});
  
      expect(putRecordsStub).to.have.been.calledOnce;
    });

    it('puts 501 records into Kinesis stream using 2 calls to Kinesis', async () => {

      events = [...Array(501).keys()].map((num) => (
        { name: `event:${num}` }
      ));
  
      await emitEventsInBatches(kinesis, events, { ...config, type: 'BATCH'});
  
      expect(putRecordsStub).to.have.been.calledTwice;
  
      expect(putRecordsStub.args[0][0]).to.deep.equal({
        StreamName: 'test-stream',
        Records: events.slice(0, 500).map((event) => (
          {
            Data: JSON.stringify(enrichMeta(event, config.appName)),
            PartitionKey: EVENT_UUID_RESULT
          }
        )),
      });
  
      expect(putRecordsStub.args[1][0]).to.deep.equal({
        StreamName: 'test-stream',
        Records: events.slice(500, 501).map((event) => (
          {
            Data: JSON.stringify(enrichMeta(event, config.appName)),
            PartitionKey: EVENT_UUID_RESULT
          }
        )),
      });
    });
  });
});
