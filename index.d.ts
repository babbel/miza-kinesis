// Type definitions for miza-kinesis
// Project: Babbel

export = Events;

declare function Events(config: Events.Config): Events.EmitEvent;

declare namespace Events {
  interface Config {
    appName: string;
    kinesisStream: {
      arn: string;
      region?: string;
      maxRetries?: number;
      httpOptions?: AWS.HTTPOptions;
    };
    endpoint?: string;
    partitionKey?: string;
    ipv4?: string;
  }

  interface EventSchema {
    name: string;
    [key: string]: unknown; // dependent on the specific event schema
  }

  type EmitEvent = (event: EventSchema) => ReturnType<
    AWS.Request<AWS.Kinesis.Types.PutRecordOutput, AWS.AWSError>['promise']
  >;
}
