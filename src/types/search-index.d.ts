/**
 * Type definitions for search-index 6.0.
 * These are a simplified version of the full type definitions.
 * For more detailed types, refer to the official documentation of search-index.
 * https://www.npmjs.com/package/search-index
 */
declare module "search-index" {
	/**
	 * Options for initializing the search index.
	 */
	export type IndexOptions = {
		Level?: any;
		cacheLength?: number;
		caseSensitive?: boolean;
		name?: string;
		stopwords?: string[];
	};

	/**
	 * Class representing a search index.
	 */
	export class SearchIndex {
		constructor(options: IndexOptions);
		CREATED(): Promise<string>;
		DELETE(ids: string[]): Promise<any[]>;
		DOCUMENT_COUNT(): Promise<number>;
		FLUSH(): Promise<void>;
		LAST_UPDATED(): Promise<number>;
		PUT(documents: any[], options?: any): Promise<void>;
		ALL_DOCUMENTS(limit: number): Promise<any>;
		SEARCH(query: any, options?: any): Promise<any>;
		EXPORT(): Promise<any>;
		IMPORT(index: any): Promise<void>;
	}
}
