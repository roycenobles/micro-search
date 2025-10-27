import { MemoryLevel } from "memory-level";
import { SearchIndex } from "search-index";
import { Document } from "../types/documents.js";
import { QueryRequest, QueryResponse } from "../types/queries.js";
import { StorageAdapter } from "./storage-adapter.js";

/**
 * A lightweight search engine for indexing and querying documents.
 * Uses in-memory storage with optional disk persistence.
 *
 * @template T - The type of documents to be indexed and queried, extending the Document interface.
 */
export class MicroSearch<T extends Document> {
	private readonly index: SearchIndex;
	private readonly store: StorageAdapter;
	private isDirty: boolean;

	public constructor(indexPath: string) {
		this.index = new SearchIndex({ Level: MemoryLevel });
		this.store = new StorageAdapter(indexPath);
		this.isDirty = false;
	}

	/**
	 * Flushes any pending changes to disk.
	 * Only exports if there are uncommitted changes.
	 */
	public async commit(): Promise<void> {
		if (!this.isDirty) return;
		await this.store.write(await this.index.EXPORT());
		this.isDirty = false;
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
	 * Initialize the index, loading from export if available.
	 * If the export is already current, no action is taken.
	 */
	public async initialize(): Promise<void> {
		const isCurrent = await this.store.isCurrent();

		if (!isCurrent) {
			const exists = await this.store.exists();

			if (exists) {
				await this.index.IMPORT(await this.store.read());
			} else {
				await this.index.FLUSH();
			}
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
	 * Truncates the index, removing all documents.
	 */
	public async truncate(): Promise<void> {
		await this.index.FLUSH();
		await this.store.destroy();
		this.isDirty = false;
	}
}
