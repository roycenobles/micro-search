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

  describe("query", () => {
    beforeAll(async () => {
      await ms.flush();
      await ms.putMany(TestDocuments);
    });

    it("should execute a default query when no QUERY is provided", async () => {
      const request: QueryRequest = {};

      const response = await ms.query(request);

      expect(Array.isArray(response.results)).toBe(true);
      expect(typeof response.pages).toBe("object");

      // uses default page size of 20
      expect(response.results.length).toBe(20);
      expect(response.pages.size).toBe(20);
      expect(response.pages.current).toBe(0);
      expect(response.pages.total).toBe(2);
    });

    it("should handle simple string query across all fields", async () => {
      const request: QueryRequest = {
        QUERY: "typescript",
      };

      const response = await ms.query(request);

      expect(response.results.length).toBe(1);
      expect(response.results[0].title).toBe("Effective TypeScript");
      expect(response.results[0].author).toBe("Dan Vanderkam");
      expect(response.results[0].tags).toContain("typescript");
    });

    it("should handle field-specific search", async () => {
      const request: QueryRequest = {
        QUERY: { FIELD: "author", VALUE: "Robert" },
      };

      const response = await ms.query(request);

      expect(response.results.length).toBe(1);
      expect(response.results[0].author).toBe("Robert C. Martin");
      expect(response.results[0].title).toBe(
        "Clean Code: A Handbook of Agile Software Craftsmanship"
      );
    });

    it("should handle AND queries to further filter results", async () => {
      const request: QueryRequest = {
        QUERY: {
          AND: [
            { FIELD: "author", VALUE: "David" },
            { FIELD: "tags", VALUE: "continuous" },
          ],
        },
      };

      const response = await ms.query(request);

      expect(response.results.length).toBe(1);

      expect(response.results[0].author).toBe("Jez Humble, David Farley");
      expect(response.results[0].title).toBe("Continuous Delivery");
      expect(response.results[0].tags).toContain("continuous delivery");
    });
  });

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
