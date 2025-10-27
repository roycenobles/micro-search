import { createReadStream, createWriteStream } from "fs";
import { access, mkdir, rm } from "fs/promises";
import { MemoryLevel } from "memory-level";
import { dirname } from "path";
import { SearchIndex } from "search-index";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { createGunzip, createGzip } from "zlib";
import { Document } from "../types/documents.js";
import { QueryRequest, QueryResponse } from "../types/queries.js";

/**
 * A lightweight search engine for indexing and querying documents.
 *
 * @template T - The type of documents to be indexed and queried, extending the Document interface.
 */
export class MicroSearch<T extends Document> {
	private readonly index: SearchIndex;
	private readonly extract: string;
	private isDirty: boolean;

	private constructor(indexPath: string) {
		this.index = new SearchIndex({ name: indexPath, Level: MemoryLevel });
		this.extract = `${indexPath}/index.gz`;
		this.isDirty = false;
	}

	/**
	 * Creates an instance of MicroSearch, loading an existing index if available.
	 * @param indexPath The path to the index directory on disk
	 * @returns A promise that resolves to a MicroSearch instance
	 */
	public static async create<T extends Document>(indexPath: string): Promise<MicroSearch<T>> {
		const ms = new MicroSearch<T>(indexPath);

		try {
			await access(ms.extract);

			const readStream = createReadStream(ms.extract);
			const gunzip = createGunzip();

			let unzipped = "";

			for await (const chunk of readStream.pipe(gunzip)) {
				unzipped += chunk.toString("utf8");
			}

			const indexData = JSON.parse(unzipped);

			await ms.index.IMPORT(indexData);
		} catch (err: any) {
			if (err.code !== "ENOENT") throw err;
		}

		return ms;
	}

	/**
	 * Gets the total number of documents in the index.
	 * @returns Document count
	 */
	public async count(): Promise<number> {
		return this.index.DOCUMENT_COUNT();
	}

	/**
	 * Deletes a document from the index.
	 * @param doc The document to delete
	 */
	public async delete(doc: T): Promise<void> {
		await this.deleteMany([doc]);
	}

	/**
	 * Deletes many documents from the index.
	 * @param docs The documents to delete
	 */
	public async deleteMany(docs: T[]): Promise<void> {
		await (this.index.DELETE as any)(...docs.map(({ id }) => id));
		this.isDirty = true;
	}

	/**
	 * Truncates the index, removing all documents.
	 */
	public async truncate(): Promise<void> {
		await this.index.FLUSH();

		try {
			await access(this.extract);
			await rm(dirname(this.extract), { recursive: true });
		} catch (err: any) {
			if (err.code !== "ENOENT") throw err;
		}

		this.isDirty = false;
	}

	/**
	 * Adds or updates a document in the index.
	 * @param doc The document to add or update
	 */
	public async put(doc: T): Promise<void> {
		await this.putMany([doc]);
	}

	/**
	 * Adds or updates many documents in the index.
	 * @param docs The documents to add or update.
	 * @param keywords Fields to be treated as keywords (not tokenized).
	 */
	public async putMany(docs: T[], keywords?: string[]): Promise<void> {
		const _indexed = new Date().toISOString();

		const { PUT, TOKENIZATION_PIPELINE_STAGES: STAGES } = this.index as any;

		await PUT(
			docs.map(({ id, ...props }) => ({ _id: id, _indexed, ...props })),
			{
				storeVectors: true,
				tokenizer: (tokens: any, field: any, ops: any) =>
					keywords?.includes(field)
						? Promise.resolve([[tokens, "1.00"]])
						: STAGES.SPLIT([tokens, field, ops])
								.then(STAGES.SKIP)
								.then(STAGES.LOWCASE)
								.then(STAGES.REPLACE)
								.then(STAGES.NGRAMS)
								.then(STAGES.STOPWORDS)
								.then(STAGES.SCORE_TERM_FREQUENCY)
								.then(([t]: any) => t)
			}
		);

		this.isDirty = true;
	}

	/**
	 * Queries the index for documents matching the specified criteria.
	 * @param query The query
	 * @returns The query response
	 */
	public async query(query: QueryRequest): Promise<QueryResponse<T>> {
		const { QUERY = { FIELD: "_indexed" }, PAGE, SORT } = query;

		const params: any = {
			...(PAGE && { PAGE }),
			...(SORT && {
				SCORE: { FIELD: SORT.FIELD, TYPE: "VALUE" },
				// todo: support numeric sorting via type detection
				SORT: { DIRECTION: SORT.DIRECTION, TYPE: "ALPHABETIC" }
			})
		};

		const response = await this.index.SEARCH(Array.isArray(QUERY) ? QUERY : [QUERY], { DOCUMENTS: true, ...params });

		return {
			RESULTS: response.RESULT.map(({ _doc: { _id, _indexed, ...props } }: any) => ({ id: _id, ...props } as T)),
			PAGING: {
				PAGES: response.PAGING.TOTAL,
				OFFSET: response.PAGING.DOC_OFFSET,
				SIZE: response.PAGING.SIZE
			}
		};
	}

	/**
	 * Flushes any pending changes to disk.
	 * Only exports if there are uncommitted changes.
	 */
	public async commit(): Promise<void> {
		if (!this.isDirty) return;

		await mkdir(dirname(this.extract), { recursive: true });

		const exportData = await this.index.EXPORT();
		const jsonStream = Readable.from([JSON.stringify(exportData)]);

		await pipeline(jsonStream, createGzip({ level: 6 }), createWriteStream(this.extract));

		// todo: import {stat} from "fs/promises"; and log mtime;

		this.isDirty = false;
	}
}
