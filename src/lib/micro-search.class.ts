import { SearchIndex } from "search-index";
import { Document } from "./micro-search.types.js";

export class MicroSearch<T extends Document> {
  private index: SearchIndex;

  constructor(indexPath: string) {
    this.index = new SearchIndex({ name: indexPath });
  }

  public async put(docs: T[]): Promise<void> {
    await this.index.PUT(docs.map(({ id, ...rest }) => ({ _id: id, ...rest })));
  }

  public async putOne(doc: T): Promise<void> {
    await this.put([doc]);
  }

  public async query(query: any): Promise<any> {
    const response = await this.index.SEARCH(query, { DOCUMENTS: true });

    return response;
  }

  private async all(limit: number = 100): Promise<any> {
    const response = await this.index.ALL_DOCUMENTS(limit);

    return response;
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
