// Type definitions for miza-kinesis
// Project: Babbel
import {
  PutRecordCommandOutput,
  PutRecordsResultEntry,
} from "@aws-sdk/client-kinesis";

export = Events;

declare function Events(config: Events.Config): Events.EmitEvent;

declare namespace Events {
  interface Config {
    appName: string;
    kinesisStream: {
      arn: string;
      region?: string;
      /**
       * Transport-level retries, handled by the AWS SDK with exponential
       * backoff and jitter. Translated to `maxAttempts` (= maxRetries + 1).
       * Unset, the SDK resolves `AWS_MAX_ATTEMPTS`, then the shared config's
       * `max_attempts`, then its default of 3.
       */
      maxRetries?: number;
      /** Total transport-level tries. Takes precedence over `maxRetries`. */
      maxAttempts?: number;
      timeout?: number;
      connectionTimeout?: number;
    };
    /**
     * Application-level retries of the whole emit, wrapping the SDK's. No
     * backoff. On the `BATCH` path this also retries partial `PutRecords`
     * failures, which the SDK cannot see. Defaults to 0.
     *
     * Multiplies with `kinesisStream.maxRetries` rather than adding to it:
     * requests = (kinesisStream.maxRetries + 1) * (maxRetries + 1).
     */
    maxRetries?: number;
    endpoint?: string;
    partitionKey?: string;
    ipv4?: string;
    type?: string;
  }

  interface EventSchema {
    name: string;
    [key: string]: unknown; // dependent on the specific event schema
  }

  type EmitEvent = <T extends EventSchema>(
    event: T | T[]
  ) => Promise<
    | PutRecordCommandOutput
    | PromiseSettledResult<Awaited<PutRecordsResultEntry[]>>[]
  >;
}
