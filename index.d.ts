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
      maxRetries?: number;
      timeout?: number;
      connectionTimeout?: number;
    };
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
