const omit = require('lodash.omit');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const emitEventsInBatches = require('../src/emitEventsInBatches');

const HASH_RESULT = 'NEW HASH FOR THE EVENT';

const digestStub = sinon.stub();
digestStub.withArgs('hex').returns(HASH_RESULT);

const createHashStub = sinon.stub(crypto, 'createHash');
createHashStub.withArgs('md5').returns({
  update: () => ({
    digest: digestStub
  })
});

const EVENT_UUID_RESULT = 'NEW UUID FOR THE EVENT';

const toStringStub = sinon.stub();
toStringStub.withArgs('hex').returns(EVENT_UUID_RESULT);

const randomBytesStub = sinon.stub(crypto, 'randomBytes');
randomBytesStub.withArgs(16).returns({ toString: toStringStub });

const kinesis = new AWS.Kinesis({ region: 'eu-west-1' });

const promise = sinon.stub().resolves();
const putRecordStub = sinon.stub(kinesis, 'putRecord').returns({ promise });
const putRecordsStub = sinon.stub(kinesis, 'putRecords').returns({ promise });

describe('#emitEvent', () => {
  const config = {
    appName: 'some name',
    kinesisStream: {
      resource: 'test-stream'
    }
  };

  describe('when calling emitEventsInBatches with kinesis, events, config', () => {
    const events = [{
      data: 'some data'
    }];

    it('calls putRecords on kinesis with right params', () => {
      const clock = sinon.useFakeTimers();

      const createdAt = new Date();
      const enrichedEvent = {
        created_at: createdAt,
        data: 'some data',
        meta:
        { created_at: createdAt,
          event_uuid: EVENT_UUID_RESULT,
          producer: 'some name',
          user_agent: 'miza-kinesis'
        }
      };

      emitEventsInBatches(kinesis, events, { ...config, type: 'BATCH'});
      expect(putRecordsStub).to.have.been.calledWith({
        Records: [{
          Data: JSON.stringify(enrichedEvent),
          PartitionKey: EVENT_UUID_RESULT
        }],
        StreamName: 'test-stream'
      });
      clock.restore();
    });

    it('returns a promise', () => {
      expect(emitEventsInBatches(kinesis, events, config)).to.be.a('promise');
    });
  });
});
