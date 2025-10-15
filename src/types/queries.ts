import { Token } from "./tokens.js";
import { Document } from "./documents.js";

/**
 * A query request to search documents.
 * Includes optional sorting and pagination.
 * If a query is not provided, all documents are returned.
 */
export type QueryRequest = {
  QUERY?: Token;
  SORT?: {
    FIELD: string;
    DIRECTION: "DESCENDING" | "ASCENDING";
  };
  PAGE?: {
    NUMBER: number;
    SIZE: number;
  };
};

/**
 * A query response containing the results and pagination info.
 */
export type QueryResponse<T extends Document> = {
  RESULTS: T[];
  PAGING: {
    PAGES: number;
    OFFSET: number;
    SIZE: number;
  };
};