import { SearchIndex } from "search-index";
import { Document } from "../types/documents.js";
import { QueryRequest, QueryResponse } from "../types/queries.js";

/**
 * A lightweight search engine for indexing and querying documents.
 *
 * @template T - The type of documents to be indexed and queried, extending the Document interface.
 */
export class MicroSearch<T extends Document> {
	private index: SearchIndex;

	/**
	 * Creates an instance of the MicroSearch class.
	 * @param indexPath Path to index storage folder
	 */
	constructor(indexPath: string) {
		this.index = new SearchIndex({ name: indexPath });
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
				SORT: { DIRECTION: SORT.DIRECTION, TYPE: "ALPHABETIC" }
			})
		};

		const response = await this.index.SEARCH(Array.isArray(QUERY) ? QUERY : [QUERY], { DOCUMENTS: true, ...params });

		return {
			RESULTS: response.RESULT.map(({ _doc: { _id, _indexed, ...props } }: any) => ({ id: _id, ...props }) as T),
			PAGING: {
				PAGES: response.PAGING.TOTAL,
				OFFSET: response.PAGING.DOC_OFFSET,
				SIZE: response.PAGING.SIZE
			}
		};
	}
}
