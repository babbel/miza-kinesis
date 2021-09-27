const crypto = require('crypto');

const HASH_RESULT = 'NEW HASH FOR THE EVENT';
const EVENT_UUID_RESULT = 'NEW UUID FOR THE EVENT';

const digestStub = sinon.stub();
digestStub.withArgs('hex').returns(HASH_RESULT);

const createHashStub = sinon.stub(crypto, 'createHash');
createHashStub.withArgs('md5').returns({
  update: () => ({
    digest: digestStub
  })
});

const toStringStub = sinon.stub();
toStringStub.withArgs('hex').returns(EVENT_UUID_RESULT);

const randomBytesStub = sinon.stub(crypto, 'randomBytes');
randomBytesStub.withArgs(16).returns({ toString: toStringStub });
