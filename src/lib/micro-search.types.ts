export type Document = {
  id: string;
  [key: string]: any;
};

export type Field = string | string[];

export type FieldOnlyToken = {
  FIELD: Field;
};

export type FieldValueToken = {
  FIELD: Field;
  VALUE: string | RangeValue;
};

export type RangeValue = {
  GTE: string | number;
  LTE: string | number;
};

export type ANDQuery = {
  AND: Token[];
};

export type ORQuery = {
  OR: Token[];
};

export type NOTQuery = {
  NOT: {
    INCLUDE: Token;
    EXCLUDE: Token;
  };
};

export type Token =
  | Field
  | FieldValueToken
  | FieldOnlyToken
  | ANDQuery
  | ORQuery
  | NOTQuery;

export type QueryRequest = {
  QUERY?: Token;
  SCORE?: {
    FIELD: string;
    TYPE: "VALUE"
  }
  SORT?: {
    DIRECTION: "DESCENDING" | "ASCENDING";
    TYPE: "NUMERIC" | "ALPHABETIC";
  };
  PAGE?: {
    NUMBER: number;
    SIZE: number;
  };
};

export type QueryResponse<T extends Document> = {
  results: T[];
  paging: {
    pages: number;
    offset: number;
    size: number;
  };
};
