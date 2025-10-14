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
