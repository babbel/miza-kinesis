// const omit = require('lodash.omit');
// const AWS = require('aws-sdk');
// const crypto = require('crypto');
// const { emitEvent, emitEvents } = require('../src/event');

// const HASH_RESULT = 'NEW HASH FOR THE EVENT';

// const digestStub = sinon.stub();
// digestStub.withArgs('hex').returns(HASH_RESULT);

// const createHashStub = sinon.stub(crypto, 'createHash');
// createHashStub.withArgs('md5').returns({
//   update: () => ({
//     digest: digestStub
//   })
// });

// const EVENT_UUID_RESULT = 'NEW UUID FOR THE EVENT';

// const toStringStub = sinon.stub();
// toStringStub.withArgs('hex').returns(EVENT_UUID_RESULT);

// const randomBytesStub = sinon.stub(crypto, 'randomBytes');
// randomBytesStub.withArgs(16).returns({ toString: toStringStub });

// const kinesis = new AWS.Kinesis({ region: 'eu-west-1' });

// const promise = sinon.stub().resolves();
// const putRecordStub = sinon.stub(kinesis, 'putRecord').returns({ promise });
// const putRecordsStub = sinon.stub(kinesis, 'putRecords').returns({ promise });

// describe('#emitEvent', () => {
//   const config = {
//     appName: 'some name',
//     kinesisStream: {
//       resource: 'test-stream'
//     }
//   };

//   describe('when calling emitEvent with kinesis, event, config', () => {
//     const event = {
//       data: 'some data'
//     };

//     it('calls putRecord on kinesis with right params', () => {
//       const clock = sinon.useFakeTimers();

//       const createdAt = new Date();
//       const enrichedEvent = {
//         created_at: createdAt,
//         data: 'some data',
//         meta:
//         { created_at: createdAt,
//           event_uuid: EVENT_UUID_RESULT,
//           producer: 'some name',
//           user_agent: 'miza-kinesis'
//         }
//       };

//         emitEvent(kinesis, event, config);
//         expect(putRecordStub).to.have.been.calledWith({
//           Data: JSON.stringify(enrichedEvent),
//           PartitionKey: EVENT_UUID_RESULT,
//           StreamName: 'test-stream'
//         });
//         clock.restore();
//       });

//       it('returns a promise', () => {
//         expect(emitEvent(kinesis, event, config)).to.be.a('promise');
//       });
//   });

//   describe('when calling emitEvents with kinesis, events, config', () => {
//     const events = [{
//       data: 'some data'
//     }];

//     it('calls putRecords on kinesis with right params', () => {
//       const clock = sinon.useFakeTimers();

//       const createdAt = new Date();
//       const enrichedEvent = {
//         created_at: createdAt,
//         data: 'some data',
//         meta:
//         { created_at: createdAt,
//           event_uuid: EVENT_UUID_RESULT,
//           producer: 'some name',
//           user_agent: 'miza-kinesis'
//         }
//       };

//       emitEvents(kinesis, events, { ...config, type: 'BATCH'});
//       expect(putRecordsStub).to.have.been.calledWith({
//         Records: [{
//           Data: JSON.stringify(enrichedEvent),
//           PartitionKey: EVENT_UUID_RESULT
//         }],
//         StreamName: 'test-stream'
//       });
//       clock.restore();
//     });

//     it('returns a promise', () => {
//       expect(emitEvent(kinesis, events, config)).to.be.a('promise');
//     });
//   });

//   describe('when calling emitEvent with PartitionKey in config', () => {
//     const event = {
//       data: 'event data'
//     };

//     it('calls putRecord on kinesis with the PartitionKey in config', () => {
//       const clock = sinon.useFakeTimers();
//       const config = {
//         appName: 'test-app',
//         partitionKey: 'uuid',
//         kinesisStream: {
//           resource: 'test-stream'
//         }
//       };

