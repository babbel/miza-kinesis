# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- `kinesisStream.maxRetries` now reaches the Kinesis client again.

  AWS SDK v2 took `maxRetries`; v3 renamed it to `maxAttempts` and ignores
  unknown config keys. The v3 upgrade in 4.0.0 kept passing `maxRetries`, so
  from 4.0.0 through 6.0.0 the option was **silently dead** and every consumer
  ran on the SDK default of 3 attempts.

  **This is a breaking behavioural change** — the option starts taking effect,
  in both directions:

  | Config | 4.0.0 - 6.0.0 | Now |
  | --- | --- | --- |
  | `maxRetries: 10` | 3 attempts | 11 attempts |
  | `maxRetries: 2` | 3 attempts | 3 attempts |
  | `maxRetries: 0` | 3 attempts | 1 attempt |

  Review your value before upgrading. High values now mean a much longer
  failure path (mind Lambda timeouts), and an explicit `0` now really does
  disable retries. Leave it unset to keep the SDK default, which can also be
  tuned with the `AWS_MAX_ATTEMPTS` environment variable.

### Added
- `kinesisStream.maxAttempts` - set the SDK's retry budget in its own units
  (total tries). Takes precedence over `kinesisStream.maxRetries`.

### Changed
- `index.d.ts` now declares the top-level `maxRetries` option. It has always
  been read by `emitEvent`/`emitEventsInBatches` and documented in the README,
  but was missing from the types, so consumers following the type definitions
  nested it under `kinesisStream` where the application-level retry loop never
  saw it.
- README: replaced the leftover SDK v2 `httpOptions`/`connectTimeout` config
  examples with the `connectionTimeout`/`timeout` keys actually read, and
  documented the two retry layers and how they differ.
- `test/unit/kinesis.test.js` now asserts the resolved client config. It
  previously deep-compared the client against one built from the same object,
  so it passed for any key name — including one the SDK ignores, which is how
  this bug survived the v3 upgrade.

## [6.0.0]

### Chore
- Update dependencies `@aws-sdk/client-kinesis` and `@smithy/node-http-handler`  
  This bumps the minimum supported Node version to 18

### Added
- Support for Node >= 18

### Removed

- Support for Node < 18

## [5.0.1]

### Fix
- Tag the correct commit

## [5.0.0]

*This release might be broken, please upgrade to 5.0.1*

### Chore
- Update dependencies `@aws-sdk/client-kinesis` and `@smithy/node-http-handler`  
  This bumps the minimum supported Node version to 16

### Added
- Support for Node >= 16

### Removed

- Support for Node < 16


## [4.0.5]

### Chore
- Update dependencies `@aws-sdk/client-kinesis` and `@smithy/node-http-handler`

## [4.0.4]

### Chore
- Replace deprecated `@aws-sdk/node-http-handler` with `@smithy/node-http-handler`
- Update `@aws-sdk/client-kinesis`

## [4.0.3]

### Fixed
- Use [`PutRecords`](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_PutRecords.html) instead of `PutRecord` when emitting events in batches, and return the output of operation in the settled Promise results
- Send batch payloads as `Buffer` similar to when emitting a single event
- Update type declarations after configuration changes in 4.x

## [4.0.2]

### Fix
- Timeout was not working as expected

## [4.0.1]

### Fix
- CI build actually runs integration tests
- Fix internal behaviour with buffer

## [4.0.0]

*This release might be broken, please upgrade to 4.0.1*

### Added
- Support for AWS SDK 3

### Removed

- Support for AWS SDK 2

## [3.0.0]

### Changed

- Bump version in most of the packages
- Add official support for newer versions of node
- Use the new version of package-lock json

### Added
- Add integration tests for kinesis, now the code is tested against a  fake kinesis stream (internal prerequisite for AWS v3 update)

### Removed

- Drop node v12

## [2.0.1]

### Fixed

- Fix require of Kinesis client

## [2.0.0]

### Added

- Support retrying of failed requests
- Transparently handle kinesis limit of 500 events at once

## [1.11.0]

### Added

- Add support for batch emitting of events

## [1.0.10]

### Fixed

- Auto releases on tag creation

## [1.0.9]

### Added

- Type declarations

## [1.0.8]

- Extend github workflows to test against multiple nodejs versions

## [1.0.7]
