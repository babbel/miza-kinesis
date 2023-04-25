# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
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
