const { chunk, omit } = require("lodash");
const { enrichMeta, partitionKey } = require("./enrich");
const { PutRecordsCommand } = require("@aws-sdk/client-kinesis");

// Each PutRecords request can support up to 500 records.
// https://docs.aws.amazon.com/kinesis/latest/APIReference/API_PutRecords.html
const MAX_RECORDS = 500;

const enrichRecords = (events, config) => {
  return events.map((event) => {
    const enrichedEvent = enrichMeta(event, config.appName, config.ipv4);
    return {
      Data: Buffer.from(JSON.stringify(enrichedEvent)),
      PartitionKey: config.partitionKey || partitionKey(enrichedEvent),
    };
  });
};

const emitEvents = async (kinesis, records, config, retries) => {
  const params = {
    Records: records,
    StreamName: config.kinesisStream.resource,
  };

  const putRecordCommand = new PutRecordsCommand(params);

  try {
    const { FailedRecordCount, Records } = await kinesis.send(putRecordCommand);

    if (FailedRecordCount !== 0) {
      const failedEvents = [];
      Records.forEach((failedRecord, index) => {
        if (failedRecord.ErrorCode) {
          failedEvents.push({
            failedRecord: records[index],
            failedEvent: JSON.parse(records[index].Data),
            failureMessage: `${failedRecord.ErrorCode}: ${failedRecord.ErrorMessage}`,
          });
        }
      });

      if (retries === 0)
        throw failedEvents.map((failed) => omit(failed, ["failedRecord"]));

      return await emitEvents(
        kinesis,
        failedEvents.map((failed) => failed.failedRecord),
        config,
        retries - 1
      );
    }

    return Records;
  } catch (error) {
    if (retries === 0) throw error;
    return await emitEvents(kinesis, records, config, retries - 1);
  }
};

module.exports = (kinesis, events, config) => {
  const retries = config.maxRetries || 0;
  const emitEventsPromises = chunk(events, MAX_RECORDS).map((chunkedEvents) => {
    const enrichedRecords = enrichRecords(chunkedEvents, config);
    return emitEvents(kinesis, enrichedRecords, config, retries);
  });
  return Promise.allSettled(emitEventsPromises);
};
