import { Query, QueryResponse } from "./micro-search.types";
import { Document } from "./micro-search.types";

export class MicroSearch<T extends Object> {

    constructor(indexPath: string) {

    }

    public index(docs: Document<T>[]): void {
        throw new Error("Method not implemented.");
    }

    public indexOne(doc: Document<T>): void {
        this.index([doc]);
    }

    public query(query: Query): QueryResponse<T> {
        throw new Error("Method not implemented.");
    }
}