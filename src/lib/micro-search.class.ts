import { SearchIndex } from "search-index";
import { Document, QueryRequest, QueryResponse } from "./micro-search.types.js";

export class MicroSearch<T extends Document> {
  private index: SearchIndex;

  constructor(indexPath: string) {
    this.index = new SearchIndex({ name: indexPath });
  }

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

    QUERY = QUERY === "ALL_DOCUMENTS" ? { FIELD: "id" } : QUERY;

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
      }
    };
  }
}

//   public async query(query: Query): Promise<QueryResponse<T>> {
//     const index = await this._index;

//     const searchResult = await index.SEARCH(query);

//     return {
//       results: searchResult.RESULT.map((item) => {
//         // If documents are stored, return the document with id
//         if (item._doc) {
//           return { ...item._doc, id: item._id } as T;
//         }
//         // Otherwise just return the id (you may need to fetch separately)
//         return { id: item._id } as T;
//       }),
//       totalHits: searchResult.RESULT_LENGTH,
//     };
//   }

//   public async getDocumentCount(): Promise<number> {
//     const index = await this._index;

//     return await index.DOCUMENT_COUNT();
//   }

//   public async delete(docIds: string[]): Promise<void> {
//     const index = await this._index;

//     await index.DELETE(...docIds);
//   }
