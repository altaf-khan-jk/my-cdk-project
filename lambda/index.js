const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async function(event) {
  console.log('Event:', JSON.stringify(event, null, 2));

  // If triggered by S3, read the object key
  let key;
  if (event.Records && event.Records[0].s3) {
    key = event.Records[0].s3.object.key;
  }

  const tableName = process.env.TABLE_NAME;
  const bucketName = process.env.BUCKET_NAME;

  // Put a simple item in DynamoDB as a demo
  const item = {
    id: `${Date.now()}`,
    source: 'lambda-demo',
    s3Key: key || 'none'
  };

  try {
    await dynamo.put({
      TableName: tableName,
      Item: item
    }).promise();

    console.log('Wrote item to DynamoDB', item);
  } catch (err) {
    console.error('DynamoDB error', err);
    throw err;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success', item })
  };
};
