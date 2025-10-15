/**
 * A generic document type with a required `id` property.
 */
export type Document = {
  id: string;
  [key: string]: any;
};