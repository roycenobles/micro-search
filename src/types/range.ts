/**
 * A range with greater-than-equal and less-than-equal values.
 * Used for range queries in FieldValueToken.
 */
export type Range = {
  GTE: string | number;
  LTE: string | number;
};