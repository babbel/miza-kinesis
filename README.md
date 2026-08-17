# Miza-Kinesis

Provides an interface to create tracking events which are sent to AWS Kinesis.

## Requirements

- [Nodejs](https://nodejs.org/en/download/) >= 18 with NPM version >= 10

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

Config to track single event:

```js
const config = {
  appName: 'application-name',
  kinesisStream: {
    arn: 'Kinesis arn',
    connectionTimeout: 1000,
    timeout: 5000,
    maxRetries: 2,
  },
  ipv4: '127.0.0.1', // optional
  endpoint: 'http://localhost:4568', // localstack only
};
```

Code Example:

```js
const events = require('@babbel/miza-kinesis');

const emitEvent = events(config);

const event = {
  name: 'request:performed',
  meta: {
    // ...
  },
  // ... more
};

try {
  const data = await emitEvent(event);
  console.log(data)
}
catch(error) {
  console.error(error);
}

```

Config to track multiple events:

```js
const config = {
  appName: 'application-name',
  kinesisStream: {
    arn: 'Kinesis arn',
    connectionTimeout: 1000,
    timeout: 5000,
    maxRetries: 2, // transport-level, by the AWS SDK (3 tries)
  },
  // Application-level, and it also retries partial PutRecords failures.
  // Multiplies with the above: 3 x 2 = up to 6 requests.
  maxRetries: 1,
  ipv4: '127.0.0.1', // optional
  endpoint: 'http://localhost:4568', // localstack only
  type: 'BATCH',
};
```

Code Example:

```js
const events = require('@babbel/miza-kinesis');

const emitEvent = events(config);

const events = [
  {
    name: 'request:performed',
    meta: {
      // ...
    },
  },
  {
    name: 'data:saved',
    meta: {
      // ...
    },
  },
];

try {
  const data = await emitEvent(event);
  console.log(data)
}
catch(error) {
  console.error(error);
}
```

Config has a following format:

- `appName` - **required** added to the events meta data to give notice of it's origin
- `kinesisStream.arn` - **required** Kinesis ARN where the events will be send
- `kinesisStream.connectionTimeout` - _optional_ milliseconds to wait for a socket connection, passed to the SDK's request handler
- `kinesisStream.timeout` - _optional_ milliseconds to wait for a response, passed to the SDK's request handler as `requestTimeout`
- `kinesisStream.maxRetries` - _optional_ transport-level retries, performed by the AWS SDK with exponential backoff and jitter. Translated to the SDK's `maxAttempts` as `maxRetries + 1`. When unset, the SDK resolves `AWS_MAX_ATTEMPTS`, then the shared config's `max_attempts`, then its own default of 3.
- `kinesisStream.maxAttempts` - _optional_ total transport-level tries, in the SDK's own units. Takes precedence over `kinesisStream.maxRetries`.
- `config.maxRetries` - _optional_ application-level retries of the whole emit, wrapping the SDK's. These have **no backoff**, but on the `BATCH` path they also retry partial `PutRecords` failures (a `200` carrying per-record `ErrorCode`s), which the SDK cannot see. Defaults to 0.

The two retry layers **multiply** rather than add — the request count is
`(kinesisStream.maxRetries + 1) x (config.maxRetries + 1)`. Budget them
together, and mind the caller's own deadline: on a stream that keeps failing,
`kinesisStream.maxRetries: 10` alone takes ~41s to exhaust its 11 attempts,
which will outlive a default Lambda timeout.
- `ipv4` - _optional_ ip of the machine that is sending the event
- `endpoint` - **localstack-only** we recommend to run the service in development environment using Localstack. Kinesis (from Localstack) will respond at the location `http://localhost:4568`. In order to work with Kinesis, you need to provide the location(endpoint) to the AWS-sdk configuration.
- `partitionKey` - **optional** the key used to group data by shard within a stream.

`emitEvent` returns data in either of the following format: [`PutRecordCommandOutput`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-kinesis/Interface/PutRecordCommandOutput/) or [`PutRecordsCommandOutput`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-kinesis/Interface/PutRecordsCommandOutput/)

`event` specification you can check here: https://confluence.internal.babbel.com/wiki/display/PM/Event+Specifications

`events` array of events

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
   1. New versions are automatically published to npm on every merge to `master`

## License

MIT Licensed. See [LICENSE](https://github.com/babbel/mize-kinesis/blob/master/LICENSE) for full details.
