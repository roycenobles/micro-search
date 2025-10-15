declare module "search-index" {
  export type IndexOptions = {
    db?: unknown;
    cacheLength?: number;
    caseSensitive?: boolean;
    name?: string;
    stopwords?: string[];
  };

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
  }
}
