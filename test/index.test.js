const arnParserSpy = sinon.spy(() => ({
  region: 'test-region',
  resource: 'test-stream'
}));

const emitEventSpy = sinon.stub();

const validateSpy = sinon.stub();

const kinesisSpy = sinon.spy();

const setConfig = proxyquire('../src/index', {
  './arnParser': {
    parse: arnParserSpy
  },
  './event': emitEventSpy,
  './validate': validateSpy,
  './kinesis': () => kinesisSpy
});

describe('when calling events.js', () => {
  const config = {
    appName: 'some app name',
    kinesisStream: {
      arn: 'some arn',
      httpOptions: {
        connectTimeout: 1000,
        timeout: 1000
      },
      maxRetries: 10
    }
  };

  it('calls validate', () => {
    setConfig(config);

    expect(validateSpy).to.have.been.calledWith(config);
  });

  it('thows an error if event is missing', () => {
    const sendEvent = setConfig(config);

    expect(() => sendEvent()).to.throw('Event is missing.');
  });

  it('calls emitEvent with right params', () => {
    const event = {
      data: 'some data'
    };

    const extendedConfig = {
      appName: 'some app name',
      kinesisStream: {
        arn: 'some arn',
        httpOptions: {
          connectTimeout: 1000,
          timeout: 1000
        },
        maxRetries: 10,
        region: 'test-region',
        resource: 'test-stream'
      }
    };

    const sendEvent = setConfig(config);
    sendEvent(event);

    expect(emitEventSpy).to.have.been.calledWith(kinesisSpy, event, extendedConfig
    );
  });
});
