require('./test_helper'); 

const EVENT_UUID_RESULT = 'NEW UUID FOR THE EVENT';

const AWS = require('aws-sdk');
const kinesis = new AWS.Kinesis({ region: 'eu-west-1' });

const emitEvent = require('../src/event');

const promise = sinon.stub().resolves();
const putRecordStub = sinon.stub(kinesis, 'putRecord').returns({ promise });

describe('#emitEvent', () => {
  const config = {
    appName: 'some name',
    kinesisStream: {
      resource: 'test-stream'
    },
    maxRetries: 2
  };

  describe('when calling emitEvent with kinesis, event, config', () => {
    const event = {
      data: 'some data'
    };

    it('calls putRecord on kinesis with right params', () => {
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

      emitEvent(kinesis, event, config);
        expect(putRecordStub).to.have.been.calledWith({
          Data: JSON.stringify(enrichedEvent),
          PartitionKey: EVENT_UUID_RESULT,
          StreamName: 'test-stream'
        });
        clock.restore();
      });

      it('returns a promise', () => {
        expect(emitEvent(kinesis, event, config)).to.be.a('promise');
      });
  });

  describe('when calling emitEvent with PartitionKey in config', () => {
    const event = {
      data: 'event data'
    };

    it('calls putRecord on kinesis with the PartitionKey in config', () => {
      const clock = sinon.useFakeTimers();
      const config = {
        appName: 'test-app',
        partitionKey: 'uuid',
        kinesisStream: {
          resource: 'test-stream'
        }
      };

      const createdAt = new Date();
      const enrichedEvent = {
        created_at: createdAt,
        data: 'event data',
        meta:
        { created_at: createdAt,
          event_uuid: EVENT_UUID_RESULT,
          producer: 'test-app',
          user_agent: 'miza-kinesis'
        },
      };

      emitEvent(kinesis, event, config);
        expect(putRecordStub).to.have.been.calledWith({
          Data: JSON.stringify(enrichedEvent),
          PartitionKey: 'uuid',
          StreamName: 'test-stream'
        });
        clock.restore();
      });


      it('calls putRecord on kinesis with event uuid when PartitionKey is undefined', () => {
        const clock = sinon.useFakeTimers();
        const config = {
          appName: 'test-app',
          kinesisStream: {
            resource: 'test-stream'
          }
        };
  
        const createdAt = new Date();
        const enrichedEvent = {
          created_at: createdAt,
          data: 'event data',
          meta:
          { created_at: createdAt,
            event_uuid: EVENT_UUID_RESULT,
            producer: 'test-app',
            user_agent: 'miza-kinesis' 
          }
        };
  
        emitEvent(kinesis, event, config);
          expect(putRecordStub).to.have.been.calledWith({
            Data: JSON.stringify(enrichedEvent),
            PartitionKey: EVENT_UUID_RESULT,
            StreamName: 'test-stream'
          });
          clock.restore();
        });
  });
});
