/**
 * A field or array of fields to search against.
 */
export type Field = string | string[];

/**
 * A token representing a field to search against (without a value).
 * Used for existence checks.
 */
export type FieldOnlyToken = {
  FIELD: Field;
};

/**
 * A token representing a field and a value or range to search against.
 */
export type FieldValueToken = {
  FIELD: Field;
  VALUE: string | Range;
};

/**
 * A range with greater-than-equal and less-than-equal values.
 * Used for range queries in FieldValueToken.
 */
export type Range = {
  GTE: string | number;
  LTE: string | number;
};

/**
 * A token representing an AND logical operation on an array of tokens.
 */
export type ANDQuery = {
  AND: Token[];
};

/**
 * A token representing an OR logical operation on an array of tokens.
 */
export type ORQuery = {
  OR: Token[];
};

/**
 * A token representing a NOT logical operation with include and exclude tokens.
 */
export type NOTQuery = {
  NOT: {
    INCLUDE: Token;
    EXCLUDE: Token;
  };
};

/**
 * A token can be a Field, FieldValueToken, FieldOnlyToken, ANDQuery, ORQuery, or NOTQuery.
 */
export type Token =
  | Field
  | FieldValueToken
  | FieldOnlyToken
  | ANDQuery
  | ORQuery
  | NOTQuery;

