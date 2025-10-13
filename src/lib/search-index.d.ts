declare module 'search-index' {
  export class SearchIndex {
    constructor(options: { name: string });
    PUT(documents: any[]): Promise<void>;
    SEARCH(query: any[], options?: { DOCUMENTS?: boolean }): Promise<any>;
  }
}

// 

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

// export type SearchIndexOptions = {
//     db?: any;
//     cacheLength?: number;
//     caseSensitive?: boolean;
//     name?: string;
//     tokenAppend?: string;
//     stopwords?: string[];
// };