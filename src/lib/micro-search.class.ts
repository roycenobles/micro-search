import { SearchIndex } from "search-index";
import { Document, QueryRequest, QueryResponse } from "./micro-search.types.js";

export class MicroSearch<T extends Document> {
  private index: SearchIndex;

  constructor(indexPath: string) {
    this.index = new SearchIndex({ name: indexPath });
  }

  // todo: implement delete method

  public async put(doc: T): Promise<void> {
    await this.putAll([doc]);
  }

  public async putAll(docs: T[]): Promise<void> {
    await this.index.PUT(
      docs.map(({ id, ...properties }) => ({ _id: id, ...properties }))
    );
  }

  public async query(query: QueryRequest): Promise<QueryResponse<T>> {
    let { QUERY, PAGE, SORT } = query;

    QUERY = (!QUERY) ? { FIELD: "publishedAt" } : QUERY;

    const params = {
      ...(SORT && { SORT }),
      ...(PAGE && { PAGE }),
    };

    const response = await this.index.SEARCH(
      Array.isArray(QUERY) ? QUERY : [QUERY],
      {
        DOCUMENTS: true,
        ...params,
      }
    );

    return this.mapQueryResponse(response);
  }

  private mapQueryResponse(response: any): QueryResponse<T> {
    return {
      results: response.RESULT.map((item: any) => {
        const { _id, publishedAt, ...properties } = item._doc;
        return {
          id: _id,
          ...properties,
        } as T;
      }),
      pages: {
        total: response.PAGING.TOTAL,
        current: response.PAGING.DOC_OFFSET,
        size: response.PAGING.SIZE,
      },
    };
  }
}
