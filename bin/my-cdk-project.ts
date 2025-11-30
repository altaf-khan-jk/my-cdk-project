#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MyCdkProjectStack } from '../lib/my-cdk-project-stack';

const app = new cdk.App();
new MyCdkProjectStack(app, 'MyCdkProjectStack', {
  /* you can set env here, for example:
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
  */
});
