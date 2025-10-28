import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client
} from "@aws-sdk/client-s3";
import { createGunzip, createGzip } from "zlib";
import { Readable } from "stream";
import { IStorage } from "./storage.interface.js";

export interface BucketStorageConfig {
	bucket: string;
	key: string;
	client?: S3Client;
	region?: string;
}

/**
 * BucketStorage handles reading and writing the index export to AWS S3.
 */
export class BucketStorage implements IStorage {
	private readonly _client: S3Client;
	private readonly _bucket: string;
	private readonly _key: string;
	private _mtime: string | undefined;

	constructor(config: BucketStorageConfig) {
		this._bucket = config.bucket;
		this._key = config.key;
		this._client = config.client || new S3Client({ region: config.region || "us-east-1" });
		this._mtime = undefined;
	}

	/**
	 * Destroys the index file in S3.
	 */
	public async destroy(): Promise<void> {
		if (!(await this.exists())) return;

		const command = new DeleteObjectCommand({
			Bucket: this._bucket,
			Key: this._key
		});

		await this._client.send(command);
		this._mtime = undefined;
	}

	/**
	 * Checks if the index file exists in S3.
	 * @returns True if the index file exists, false otherwise.
	 */
	public async exists(): Promise<boolean> {
		return (await this.lastModified()) !== undefined;
	}

	/**
	 * Checks if the index has been modified since last read.
	 * @returns True if the index is current, false otherwise.
	 */
	public async isCurrent(): Promise<boolean> {
		if (!this._mtime) return false;
		return this._mtime === (await this.lastModified());
	}

	/**
	 * Gets the last modified time of the index file in S3.
	 * @returns The last modified time as a string, or undefined if the file does not exist.
	 */
	public async lastModified(): Promise<string | undefined> {
		try {
			const command = new HeadObjectCommand({
				Bucket: this._bucket,
				Key: this._key
			});
			const response = await this._client.send(command);
			return response.LastModified?.toISOString();
		} catch (err: any) {
			if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
				return undefined;
			}
			throw err;
		}
	}

	/**
	 * Reads data from the index file in S3.
	 * @returns The parsed JSON data from the index file, or undefined if the file does not exist or is empty.
	 */
	public async read(): Promise<any> {
		if (!(await this.exists())) return undefined;

		const command = new GetObjectCommand({
			Bucket: this._bucket,
			Key: this._key
		});

		const response = await this._client.send(command);

		if (!response.Body) return undefined;

		// Convert the S3 body stream to a readable stream
		const bodyStream = response.Body as Readable;
		const gunzip = createGunzip();

		let unzipped = "";

		for await (const chunk of bodyStream.pipe(gunzip)) {
			unzipped += chunk.toString("utf8");
		}

		const result = JSON.parse(unzipped);

		this._mtime = await this.lastModified();

		return result;
	}

	/**
	 * Writes data to the index file in S3.
	 * @param data The parsed JSON data to write.
	 */
	public async write(data: any): Promise<void> {
		if (!data) return;

		// Create a gzipped stream from the JSON data
		const jsonStream = Readable.from([JSON.stringify(data)]);
		const gzip = createGzip({ level: 6 });

		// Collect the gzipped data into a buffer
		const chunks: Buffer[] = [];
		for await (const chunk of jsonStream.pipe(gzip)) {
			chunks.push(Buffer.from(chunk));
		}
		const body = Buffer.concat(chunks);

		const command = new PutObjectCommand({
			Bucket: this._bucket,
			Key: this._key,
			Body: body,
			ContentType: "application/gzip",
			ContentEncoding: "gzip"
		});

		await this._client.send(command);

		this._mtime = await this.lastModified();
	}
}
