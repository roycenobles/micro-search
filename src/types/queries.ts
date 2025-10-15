import { Token } from "./tokens.js";
import { Document } from "./documents.js";

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

export type QueryResponse<T extends Document> = {
  RESULTS: T[];
  PAGING: {
    PAGES: number;
    OFFSET: number;
    SIZE: number;
  };
};