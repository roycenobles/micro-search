import { RemovalPolicy } from "aws-cdk-lib";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import { AccessPoint, FileSystem } from "aws-cdk-lib/aws-efs";
import { Construct } from "constructs";

export interface ISearchFileSystem {
	fileSystem: FileSystem;
	accessPoint: AccessPoint;
	vpc: IVpc;
}

export type SearchFileSystemProps = {
	readonly fileSystemName: string;
	readonly removalPolicy: RemovalPolicy;
	readonly vpc: IVpc;
};

/**
 * EfsSearchCollection sets up the necessary AWS resources for a micro-search collection,
 * including a VPC, EFS file system, and access point.
 */
export class SearchFileSystem extends Construct implements ISearchFileSystem {
	private readonly _vpc: IVpc;
	private readonly _fileSystem: FileSystem;
	private readonly _accessPoint: AccessPoint;

	public get vpc(): IVpc {
		return this._vpc;
	}

	public get fileSystem(): FileSystem {
		return this._fileSystem;
	}

	public get accessPoint(): AccessPoint {
		return this._accessPoint;
	}

	constructor(scope: Construct, id: string, props: SearchFileSystemProps) {
		super(scope, id);

		this._vpc = props.vpc;

		this._fileSystem = new FileSystem(this, "file-system", {
			fileSystemName: props.fileSystemName,
			removalPolicy: props.removalPolicy,
			vpc: this._vpc
		});

		this._accessPoint = new AccessPoint(this, "access-point", {
			fileSystem: this._fileSystem,
			createAcl: {
				ownerGid: "1001",
				ownerUid: "1001",
				permissions: "777"
			},
			path: "/search",
			posixUser: {
				uid: "1001",
				gid: "1001"
			}
		});
	}
}
