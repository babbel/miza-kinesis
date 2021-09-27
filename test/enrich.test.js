require('./test_helper'); 
const omit = require('lodash.omit');

const { enrichMeta, partitionKey } = require('../src/enrich');

const HASH_RESULT = 'NEW HASH FOR THE EVENT';
const EVENT_UUID_RESULT = 'NEW UUID FOR THE EVENT';

const event = { key: 'value' };
const config = {
  appName: 'some name',
  kinesisStream: {
    resource: 'test-stream'
  },
  maxRetries: 2
};

describe('when creating a PartitionKey', () => {
  describe('when no identifier is passed', () => {
    it('emits event with random PartitionKey', () => {
      const result = partitionKey(event)
      expect(result).to.equal(HASH_RESULT);
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
        const result = partitionKey(eventWithAllIdentifiers);

        expect(result).to.equal('user_uuid');
      });
    });

    context('when tracking_uuid, meta.udid and meta.event_uuid are set', () => {
      const event = omit(eventWithAllIdentifiers, ['uuid']);

      it('emits event with PartitionKey == event.tracking_uuid', () => {
        const result = partitionKey(event);
        expect(result).to.equal('user_tracking_uuid');
      });
    });

    context('when meta.udid and meta.event_uuid are set', () => {
      const event = omit(eventWithAllIdentifiers, ['uuid', 'tracking_uuid']);

      it('emits event with PartitionKey == event.meta.udid', () => {
        const result = partitionKey(event);
        expect(result).to.equal('mobile_device_udid')
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
        const result = partitionKey(event);
        expect(result).to.equal('event_uuid');
      });
    });
  });
});