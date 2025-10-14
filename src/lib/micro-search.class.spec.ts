import { TestDocument, TestDocuments } from "./micro-search.class.assets.js";
import { MicroSearch } from "./micro-search.class.js";
import { v4 as uuid } from "uuid";
import fs from "fs";
import { QueryRequest } from "./micro-search.types.js";

describe("MicroSearch", () => {
  let search: MicroSearch<TestDocument>;
  let index: string;

  beforeEach(() => {
    index = `./index/${uuid()}`;
    fs.mkdirSync(index, { recursive: true });
    search = new MicroSearch<TestDocument>(index);
  });

  afterEach(() => {
    fs.rmSync(index, { recursive: true });
  });

  describe("put", () => {
    it("should index a single document", async () => {
      await expect(search.put(TestDocuments[0])).resolves.not.toThrow();
    });

    it("should handle documents with required id field", async () => {
      const doc: TestDocument = {
        id: "test-id",
        title: "Test Document",
        content: "Test content",
        author: "Test Author",
        tags: ["test"],
        publishedAt: "2024-01-01",
      };

      await expect(search.put(doc)).resolves.not.toThrow();
    });
  });

  describe("putAll", () => {
    it("should index multiple documents", async () => {
      await expect(search.putAll(TestDocuments)).resolves.not.toThrow();
    });

    it("should handle empty array", async () => {
      await expect(search.putAll([])).resolves.not.toThrow();
    });

    it("should handle single document in array", async () => {
      await expect(search.putAll([TestDocuments[0]])).resolves.not.toThrow();
    });
  });

  describe("query", () => {
    beforeEach(async () => {
      // Index test documents before each query test
      await search.putAll(TestDocuments);
    });

    it("should execute a default query when no QUERY is provided", async () => {
      const request: QueryRequest = {};
      const result = await search.query(request);

      expect(result).toHaveProperty("results");
      expect(result).toHaveProperty("pages");
      expect(Array.isArray(result.results)).toBe(true);
      expect(typeof result.pages).toBe("object");
    });

    it("should return properly structured response", async () => {
      const request: QueryRequest = {
        QUERY: { FIELD: "author", VALUE: "John Doe" },
      };

      const result = await search.query(request);

      expect(result).toHaveProperty("results");
      expect(result).toHaveProperty("pages");
      expect(result.pages).toHaveProperty("total");
      expect(result.pages).toHaveProperty("current");
      expect(result.pages).toHaveProperty("size");
    });

    it("should handle field-specific search", async () => {
      const request: QueryRequest = {
        QUERY: { FIELD: "author", VALUE: "John Doe" },
      };

      const result = await search.query(request);
      expect(result.results).toBeDefined();
    });

    it("should handle simple string query", async () => {
      const request: QueryRequest = {
        QUERY: "typescript",
      };

      const result = await search.query(request);
      expect(result.results).toBeDefined();
    });

    it("should handle AND queries", async () => {
      const request: QueryRequest = {
        QUERY: {
          AND: [
            { FIELD: "author", VALUE: "John Doe" },
            { FIELD: "tags", VALUE: "programming" },
          ],
        },
      };

      const result = await search.query(request);
      expect(result.results).toBeDefined();
    });

    it("should handle OR queries", async () => {
      const request: QueryRequest = {
        QUERY: {
          OR: [
            { FIELD: "title", VALUE: "TypeScript" },
            { FIELD: "title", VALUE: "JavaScript" },
          ],
        },
      };

      const result = await search.query(request);
      expect(result.results).toBeDefined();
    });

    it("should handle range queries", async () => {
      const request: QueryRequest = {
        QUERY: {
          FIELD: "publishedAt",
          VALUE: {
            GTE: "2024-01-01",
            LTE: "2024-12-31",
          },
        },
      };

      const result = await search.query(request);
      expect(result.results).toBeDefined();
    });

    it("should handle SORT parameter", async () => {
      const request: QueryRequest = {
        SORT: {
          FIELD: "publishedAt",
          DIRECTION: "DESCENDING",
          TYPE: "ALPHABETIC",
        },
      };

      const result = await search.query(request);
      expect(result.results).toBeDefined();
    });

    it("should handle PAGE parameter", async () => {
      const request: QueryRequest = {
        PAGE: {
          NUMBER: 1,
          SIZE: 10,
        },
      };

      const result = await search.query(request);
      expect(result.results).toBeDefined();
      expect(result.pages).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("should handle invalid documents gracefully", async () => {
      const invalidDoc = { title: "Missing ID" } as TestDocument;
      // The current implementation doesn't validate document structure,
      // so this test just ensures it doesn't crash
      await expect(search.put(invalidDoc)).resolves.not.toThrow();
    });
  });
});
