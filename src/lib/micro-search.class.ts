import { SearchIndex } from "search-index";
import { Document, QueryResponse } from "./micro-search.types.js";

export class MicroSearch<T extends Document> {
  private index: SearchIndex;

  constructor(indexPath: string) {
    this.index = new SearchIndex({ name: indexPath });
  }

  public async put(doc: T): Promise<void> {
    await this.putAll([doc]);
  }

  public async putAll(docs: T[]): Promise<void> {
    await this.index.PUT(docs.map(({ id, ...properties }) => ({ _id: id, ...properties })));
  }

  public async query(query: any): Promise<QueryResponse<T>> {
    return this.mapResponse(
      await this.index.SEARCH(query, { DOCUMENTS: true })
    );
  }

  private async queryAll(limit: number = 100): Promise<QueryResponse<T>> {
    return this.mapResponse(await this.index.ALL_DOCUMENTS(limit));
  }

  private mapResponse(response: any): QueryResponse<T> {
    return {
      results: response.RESULT.map((item: any) => {
        const { _id, publishedAt, ...properties } = item._doc;
        return {
          id: _id,
          ...properties,
        } as T;
      }),
      found: response.PAGING.TOTAL,
      offset: response.PAGING.DOC_OFFSET,
      limit: response.PAGING.SIZE,
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
