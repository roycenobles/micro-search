import { Document } from "../types/document.js";

import {
  Field,
  FieldOnlyToken,
  FieldValueToken,
  RangeValue,
  ANDQuery,
  ORQuery,
  NOTQuery,
  QueryRequest,
  QueryResponse,
} from "./micro-search.types.js";

interface TestDoc extends Document {
  id: string;
  title: string;
  content: string;
}

describe("MicroSearch Types", () => {
  describe("Document", () => {
    it("should define a valid Document interface", () => {
      const doc: TestDoc = {
        id: "test-id",
        title: "Test Title",
        content: "Test Content",
      };

      expect(doc.id).toBe("test-id");
      expect(doc.title).toBe("Test Title");
      expect(doc.content).toBe("Test Content");
    });
  });

  describe("Field", () => {
    it("should accept string values", () => {
      const field: Field = "title";
      expect(field).toBe("title");
    });

    it("should accept string array values", () => {
      const field: Field = ["title", "content"];
      expect(field).toEqual(["title", "content"]);
    });
  });

  describe("FieldOnlyToken", () => {
    it("should create valid field-only tokens", () => {
      const token: FieldOnlyToken = {
        FIELD: "title",
      };

      expect(token.FIELD).toBe("title");
    });

    it("should accept array fields", () => {
      const token: FieldOnlyToken = {
        FIELD: ["title", "content"],
      };

      expect(token.FIELD).toEqual(["title", "content"]);
    });
  });

  describe("FieldValueToken", () => {
    it("should create valid field-value tokens", () => {
      const token: FieldValueToken = {
        FIELD: "title",
        VALUE: "typescript",
      };

      expect(token.FIELD).toBe("title");
      expect(token.VALUE).toBe("typescript");
    });

    it("should accept range values", () => {
      const rangeValue: RangeValue = {
        GTE: "2024-01-01",
        LTE: "2024-12-31",
      };

      const token: FieldValueToken = {
        FIELD: "publishedAt",
        VALUE: rangeValue,
      };

      expect(token.VALUE).toEqual(rangeValue);
    });
  });

  describe("Complex Query Types", () => {
    it("should create valid AND queries", () => {
      const andQuery: ANDQuery = {
        AND: [
          { FIELD: "author", VALUE: "John Doe" },
          { FIELD: "tags", VALUE: "programming" },
        ],
      };

      expect(andQuery.AND).toHaveLength(2);
    });

    it("should create valid OR queries", () => {
      const orQuery: ORQuery = {
        OR: [
          { FIELD: "title", VALUE: "TypeScript" },
          { FIELD: "title", VALUE: "JavaScript" },
        ],
      };

      expect(orQuery.OR).toHaveLength(2);
    });

    it("should create valid NOT queries", () => {
      const notQuery: NOTQuery = {
        NOT: {
          INCLUDE: { FIELD: "status", VALUE: "published" },
          EXCLUDE: { FIELD: "author", VALUE: "excluded-author" },
        },
      };

      expect(notQuery.NOT.INCLUDE).toBeDefined();
      expect(notQuery.NOT.EXCLUDE).toBeDefined();
    });
  });

  describe("QueryRequest", () => {
    it("should create valid query requests", () => {
      const request: QueryRequest = {
        QUERY: { FIELD: "title", VALUE: "typescript" },
        SORT: {
          FIELD: "publishedAt",
          DIRECTION: "DESCENDING",
        },
        PAGE: {
          NUMBER: 1,
          SIZE: 10,
        },
      };

      expect(request.QUERY).toBeDefined();
      expect(request.SORT).toBeDefined();
      expect(request.PAGE).toBeDefined();
    });

    it("should allow empty query requests", () => {
      const request: QueryRequest = {};
      expect(request).toBeDefined();
    });
  });

  describe("QueryResponse", () => {
    it("should create valid query responses", () => {
      const response: QueryResponse<TestDoc> = {
        results: [
          {
            id: "1",
            title: "Test Document",
            content: "Test content",
          },
        ],
        paging: {
          pages: 1,
          offset: 0,
          size: 10,
        },
      };

      expect(response.results).toHaveLength(1);
      expect(response.paging.pages).toBe(1);
      expect(response.results[0].id).toBe("1");
    });
  });
});
