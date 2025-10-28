import { Construct } from "constructs";
import { Architecture, FileSystem, Runtime } from "aws-cdk-lib/aws-lambda";
import { ISearchCollection } from "./search.collection.js";
import { NodejsFunction, NodejsFunctionProps, SourceMapMode } from "aws-cdk-lib/aws-lambda-nodejs";
import { Duration } from "aws-cdk-lib/core";

export type SearchFunctionProps = NodejsFunctionProps & {
	collection: ISearchCollection;
};

/**
 * SearchFunction sets up a Lambda function configured to work with a Search collection,
 * including mounting the EFS file system and setting appropriate permissions.
 */
export class SearchFunction extends NodejsFunction {
	constructor(scope: Construct, id: string, props: SearchFunctionProps) {
		const { functionName, collection, memorySize, ...properties } = props;

		super(scope, id, {
			functionName: functionName,
			memorySize: memorySize || 3008,
			allowPublicSubnet: true,
			architecture: Architecture.X86_64,
			runtime: Runtime.NODEJS_20_X,
			filesystem: FileSystem.fromEfsAccessPoint(collection.accessPoint, "/mnt/search"),
			timeout: Duration.seconds(30),
			vpc: collection.vpc,
			bundling: {
				minify: true,
				externalModules: ["@aws-sdk/client-*", "@aws-sdk/s3-*", "aws-lambda"],
				sourceMap: true,
				sourceMapMode: SourceMapMode.INLINE,
				environment: {
					NODE_OPTIONS: "--enable-source-maps",
					...props.environment
				}
			},
			...properties
		});

		collection.fileSystem.grant(
			this,
			"elasticfilesystem:ClientMount",
			"elasticfilesystem:ClientWrite",
			"elasticfilesystem:ClientRootAccess"
		);
	}
}
