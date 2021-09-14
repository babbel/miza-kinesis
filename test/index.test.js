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
  './event': { 
    emitEvent: emitEventSpy, 
    emitEvents: emitEventsSpy 
  },
  './validate': validateSpy,
  './kinesis': () => kinesisSpy
});

describe('when calling #emitEvent', () => {
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

describe('when calling #emitEvents', () => {
  const config = {
    appName: 'some app name',
    kinesisStream: {
      arn: 'some arn',
      httpOptions: {
        connectTimeout: 1000,
        timeout: 1000
      },
      maxRetries: 10
    },
    type: 'BATCH'
  };

  it('calls validate', () => {
    setConfig(config);

    expect(validateSpy).to.have.been.calledWith(config);
  });

  it('thows an error if events is missing', () => {
    const sendEvent = setConfig(config);

    expect(() => sendEvent()).to.throw('Events needs to be an Array.');
  });

  it('thows an error if events is empty', () => {
    const sendEvent = setConfig(config);

    expect(() => sendEvent([])).to.throw('Events are missing.');
  });

  it('thows an error if events length is greater than 500', () => {
    const sendEvent = setConfig(config);

    expect(() => sendEvent([...Array(501).keys()])).to.throw('Events array can only have 500 records.');
  });

  it('calls emitEvent with right params', () => {
    const events = [{
      data: 'some data'
    },{
      data: 'some data'
    }];

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
      },
      type: 'BATCH'
    };

    const sendEvent = setConfig(config);
    sendEvent(events);

    expect(emitEventsSpy).to.have.been.calledWith(kinesisSpy, events, extendedConfig
    );
  });
});
