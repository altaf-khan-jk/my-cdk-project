import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';

export class MyCdkProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket
    const myBucket = new s3.Bucket(this, 'MyFirstBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // dev/test only
      autoDeleteObjects: true,                  // dev/test only
    });

    // DynamoDB table
    const myTable = new dynamodb.Table(this, 'MyTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // avoid capacity mgmt (keeps within free-tier if small)
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: 'MyTable',
    });

    // Lambda function
    const myLambda = new lambda.Function(this, 'MyLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        BUCKET_NAME: myBucket.bucketName,
        TABLE_NAME: myTable.tableName,
      },
      timeout: cdk.Duration.seconds(10),
      memorySize: 128
    });

    // Grant Lambda permissions to read/write to bucket and table
    myBucket.grantReadWrite(myLambda);
    myTable.grantReadWriteData(myLambda);

    // Optional: trigger Lambda on object create in bucket
    myBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(myLambda));

    // Outputs for easy verification
    new cdk.CfnOutput(this, 'BucketNameOutput', { value: myBucket.bucketName });
    new cdk.CfnOutput(this, 'TableNameOutput', { value: myTable.tableName });
    new cdk.CfnOutput(this, 'LambdaNameOutput', { value: myLambda.functionName });
  }
}
