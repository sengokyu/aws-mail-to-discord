import * as cdk from "aws-cdk-lib";
import { Effect, PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { BlockPublicAccess, Bucket, IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface S3BucketStackProps extends cdk.StackProps {
  bucketName: string;
}

/**
 * Create a S3 Bucket
 */
export class S3BucketStack extends cdk.Stack {
  public readonly bucket: IBucket;

  constructor(scope: Construct, id: string, props: S3BucketStackProps) {
    super(scope, id, props);

    this.bucket = this.createBucket(props.bucketName);

    this.setupBucketPolicy();
  }

  private createBucket(bucketName: string) {
    return new Bucket(this, bucketName, {
      bucketName,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
  }

  private setupBucketPolicy() {
    // Allow PutObject from SES
    this.bucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["s3:PutObject"],
        principals: [new ServicePrincipal("ses.amazonaws.com")],
        resources: [`${this.bucket.bucketArn}/*`],
        conditions: {
          StringEquals: { "AWS:SourceAccount": this.account },
        },
      })
    );
  }

  grantAccessFor(lambdaFunction: IFunction): void {
    // Grant access
    this.bucket.grantRead(lambdaFunction);
    this.bucket.grantDelete(lambdaFunction);
  }
}
