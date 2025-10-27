import { RemovalPolicy } from "aws-cdk-lib";
import { IVpc, Vpc } from "aws-cdk-lib/aws-ec2";
import { AccessPoint, FileSystem } from "aws-cdk-lib/aws-efs";
import { Construct } from "constructs";

export interface ISearchCollection {
	fileSystem: FileSystem;
	accessPoint: AccessPoint;
	vpc: IVpc;
}

export type SearchCollectionProps = {
	readonly fileSystemName: string;
	readonly removalPolicy: RemovalPolicy;
	readonly vpc?: IVpc;
};

/**
 * SearchCollection sets up the necessary AWS resources for a micro-search collection,
 * including a VPC, EFS file system, and access point.
 */
export class SearchCollection extends Construct implements ISearchCollection {
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

	constructor(scope: Construct, id: string, props: SearchCollectionProps) {
		super(scope, id);

		this._vpc = props.vpc ?? Vpc.fromLookup(this, "vpc", { isDefault: true });

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
