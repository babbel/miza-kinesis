# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
