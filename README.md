Miza-Kinesis
===========

Provides an interface to create tracking events which are sent to AWS Kinesis.

Requirements
------------

- [Nodejs](https://nodejs.org/en/download/) 12.13 with NPM version 6.12

## Development

Install dependencies:

```bash
npm install @babbel/miza-kinesis --save
```

## Build

```bash
npm run build
```

## Tests

```bash
npm test
```

## Usage
To track events:

```js
const events = require('@babbel/miza-kinesis');

const config = {
  appName: 'application-name',
  kinesisStream: {
    arn: 'Kinesis arn',
    httpOptions: {
      connectTimeout: 1000,
      timeout: 1000
    },
    maxRetries: 10
  },
  endpoint: 'http://localhost:4568' // localstack only
};

const emitEvent = events(config);

const event = {
  name: 'request:performed',
  meta: {
    // ...
  }
  // ... more
};

emitEvent(event)
  .then((data) => console.log(data))
  .catch((error) => console.log(error));
```
Config has a following format:
* `appName` - **required** added to the events meta data to give notice of it's origin
* `kinesisStream.arn` - **required** Kinesis ARN where the events will be send
* `kinesisStream.httpOptions` - *optional* specified in AWS SDK https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Kinesis.html
* `kinesisStream.maxRetries` - **optional** the maximum amount of retries to attempt with a request. See AWS.Kinesis.maxRetries for more information.
* `endpoint` - **localstack-only** we recommend to run the service in development environment using Localstack. Kinesis (from Localstack) will respond at the location `http://localhost:4568`. In order to work with Kinesis, you need to provide the location(endpoint) to the AWS-sdk configuration.
* `partitionKey` - **optional** the key used to group data by shard within a stream.

`emitEvent` returns data in following format: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Kinesis.html#putRecord-property
`event` specification you can check here: https://confluence.internal.babbel.com/wiki/display/PM/Event+Specifications

## Releasing new versions

In order to create a release:

1. Add details about changes in `CHANGELOG.md`
1. Version the new changes
    - Manual version update:
        1. Update the version in `package.json` of your feature branch
        1. Tag the last commit with the new version
            1. `git tag v1.x.x`
            1. `git push origin v1.x.x`
    - Automatic version update:
        1. Use [`npm version`](https://docs.npmjs.com/cli/version)
1. Merge to master!
    1. New versions are automatically published to Gemfury on every merge to `master`

## License

MIT Licensed. See [LICENSE](https://github.com/babbel/mize-kinesis/blob/master/LICENSE) for full details.
