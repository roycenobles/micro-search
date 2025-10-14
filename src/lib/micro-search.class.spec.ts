import { TestDocument, TestDocuments } from "./micro-search.class.assets.js";
import { MicroSearch } from "./micro-search.class.js";
import { v4 as uuid } from "uuid";
import fs from "fs";
import { QueryRequest } from "./micro-search.types.js";

describe("MicroSearch", () => {
  let ms: MicroSearch<TestDocument>;
  let index: string;

  beforeAll(async () => {
    index = `./index/${uuid()}`;
    ms = new MicroSearch<TestDocument>(index);
  });

  afterAll(() => {
    fs.rmSync(index, { recursive: true });
  });

  describe("delete", () => {
    beforeEach(async () => {
      await ms.flush();
      await ms.putMany(TestDocuments);
    });

    it("should delete a document by ID", async () => {
      await expect(ms.delete(TestDocuments[0])).resolves.not.toThrow();
      await expect(ms.count()).resolves.toBe(TestDocuments.length - 1);
    });

    it("should delete multiple documents by ID", async () => {
      await expect(
        ms.deleteMany([TestDocuments[0], TestDocuments[1]])
      ).resolves.not.toThrow();
      await expect(ms.count()).resolves.toBe(TestDocuments.length - 2);
    });
  });

  describe("put", () => {
    beforeEach(async () => {
      await ms.flush();
    });

    it("should index a single document", async () => {
      await expect(ms.put(TestDocuments[0])).resolves.not.toThrow();
      await expect(ms.count()).resolves.toBe(1);
    });

    it("should index multiple documents", async () => {
      await expect(ms.putMany(TestDocuments)).resolves.not.toThrow();
      await expect(ms.count()).resolves.toBe(TestDocuments.length);
    });

    it("should handle single document in array", async () => {
      await expect(ms.putMany([TestDocuments[0]])).resolves.not.toThrow();
      await expect(ms.count()).resolves.toBe(1);
    });

    it("should handle empty array", async () => {
      await expect(ms.putMany([])).resolves.not.toThrow();
      await expect(ms.count()).resolves.toBe(0);
    });
  });

  // describe("query", () => {
  //   beforeAll(async () => {
  //     // Index test documents before each query test

  //   });

  //   it("should execute a default query when no QUERY is provided", async () => {
  //     const request: QueryRequest = {};

  //     await search.putAll(TestDocuments);

  //     const result = await search.query(request);

  //     console.log(result);

  //     expect(result).toHaveProperty("results");
  //     expect(result).toHaveProperty("pages");

  //     expect(Array.isArray(result.results)).toBe(true);
  //     expect(typeof result.pages).toBe("object");

  //     expect(result.pages.size).toBe(20); // default
  //     expect(result.pages.current).toBe(0); // default
  //     expect(result.pages.total).toBe(0); // no pages

  //     // expect(result.results.length).toBe(20); // all returned

  //   });

  //   it("should return properly structured response", async () => {
  //     const request: QueryRequest = {
  //       QUERY: { FIELD: "author", VALUE: "John Doe" },
  //     };

  //     const result = await search.query(request);

  //     expect(result).toHaveProperty("results");
  //     expect(result).toHaveProperty("pages");
  //     expect(result.pages).toHaveProperty("total");
  //     expect(result.pages).toHaveProperty("current");
  //     expect(result.pages).toHaveProperty("size");
  //   });

  //   it("should handle field-specific search", async () => {
  //     const request: QueryRequest = {
  //       QUERY: { FIELD: "author", VALUE: "John Doe" },
  //     };

  //     const result = await search.query(request);
  //     expect(result.results).toBeDefined();
  //   });

  //   it("should handle simple string query", async () => {
  //     const request: QueryRequest = {
  //       QUERY: "typescript",
  //     };

  //     const result = await search.query(request);
  //     expect(result.results).toBeDefined();
  //   });

  //   it("should handle AND queries", async () => {
  //     const request: QueryRequest = {
  //       QUERY: {
  //         AND: [
  //           { FIELD: "author", VALUE: "John Doe" },
  //           { FIELD: "tags", VALUE: "programming" },
  //         ],
  //       },
  //     };

  //     const result = await search.query(request);
  //     expect(result.results).toBeDefined();
  //   });

  //   it("should handle OR queries", async () => {
  //     const request: QueryRequest = {
  //       QUERY: {
  //         OR: [
  //           { FIELD: "title", VALUE: "TypeScript" },
  //           { FIELD: "title", VALUE: "JavaScript" },
  //         ],
  //       },
  //     };

  //     const result = await search.query(request);
  //     expect(result.results).toBeDefined();
  //   });

  //   it("should handle range queries", async () => {
  //     const request: QueryRequest = {
  //       QUERY: {
  //         FIELD: "publishedAt",
  //         VALUE: {
  //           GTE: "2024-01-01",
  //           LTE: "2024-12-31",
  //         },
  //       },
  //     };

  //     const result = await search.query(request);
  //     expect(result.results).toBeDefined();
  //   });

  //   it("should handle SORT parameter", async () => {
  //     const request: QueryRequest = {
  //       SORT: {
  //         FIELD: "publishedAt",
  //         DIRECTION: "DESCENDING",
  //         TYPE: "ALPHABETIC",
  //       },
  //     };

  //     const result = await search.query(request);
  //     expect(result.results).toBeDefined();
  //   });

  //   it("should handle PAGE parameter", async () => {
  //     const request: QueryRequest = {
  //       PAGE: {
  //         NUMBER: 1,
  //         SIZE: 10,
  //       },
  //     };

  //     const result = await search.query(request);
  //     expect(result.results).toBeDefined();
  //     expect(result.pages).toBeDefined();
  //   });
  // });

  // describe("error handling", () => {
  //   it("should handle invalid documents gracefully", async () => {
  //     const invalidDoc = { title: "Missing ID" } as TestDocument;
  //     // The current implementation doesn't validate document structure,
  //     // so this test just ensures it doesn't crash
  //     await expect(search.put(invalidDoc)).resolves.not.toThrow();
  //   });
  // });
});
