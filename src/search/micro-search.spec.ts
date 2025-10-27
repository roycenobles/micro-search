import { v4 as uuid } from "uuid";
import { QueryRequest } from "../types/queries.js";
import { ProgrammingBook, ProgrammingBooks } from "../assets/programming-books.js";
import { MicroSearch } from "./micro-search.class.js";
import fs from "fs";

describe("MicroSearch", () => {
	let ms: MicroSearch<ProgrammingBook>;
	let index: string;

	beforeAll(async () => {
		index = `./index/${uuid()}`;
		ms = new MicroSearch<ProgrammingBook>(index);
	});

	afterAll(() => {
		fs.rmSync(index, { recursive: true });
	});

	describe("delete", () => {
		beforeEach(async () => {
			await ms.truncate();
			await ms.putMany(ProgrammingBooks, ["published"]);

			await ms.flush();
		});

		it("should delete a document by ID", async () => {
			await expect(ms.delete(ProgrammingBooks[0])).resolves.not.toThrow();
			await expect(ms.count()).resolves.toBe(ProgrammingBooks.length - 1);
		});

		it("should delete multiple documents by ID", async () => {
			await expect(ms.deleteMany([ProgrammingBooks[0], ProgrammingBooks[1]])).resolves.not.toThrow();
			await expect(ms.count()).resolves.toBe(ProgrammingBooks.length - 2);
		});
	});

	describe("put", () => {
		beforeEach(async () => {
			await ms.truncate();
		});

		it("should index a single document", async () => {
			await expect(ms.put(ProgrammingBooks[0])).resolves.not.toThrow();
			await expect(ms.count()).resolves.toBe(1);
		});

		it("should index multiple documents", async () => {
			await expect(ms.putMany(ProgrammingBooks)).resolves.not.toThrow();
			await expect(ms.count()).resolves.toBe(ProgrammingBooks.length);
		});

		it("should handle single document in array", async () => {
			await expect(ms.putMany([ProgrammingBooks[0]])).resolves.not.toThrow();
			await expect(ms.count()).resolves.toBe(1);
		});

		it("should handle empty array", async () => {
			await expect(ms.putMany([])).resolves.not.toThrow();
			await expect(ms.count()).resolves.toBe(0);
		});
	});

	describe("query", () => {
		beforeAll(async () => {
			await ms.truncate();
			await ms.putMany(ProgrammingBooks, ["published"]);
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
				QUERY: "typescript"
			};

			const response = await ms.query(request);

			expect(response.RESULTS.length).toBe(1);
			expect(response.RESULTS[0].title).toBe("Effective TypeScript");
			expect(response.RESULTS[0].author).toBe("Dan Vanderkam");
			expect(response.RESULTS[0].tags).toContain("typescript");
		});

		it("should handle field-specific search", async () => {
			const request: QueryRequest = {
				QUERY: { FIELD: "author", VALUE: "Robert" }
			};

			const response = await ms.query(request);

			expect(response.RESULTS.length).toBe(1);
			expect(response.RESULTS[0].author).toBe("Robert C. Martin");
			expect(response.RESULTS[0].title).toBe("Clean Code: A Handbook of Agile Software Craftsmanship");
		});

		it("should handle AND queries to further filter results", async () => {
			const request: QueryRequest = {
				QUERY: {
					AND: [
						// author is david farley and tags include continuous
						{ FIELD: "author", VALUE: "David" },
						{ FIELD: "author", VALUE: "Farley" },
						{ FIELD: "tags", VALUE: "continuous" }
					]
				}
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
						{ FIELD: "title", VALUE: "JavaScript" }
					]
				}
			};

			const response = await ms.query(request);

			expect(response.RESULTS.length).toBe(3);

			const titles = response.RESULTS.map((doc: ProgrammingBook) => doc.title);

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
						LTE: "1994-12-31"
					}
				}
			};

			const response = await ms.query(request);

			expect(response.RESULTS.length).toBe(1);
			expect(response.RESULTS[0].id).toBe("c3a4b5c6-3333-4444-5555-666677778888");
			expect(response.RESULTS[0].title).toBe("Design Patterns: Elements of Reusable Object-Oriented Software");
		});

		it("should handle ascending sort on dates", async () => {
			const request: QueryRequest = {
				QUERY: {
					FIELD: "published",
					VALUE: {
						GTE: "2008-01-01",
						LTE: "2008-12-31"
					}
				},
				SORT: {
					FIELD: "published",
					DIRECTION: "ASCENDING"
				}
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
						LTE: "2008-12-31"
					}
				},
				SORT: {
					FIELD: "published",
					DIRECTION: "DESCENDING"
				}
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
						LTE: 2001
					}
				},
				SORT: {
					FIELD: "publishedYear",
					DIRECTION: "DESCENDING"
				}
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
					SIZE: 10
				}
			});

			expect(response.RESULTS.length).toBe(10);

			expect(response.PAGING.SIZE).toBe(10);
			expect(response.PAGING.OFFSET).toBe(0);
			expect(response.PAGING.PAGES).toBe(3);

			response = await ms.query({
				PAGE: {
					NUMBER: 1, // second page
					SIZE: 10
				}
			});

			expect(response.RESULTS.length).toBe(10);

			expect(response.PAGING.SIZE).toBe(10);
			expect(response.PAGING.OFFSET).toBe(10);
			expect(response.PAGING.PAGES).toBe(3);

			response = await ms.query({
				PAGE: {
					NUMBER: 2, // third page
					SIZE: 10
				}
			});

			expect(response.RESULTS.length).toBe(10);

			expect(response.PAGING.SIZE).toBe(10);
			expect(response.PAGING.OFFSET).toBe(20);
			expect(response.PAGING.PAGES).toBe(3);

			response = await ms.query({
				PAGE: {
					NUMBER: 3, // fourth page
					SIZE: 10
				}
			});

			expect(response.RESULTS.length).toBe(0); // no more results

			expect(response.PAGING.SIZE).toBe(10);
			expect(response.PAGING.OFFSET).toBe(30);
			expect(response.PAGING.PAGES).toBe(3);
		});
	});

	describe("import/export/flush", () => {
		interface TestDocument {
			id: string;
			title: string;
			description: string;
			category: string;
			price: number;
			date: string;
		}

		it("should only export when flush() is called", async () => {
			const testIndex = `./index/${uuid()}`;
			const testMs = new MicroSearch<TestDocument>(testIndex);

			try {
				const testDoc: TestDocument = {
					id: uuid(),
					title: "Test Product",
					description: "A test product",
					category: "test",
					price: 100,
					date: new Date().toISOString()
				};

				// putMany should not create export file
				await testMs.putMany([testDoc]);
				expect(fs.existsSync(`${testIndex}/index.gz`)).toBe(false);

				// flush should create export file
				await testMs.flush();
				expect(fs.existsSync(`${testIndex}/index.gz`)).toBe(true);

				// second flush should not error (idempotent)
				await testMs.flush();
				expect(fs.existsSync(`${testIndex}/index.gz`)).toBe(true);
			} finally {
				fs.rmSync(testIndex, { recursive: true });
			}
		});

		it("should handle export and import of 50,000 entries with compression", async () => {
			const testIndex = `./index/${uuid()}`;
			const testMs = new MicroSearch<TestDocument>(testIndex);

			try {
				// Generate 50,000 test documents
				const categories = ["electronics", "books", "clothing", "food", "toys"];
				const testDocs: TestDocument[] = Array.from({ length: 50000 }, (_, i) => ({
					id: uuid(),
					title: `Test Product ${i}`,
					description: `This is a detailed description for product number ${i} with various keywords and content`,
					category: categories[i % categories.length],
					price: Math.floor(Math.random() * 1000),
					date: new Date(2020 + (i % 5), i % 12, (i % 28) + 1).toISOString()
				}));

				// Index documents
				const indexStart = performance.now();
				await testMs.putMany(testDocs);
				const indexTime = performance.now() - indexStart;

				expect(await testMs.count()).toBe(50000);
				console.log(`Indexed 50,000 documents in ${indexTime.toFixed(2)}ms`);

				// Export (with compression)
				const exportStart = performance.now();
				const exportPath = await testMs.export();
				const exportTime = performance.now() - exportStart;

				expect(exportPath).toContain("index.gz");
				expect(fs.existsSync(exportPath)).toBe(true);

				const fileStats = fs.statSync(exportPath);
				const fileSizeMB = fileStats.size / (1024 * 1024);
				console.log(`Exported to ${fileSizeMB.toFixed(2)}MB (compressed) in ${exportTime.toFixed(2)}ms`);

				// Clear index
				await testMs.truncate();
				expect(await testMs.count()).toBe(0);

				// Import (decompression)
				const importStart = performance.now();
				await testMs.import();
				const importTime = performance.now() - importStart;

				expect(await testMs.count()).toBe(50000);
				console.log(`Imported 50,000 documents in ${importTime.toFixed(2)}ms`);

				// Verify data integrity with a sample query
				const results = await testMs.query({
					QUERY: { FIELD: "category", VALUE: "electronics" },
					PAGE: { NUMBER: 0, SIZE: 100 }
				});

				expect(results.RESULTS.length).toBeGreaterThan(0);
				expect(results.RESULTS.every((doc) => doc.category === "electronics")).toBe(true);

				// Performance summary
				console.log("\nPerformance Summary:");
				console.log(`  Indexing: ${(indexTime / 50000).toFixed(4)}ms per document`);
				console.log(`  Export: ${(exportTime / 50000).toFixed(4)}ms per document`);
				console.log(`  Import: ${(importTime / 50000).toFixed(4)}ms per document`);
				console.log(`  Compression ratio: ${((1 - fileSizeMB / 30) * 100).toFixed(1)}% (estimated)`);
			} finally {
				// Cleanup
				fs.rmSync(testIndex, { recursive: true });
			}
		}, 60000); // 60 second timeout for large dataset
	});
});
