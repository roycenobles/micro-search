export type Document = {
    id: string;
    [key: string]: any;
};

// export type Field = string | string[];

// export type RangeValue = {
//     GTE: string | number;
//     LTE: string | number;
// };

// export type FieldValueToken = {
//     FIELD: Field;
//     VALUE: string | RangeValue;
// };

// export type FieldOnlyToken = {
//     FIELD: Field;
// };

// export type ANDQuery = {
//     AND: Token[];
// };

// export type ORQuery = {
//     OR: Token[];
// };

// export type NOTQuery = {
//     NOT: {
//         INCLUDE: Token;
//         EXCLUDE: Token;
//     };
// };

// export type SEARCHQuery = {
//     SEARCH: Token[];
// };

// export type Token = Field | FieldValueToken | FieldOnlyToken | ANDQuery | ORQuery | NOTQuery | SEARCHQuery;

// export type Query = Token;

// export type QueryResponse<T extends Document> = {
//     results: T[];
//     totalHits?: number;
//     offset?: number;
//     limit?: number;
// };
