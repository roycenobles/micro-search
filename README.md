# MicroSearch

A lightweight TypeScript wrapper around [search-index](https://github.com/fergiemcdowall/search-index) for building fast, in-memory search engines suitable for small to medium-sized datasets.

## 🚨 Important Notice

**This package is designed for personal use in my own projects.** By using this software, you assume all risks and responsibilities. This is experimental software that may contain bugs, performance issues, or other problems. Use at your own risk.

## Overview

MicroSearch provides a simple, type-safe interface for full-text search with:

-  **TypeScript-first design** with full type safety
-  **Flexible querying** with field searches, range queries, AND/OR logic
-  **Batch operations** for efficient bulk indexing
-  **Memory-efficient** storage for datasets up to ~10,000 records

## Performance Characteristics

Based on performance testing:

| Dataset Size    | Indexing Speed | Query Speed  | Memory/Record | Recommended Use |
| --------------- | -------------- | ------------ | ------------- | --------------- |
| 1,000 records   | 3,901 rec/sec  | 0.17-8.25ms  | 83.46 KB      | ✅ Excellent    |
| 10,000 records  | 1,902 rec/sec  | 0.28-71.66ms | 17.01 KB      | ✅ Very Good    |
| 100,000 records | 258 rec/sec    | 0.40-895ms   | 4.79 KB       | ⚠️ Usable\*     |

\*Performance degrades significantly beyond 10k records due to non-linear scaling.

## Installation

```bash
npm install micro-search
```

## Quick Start

```typescript
import { MicroSearch } from "micro-search";

// Define your document type
interface Book {
	id: string;
	title: string;
	author: string;
	content: string;
	tags: string[];
	publishedYear: number;
}

// Create search instance
const search = new MicroSearch<Book>("./my-search-index");

// Index documents
await search.putMany([
	{
		id: "1",
		title: "Clean Code",
		author: "Robert C. Martin",
		content: "A guide to writing clean, maintainable code...",
		tags: ["programming", "software", "best-practices"],
		publishedYear: 2008
	}
	// ... more books
]);

// Search with various query types
const results = await search.query({
	QUERY: { FIELD: "tags", VALUE: "programming" },
	PAGE: { NUMBER: 0, SIZE: 10 }
});

console.log(`Found ${results.RESULTS.length} books`);
```

## API Reference

### Constructor

```typescript
new MicroSearch<T>(indexPath: string)
```

Creates a new search instance with persistent storage at the specified path.

### Methods

#### `putMany(docs: T[], keywords?: string[]): Promise<void>`

Indexes multiple documents. The `keywords` parameter specifies fields that should be treated as exact matches (not tokenized).

```typescript
await search.putMany(books, ["author"]); // Author field won't be tokenized
```

#### `put(doc: T): Promise<void>`

Indexes a single document.

#### `query(request: QueryRequest): Promise<QueryResponse<T>>`

Performs a search query.

#### `count(): Promise<number>`

Returns the total number of indexed documents.

#### `delete(doc: T): Promise<void>`

Deletes a document from the index.

#### `truncate(): Promise<void>`

Removes all documents from the index.

## Query Examples

### Simple Field Search

```typescript
const results = await search.query({
	QUERY: { FIELD: "title", VALUE: "Clean Code" }
});
```

### Range Query

```typescript
const results = await search.query({
	QUERY: { FIELD: "publishedYear", VALUE: { GTE: 2000, LTE: 2024 } }
});
```

### AND Query

```typescript
const results = await search.query({
	QUERY: {
		AND: [
			{ FIELD: "tags", VALUE: "programming" },
			{ FIELD: "publishedYear", VALUE: { GTE: 2020, LTE: 2024 } }
		]
	}
});
```

### OR Query

```typescript
const results = await search.query({
	QUERY: {
		OR: [
			{ FIELD: "tags", VALUE: "javascript" },
			{ FIELD: "tags", VALUE: "typescript" }
		]
	}
});
```

### Pagination and Sorting

```typescript
const results = await search.query({
	QUERY: { FIELD: "tags", VALUE: "programming" },
	PAGE: { NUMBER: 1, SIZE: 20 },
	SORT: { FIELD: "publishedYear", DIRECTION: "DESCENDING" }
});
```

## Type Definitions

All types are fully documented with TypeScript interfaces. Key types include:

-  `Document`: Base document interface requiring an `id` field
-  `QueryRequest`: Search query configuration
-  `QueryResponse<T>`: Search results with pagination info
-  `Token`: Query token types (field searches, ranges, AND/OR operations)

## Performance Tips

1. **Keep datasets under 10,000 records** for optimal performance
2. **Use batch indexing** with `putMany()` instead of multiple `put()` calls
3. **Specify keyword fields** to avoid unnecessary tokenization
4. **Use pagination** for large result sets
5. **Consider index partitioning** for very large datasets

## Dependencies

This package wraps [search-index](https://github.com/fergiemcdowall/search-index) by Fergus McDowall. All credit for the core search functionality goes to the search-index project and its contributors.

## License

MIT License - see [LICENSE](./LICENSE) file.

## Disclaimer

**USE AT YOUR OWN RISK.** This software is provided "AS IS" without warranty of any kind. The author assumes no responsibility for any issues, data loss, or other problems that may arise from using this software. This package is intended for personal use in the author's projects and may not be suitable for production use.

## Contributing

This is a personal project. While issues and suggestions are welcome, please understand that this package is primarily maintained for personal use cases.
