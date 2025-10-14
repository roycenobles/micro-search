declare module "search-index" {
  export type IndexOptions = {
    db?: unknown;
    cacheLength?: number;
    caseSensitive?: boolean;
    name?: string;
    tokenAppend?: string;
    stopwords?: string[];
  };

  export class SearchIndex {
    constructor(options: IndexOptions);
    PUT(documents: any[]): Promise<void>;
    ALL_DOCUMENTS(limit: number): Promise<any>;
    SEARCH(query: any, options?: any): Promise<any>;
  }
}

// export type SearchIndexInstance = {
//     PUT: (documents: readonly any[], options?: any) => Promise<any[]>;
//     SEARCH: (query: any) => Promise<{
//         RESULT: Array<{ _id: string; _match: string[]; _doc?: any }>;
//         RESULT_LENGTH: number;
//     }>;
//     DELETE: (...docIds: readonly string[]) => Promise<any[]>;
//     QUERY: (query: any, options?: any) => Promise<{
//         RESULT: Array<{ _id: string; _match: string[]; _doc?: any }>;
//         RESULT_LENGTH: number;
//     }>;
//     DOCUMENT_COUNT: () => Promise<number>;
//     FLUSH: () => Promise<void>;
// };