//       const createdAt = new Date();
//       const enrichedEvent = {
//         created_at: createdAt,
//         data: 'event data',
//         meta:
//         { created_at: createdAt,
//           event_uuid: EVENT_UUID_RESULT,
//           producer: 'test-app',
//           user_agent: 'miza-kinesis'
//         },
//       };

//         emitEvent(kinesis, event, config);
//         expect(putRecordStub).to.have.been.calledWith({
//           Data: JSON.stringify(enrichedEvent),
//           PartitionKey: 'uuid',
//           StreamName: 'test-stream'
//         });
//         clock.restore();
//       });


//       it('calls putRecord on kinesis with event uuid when PartitionKey is undefined', () => {
//         const clock = sinon.useFakeTimers();
//         const config = {
//           appName: 'test-app',
//           kinesisStream: {
//             resource: 'test-stream'
//           }
//         };
  
//         const createdAt = new Date();
//         const enrichedEvent = {
//           created_at: createdAt,
//           data: 'event data',
//           meta:
//           { created_at: createdAt,
//             event_uuid: EVENT_UUID_RESULT,
//             producer: 'test-app',
//             user_agent: 'miza-kinesis' 
//           }
//         };
  
//           emitEvent(kinesis, event, config);
//           expect(putRecordStub).to.have.been.calledWith({
//             Data: JSON.stringify(enrichedEvent),
//             PartitionKey: EVENT_UUID_RESULT,
//             StreamName: 'test-stream'
//           });
//           clock.restore();
//         });
//   });

//   describe('when creating a PartitionKey', () => {
//     describe('when no identifier is passed', () => {
//       const event = { key: 'value' };

//       it('emits event with random PartitionKey', () => {
//         toStringStub.withArgs('hex').returns(null);

//         emitEvent(kinesis, event, config);
//         expect(putRecordStub).to.have.been.calledWithMatch(
//           { PartitionKey: HASH_RESULT });
//         });
//     });

//     const eventWithAllIdentifiers = {
//       key: 'value',
//       uuid: 'user_uuid',
//       tracking_uuid: 'user_tracking_uuid',
//       meta: {
//         udid: 'mobile_device_udid',
//         event_uuid: 'event_uuid'
//       }
//     };

//     context('when uuid, tracking_uuid, meta.udid and meta.event_uuid are set', () => {
//       it('emits event with PartitionKey == event.uuid', () => {
//         const event = eventWithAllIdentifiers;
//         emitEvent(kinesis, event, config);

//         expect(putRecordStub).to.have.been.calledWithMatch(
//           { PartitionKey: 'user_uuid' });
//       });
//     });

//     context('when tracking_uuid, meta.udid and meta.event_uuid are set', () => {
//       const event = omit(eventWithAllIdentifiers, ['uuid']);

//       it('emits event with PartitionKey == event.tracking_uuid', () => {
//         emitEvent(kinesis, event, config);
//         expect(putRecordStub).to.have.been.calledWithMatch(
//           { PartitionKey: 'user_tracking_uuid' });
//       });
//     });

//     context('when meta.udid and meta.event_uuid are set', () => {
//       const event = omit(eventWithAllIdentifiers, ['uuid', 'tracking_uuid']);

//       it('emits event with PartitionKey == event.meta.udid', () => {
//         emitEvent(kinesis, event, config);
//         expect(putRecordStub).to.have.been.calledWithMatch(
//           { PartitionKey: 'mobile_device_udid' });
//       });
//     });

//     context('when meta.event_uuid is set', () => {
//       const event = {
//         key: 'value',
//         meta: {
//           event_uuid: 'event_uuid'
//         }
//       };

//       it('emits event with PartitionKey == event.meta.event_uuid', () => {
//         emitEvent(kinesis, event, config);
//         expect(putRecordStub).to.have.been.calledWithMatch(
//           { PartitionKey: 'event_uuid' });
//       });
//     });
//   });
// });
