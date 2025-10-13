import { Query, QueryResponse } from "./micro-search.types";

export class MicroSearch {

    constructor(indexPath: string) {

    }

    public index(docs: Document[]): void {
        throw new Error("Method not implemented.");
    }

    public indexOne(doc: Document): void {
        this.index([doc]);
    }

    public query(query: Query): QueryResponse {
        throw new Error("Method not implemented.");
    }
}