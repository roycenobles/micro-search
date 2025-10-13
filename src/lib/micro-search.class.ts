import { SearchIndex } from "search-index";
import { Document } from "./micro-search.types.js";

export class MicroSearch<T extends Document> {
  private index: SearchIndex;

  constructor(indexPath: string) {
    this.index = new SearchIndex({ name: indexPath });
  }

  public async put(docs: T[]): Promise<void> {
    await this.index.PUT(docs.map(doc => ({ _id: doc.id, ...doc })));
  }

  public async putOne(doc: T): Promise<void> {
    await this.put([doc]);
  }
}

//   public async index(docs: T[]): Promise<void> {
//     const index = await this._index;

//     const toStore = docs.map((doc) => {
//         const { id, ...rest } = doc;

//         return { _id: id, ...rest };
//     });

//     await index.PUT(toStore);
//   }

//   public async indexOne(doc: T): Promise<void> {
//     await this.index([doc]);
//   }

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