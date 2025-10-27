import { SearchIndex } from "search-index";
import { Document } from "../types/documents.js";
import { QueryRequest, QueryResponse } from "../types/queries.js";
import { MemoryLevel } from "memory-level";
import { mkdir, writeFile, readFile } from "fs/promises";

/**
 * A lightweight search engine for indexing and querying documents.
 *
 * @template T - The type of documents to be indexed and queried, extending the Document interface.
 */
export class MicroSearch<T extends Document> {
	private index: SearchIndex;
	private path: string;

	/**
	 * Creates an instance of the MicroSearch class.
	 * @param indexPath Path to index storage folder
	 */
	constructor(indexPath: string) {
		this.index = new SearchIndex({ name: indexPath, Level: MemoryLevel });
		this.path = indexPath;
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
		await this.export();
	}

	/**
	 * Truncates the index, removing all documents.
	 */
	public async truncate(): Promise<void> {
		await this.index.FLUSH();
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

		await this.export();
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
	 * Exports the index to a JSON file.
	 * @returns Path to the exported file
	 */
	public async export(): Promise<string> {
		const exportPath = `${this.path}/index.json`;

		await mkdir(this.path, { recursive: true });

		const exportData = await this.index.EXPORT();

		await writeFile(exportPath, JSON.stringify(exportData));

		return exportPath;
	}

	/**
	 * Imports an index from a JSON file.
	 * @param filePath Path to the JSON file to import (defaults to {path}/index.json)
	 */
	public async import(filePath?: string): Promise<void> {
		const importPath = filePath || `${this.path}/index.json`;

		const data = await readFile(importPath, "utf8");
		const indexData = JSON.parse(data);

		await this.index.IMPORT(indexData);
	}
}
