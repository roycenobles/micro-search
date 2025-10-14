import { SearchIndex } from "search-index";
import { Document, QueryRequest, QueryResponse } from "./micro-search.types.js";

export class MicroSearch<T extends Document> {
  private index: SearchIndex;

  constructor(indexPath: string) {
    this.index = new SearchIndex({ name: indexPath });
  }

  public async count(): Promise<number> {
    return this.index.DOCUMENT_COUNT();
  }

  public async delete(doc: T): Promise<void> {
    await this.deleteMany([doc]);
  }

  public async deleteMany(docs: T[]): Promise<void> {
    await (this.index.DELETE as any)(...docs.map(({ id }) => id));
  }

  public async flush(): Promise<void> {
    await this.index.FLUSH();
  }

  public async put(doc: T): Promise<void> {
    await this.putMany([doc]);
  }

  public async putMany(docs: T[]): Promise<void> {
    await this.index.PUT(
      docs.map(({ id, ...properties }) => ({ _id: id, ...properties })),
      { storeVectors: true }
    );
  }

  public async query(query: QueryRequest): Promise<QueryResponse<T>> {
    let { QUERY, PAGE, SORT } = query;

    QUERY = !QUERY ? { FIELD: "publishedAt" } : QUERY;

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

    return this.toQueryResponse(response);
  }

  private toQueryResponse(response: any): QueryResponse<T> {
    return {
      results: response.RESULT.map((item: any) => {
        const { _id, publishedAt, ...properties } = item._doc;
        return { id: _id, ...properties } as T;
      }),
      pages: {
        total: response.PAGING.TOTAL,
        current: response.PAGING.DOC_OFFSET,
        size: response.PAGING.SIZE,
      },
    };
  }
}
