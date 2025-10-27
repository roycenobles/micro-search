import { createReadStream, createWriteStream } from "fs";
import { access, mkdir, rm, stat } from "fs/promises";
import { dirname } from "path";
import { createGunzip, createGzip } from "zlib";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

export class IndexExport {
	private readonly _file: string;
	private _mtime: string | undefined;

	constructor(path: string) {
		this._file = `${path}/index.gz`;
		this._mtime = undefined;
	}

	public async destroy(): Promise<void> {
		if (!(await this.exists())) return;
		await rm(dirname(this._file), { recursive: true });
		this._mtime = await this.lastModified();
	}

	public async exists(): Promise<boolean> {
		let exists = false;

		try {
			await access(this._file);
			exists = true;
		} catch (err: any) {
			if (err.code !== "ENOENT") throw err;
		}

		return exists;
	}

	public async isCurrent(): Promise<boolean> {
		let isCurrent = false;

		if (this._mtime) {
			isCurrent = this._mtime === (await this.lastModified());
		}

		return isCurrent;
	}

	public async lastModified(): Promise<string | undefined> {
		let mtime = undefined;

		if (await this.exists()) {
			mtime = (await stat(this._file)).mtime.toISOString();
		}

		return mtime;
	}

	public async read(): Promise<any> {
		let result = undefined;

		if (await this.exists()) {
			const readStream = createReadStream(this._file);
			const gunzip = createGunzip();

			let unzipped = "";

			for await (const chunk of readStream.pipe(gunzip)) {
				unzipped += chunk.toString("utf8");
			}

			result = JSON.parse(unzipped);

			this._mtime = await this.lastModified();
		}

		return result;
	}

	public async write(data: any): Promise<void> {
		if (!data) return;

		if (!(await this.exists())) {
			await mkdir(dirname(this._file), { recursive: true });
		}

		const jsonStream = Readable.from([JSON.stringify(data)]);

		await pipeline(jsonStream, createGzip({ level: 6 }), createWriteStream(this._file));

		this._mtime = await this.lastModified();
	}
}
