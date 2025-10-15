import fs from "fs";
import { v4 as uuid } from "uuid";
import { QueryRequest } from "../types/queries.js";
import { TestDocument, TestDocuments } from "./micro-search.assets.js";
import { MicroSearch } from "./micro-search.class.js";

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
      await ms.putMany(TestDocuments, { skipTokenization: ["published"] });
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
      await ms.putMany(TestDocuments, { skipTokenization: ["published"] });
    });

    it("should execute a default query when no QUERY is provided", async () => {
      const request: QueryRequest = {};

      const response = await ms.query(request);

      expect(Array.isArray(response.RESULTS)).toBe(true);
      expect(typeof response.PAGING).toBe("object");

      // uses default page size of 20
      expect(response.RESULTS.length).toBe(20);
      expect(response.PAGING.SIZE).toBe(20);
      expect(response.PAGING.OFFSET).toBe(0);
      expect(response.PAGING.PAGES).toBe(2);
    });

    it("should handle simple string query across all fields", async () => {
      const request: QueryRequest = {
        QUERY: "typescript",
      };

      const response = await ms.query(request);

      expect(response.RESULTS.length).toBe(1);
      expect(response.RESULTS[0].title).toBe("Effective TypeScript");
      expect(response.RESULTS[0].author).toBe("Dan Vanderkam");
      expect(response.RESULTS[0].tags).toContain("typescript");
    });

    it("should handle field-specific search", async () => {
      const request: QueryRequest = {
        QUERY: { FIELD: "author", VALUE: "Robert" },
      };

      const response = await ms.query(request);

      expect(response.RESULTS.length).toBe(1);
      expect(response.RESULTS[0].author).toBe("Robert C. Martin");
      expect(response.RESULTS[0].title).toBe(
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

      expect(response.RESULTS.length).toBe(1);

      expect(response.RESULTS[0].author).toBe("Jez Humble, David Farley");
      expect(response.RESULTS[0].title).toBe("Continuous Delivery");
      expect(response.RESULTS[0].tags).toContain("continuous delivery");
    });

    it("should handle OR queries to broaden search", async () => {
      const request: QueryRequest = {
        QUERY: {
          OR: [
            { FIELD: "title", VALUE: "TypeScript" },
            { FIELD: "title", VALUE: "JavaScript" },
          ],
        },
      };

      const response = await ms.query(request);

      expect(response.RESULTS.length).toBe(3);

      const titles = response.RESULTS.map((doc: TestDocument) => doc.title);

      expect(titles).toContain("Effective TypeScript");
      expect(titles).toContain("JavaScript: The Good Parts");
      expect(titles).toContain("Eloquent JavaScript");
    });

    it("should handle range queries", async () => {
      const request: QueryRequest = {
        QUERY: {
          FIELD: "published",
          VALUE: {
            GTE: "1994-01-01",
            LTE: "1994-12-31",
          },
        },
      };

      const response = await ms.query(request);

      expect(response.RESULTS.length).toBe(1);
      expect(response.RESULTS[0].id).toBe("c3a4b5c6-3333-4444-5555-666677778888");
      expect(response.RESULTS[0].title).toBe(
        "Design Patterns: Elements of Reusable Object-Oriented Software"
      );
    });

    it("should handle ascending sort on dates", async () => {
      const request: QueryRequest = {
        QUERY: {
          FIELD: "published",
          VALUE: {
            GTE: "2008-01-01",
            LTE: "2008-12-31",
          },
        },
        SORT: {
          FIELD: "published",
          DIRECTION: "ASCENDING",
        },
      };

      const response = await ms.query(request);

      expect(response.RESULTS.length).toBe(2);
      expect(response.RESULTS[0].published).toBe("2008-05-15");
      expect(response.RESULTS[1].published).toBe("2008-08-01");
    });

    it("should handle descending sort on dates", async () => {
      const request: QueryRequest = {
        QUERY: {
          FIELD: "published",
          VALUE: {
            GTE: "2008-01-01",
            LTE: "2008-12-31",
          },
        },
        SORT: {
          FIELD: "published",
          DIRECTION: "DESCENDING",
        },
      };

      const response = await ms.query(request);

      expect(response.RESULTS.length).toBe(2);
      expect(response.RESULTS[0].published).toBe("2008-08-01");
      expect(response.RESULTS[1].published).toBe("2008-05-15");
    });

    it("should handle sorting numeric fields", async () => {
      const request: QueryRequest = {
        QUERY: {
          FIELD: "publishedYear",
          VALUE: {
            GTE: 1999,
            LTE: 2001,
          },
        },
        SORT: {
          FIELD: "publishedYear",
          DIRECTION: "DESCENDING",
        },
      };

      const response = await ms.query(request);

      expect(response.RESULTS.length).toBe(3);
      expect(response.RESULTS[0].publishedYear).toBe(2001);
      expect(response.RESULTS[1].publishedYear).toBe(1999);
      expect(response.RESULTS[2].publishedYear).toBe(1999);
    });

    it("should handle basic pagination", async () => {
      let response = await ms.query({
        PAGE: {
          NUMBER: 0, // first page
          SIZE: 10,
        },
      });

      expect(response.RESULTS.length).toBe(10);

      expect(response.PAGING.SIZE).toBe(10);
      expect(response.PAGING.OFFSET).toBe(0);
      expect(response.PAGING.PAGES).toBe(3);

      response = await ms.query({
        PAGE: {
          NUMBER: 1, // second page
          SIZE: 10,
        },
      });

      expect(response.RESULTS.length).toBe(10);

      expect(response.PAGING.SIZE).toBe(10);
      expect(response.PAGING.OFFSET).toBe(10);
      expect(response.PAGING.PAGES).toBe(3);

      response = await ms.query({
        PAGE: {
          NUMBER: 2, // third page
          SIZE: 10,
        },
      });

      expect(response.RESULTS.length).toBe(10);

      expect(response.PAGING.SIZE).toBe(10);
      expect(response.PAGING.OFFSET).toBe(20);
      expect(response.PAGING.PAGES).toBe(3);

      response = await ms.query({
        PAGE: {
          NUMBER: 3, // fourth page
          SIZE: 10,
        },
      });

      expect(response.RESULTS.length).toBe(0); // no more results

      expect(response.PAGING.SIZE).toBe(10);
      expect(response.PAGING.OFFSET).toBe(30);
      expect(response.PAGING.PAGES).toBe(3);
    });
  });
});
