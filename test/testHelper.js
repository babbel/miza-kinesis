const chai = require("chai");
global.expect = chai.expect;

global.proxyquire = require("proxyquire");

global.sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const chaiExclude = require("chai-exclude");
chai.use(chaiExclude);

process.env.TRUSTED_PROXIES = "127.0.0.1";
process.env.KINESIS_STREAM_ARN =
  "arn:aws:kinesis:us-east-1:111122223333:exampleStreamName";
