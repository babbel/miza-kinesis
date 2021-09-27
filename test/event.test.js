require('./test_helper'); 

const HASH_RESULT = 'NEW HASH FOR THE EVENT';
const EVENT_UUID_RESULT = 'NEW UUID FOR THE EVENT';

const omit = require('lodash.omit');
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

  describe('when creating a PartitionKey', () => {
    describe('when no identifier is passed', () => {
      const event = { key: 'value' };
      
      // it('emits event with random PartitionKey', () => {
      //   toStringStub.withArgs('hex').returns(null);

      //   emitEvent(kinesis, event, config);
      //   expect(putRecordStub).to.have.been.calledWithMatch(
      //     { PartitionKey: HASH_RESULT });
      //   });
    });

    const eventWithAllIdentifiers = {
      key: 'value',
      uuid: 'user_uuid',
      tracking_uuid: 'user_tracking_uuid',
      meta: {
        udid: 'mobile_device_udid',
        event_uuid: 'event_uuid'
      }
    };

    context('when uuid, tracking_uuid, meta.udid and meta.event_uuid are set', () => {
      it('emits event with PartitionKey == event.uuid', () => {
        const event = eventWithAllIdentifiers;
        emitEvent(kinesis, event, config);

        expect(putRecordStub).to.have.been.calledWithMatch(
          { PartitionKey: 'user_uuid' });
      });
    });

    context('when tracking_uuid, meta.udid and meta.event_uuid are set', () => {
      const event = omit(eventWithAllIdentifiers, ['uuid']);

      it('emits event with PartitionKey == event.tracking_uuid', () => {
        emitEvent(kinesis, event, config);
        expect(putRecordStub).to.have.been.calledWithMatch(
          { PartitionKey: 'user_tracking_uuid' });
      });
    });

    context('when meta.udid and meta.event_uuid are set', () => {
      const event = omit(eventWithAllIdentifiers, ['uuid', 'tracking_uuid']);

      it('emits event with PartitionKey == event.meta.udid', () => {
        emitEvent(kinesis, event, config);
        expect(putRecordStub).to.have.been.calledWithMatch(
          { PartitionKey: 'mobile_device_udid' });
      });
    });

    context('when meta.event_uuid is set', () => {
      const event = {
        key: 'value',
        meta: {
          event_uuid: 'event_uuid'
        }
      };

      it('emits event with PartitionKey == event.meta.event_uuid', () => {
        emitEvent(kinesis, event, config);
        expect(putRecordStub).to.have.been.calledWithMatch(
          { PartitionKey: 'event_uuid' });
      });
    });
  });
});
