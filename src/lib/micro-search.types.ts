export type Document = {
    id: string;
};

export type Query = {};

export type QueryResponse<T extends Document> = {
    results: T[];
};