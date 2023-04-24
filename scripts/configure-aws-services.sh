#!/bin/bash

set -o nounset

kinesis_endpoint="http://localhost:4567"
aws_cmd="aws --region="""eu-west-1""" "

stream_exists=$($aws_cmd kinesis list-streams --endpoint-url="$kinesis_endpoint" | grep -c "kinesis-test")
if [ "$stream_exists" -eq 0 ]; then
  $aws_cmd kinesis create-stream  \
    --endpoint-url="$kinesis_endpoint" \
    --stream-name kinesis-test \
    --shard-count 1

  if [ $? -ne 0 ]; then
    echo "There was an error creating your kinesis stream"
    exit 100
  fi
  echo "The Kinesis stream kinesis-test didn't exist and was successfully created"
else
  echo "The Kinesis stream kinesis-test already exists"
fi
