# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

MicroSearch is a lightweight TypeScript wrapper around [search-index](https://github.com/fergiemcdowall/search-index) for building fast, in-memory search engines. It's designed as a **personal-use package** optimized for small to medium datasets (up to ~10,000 records).

**Key Design Principles:**
- TypeScript-first with full type safety
- ES modules only (type: "module" in package.json)
- Performance-optimized for datasets under 10k records
- Wrapper architecture that delegates core search functionality to `search-index` library

## Development Commands

### Building
```bash
npm run build
```
Removes `./dist` directory and compiles TypeScript to JavaScript with type declarations.

### Testing
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Important:** Tests require `NODE_OPTIONS='--experimental-vm-modules'` due to ES module usage with Jest.

### Running a Single Test
Use Jest's pattern matching:
```bash
NODE_OPTIONS='--experimental-vm-modules' npx jest -t "test name pattern"
```

Example:
```bash
NODE_OPTIONS='--experimental-vm-modules' npx jest -t "should handle range queries"
```

## Architecture

### Core Structure

```
src/
├── index.ts                    # Public API exports
├── search/
│   ├── micro-search.class.ts  # Main MicroSearch class (wrapper)
│   └── micro-search.spec.ts   # Comprehensive test suite
├── types/
│   ├── documents.ts           # Document base type
│   ├── queries.ts             # Query request/response types
│   ├── tokens.ts              # Query token types (AND/OR/NOT/Field/Range)
│   └── search-index.d.ts      # Type definitions for search-index library
└── assets/                    # Test fixtures (e.g., programming-books.ts)
```

### Key Architectural Patterns

1. **Wrapper Pattern**: `MicroSearch` class wraps `search-index` library, providing a cleaner, type-safe API
2. **Generic Type System**: All classes/types are generic over `T extends Document` for type safety
3. **Token-Based Queries**: Query syntax uses uppercase token objects (FIELD, VALUE, AND, OR, NOT, etc.)
4. **Custom Tokenization**: Supports keyword fields (non-tokenized) via the `keywords` parameter in `putMany()`

### Important Implementation Details

- **Index Path**: Constructor takes a path string that becomes the index name for `search-index`
- **Internal ID Mapping**: Documents use `id` field externally but are stored as `_id` internally
- **Auto-Indexing Timestamp**: All documents get an `_indexed` timestamp field added automatically
- **Tokenization Pipeline**: Custom tokenizer that conditionally bypasses tokenization for keyword fields
- **Module Extensions**: All internal imports use `.js` extension (required for ES modules with Node.js)

## Type System

### Core Types

- **Document**: Base type requiring `id: string` + any additional fields
- **Token**: Union type representing query operations (Field, FieldValueToken, ANDQuery, ORQuery, NOTQuery)
- **QueryRequest**: Contains optional QUERY, SORT, and PAGE parameters
- **QueryResponse**: Returns RESULTS array and PAGING metadata

### Query Token Types

- `FieldOnlyToken`: `{ FIELD: string | string[] }` - existence check
- `FieldValueToken`: `{ FIELD: string | string[], VALUE: string | Range }` - field/value search
- `Range`: `{ GTE: string | number, LTE: string | number }` - range queries
- `ANDQuery`: `{ AND: Token[] }` - all tokens must match
- `ORQuery`: `{ OR: Token[] }` - any token can match
- `NOTQuery`: `{ NOT: { INCLUDE: Token, EXCLUDE: Token } }` - include/exclude pattern

## Testing Approach

- **Test Framework**: Jest with ts-jest preset for ESM
- **Test Location**: Co-located `*.spec.ts` files next to source files
- **Test Data**: Uses fixtures from `assets/` (e.g., `ProgrammingBooks` array)
- **Test Cleanup**: Uses temporary index directories with UUID names, cleaned up in `afterAll`
- **Test Structure**: Organized by method with nested `describe` blocks

### Test Patterns

```typescript
// Typical test setup
let ms: MicroSearch<ProgrammingBook>;
let index: string;

beforeAll(async () => {
  index = `./index/${uuid()}`;
  ms = new MicroSearch<ProgrammingBook>(index);
});

afterAll(() => {
  fs.rmSync(index, { recursive: true });
});
```

## Module System Considerations

This project uses ES modules exclusively:

- **Import Extensions**: Always use `.js` extension in imports (even for `.ts` files)
  - Example: `import { Document } from "../types/documents.js";`
- **tsconfig**: `"module": "nodenext"` and `"moduleResolution": "nodenext"`
- **package.json**: `"type": "module"`
- **Jest Config**: Special ESM handling with `extensionsToTreatAsEsm` and module name mapper

## Performance Considerations

When working on this codebase, keep in mind:

- Target use case is datasets < 10,000 records
- Performance degrades non-linearly beyond 10k records
- Batch operations (`putMany`, `deleteMany`) are significantly more efficient than single operations
- Index storage is persistent on disk at the specified `indexPath`

## Common Pitfalls

1. **Forgetting `.js` extensions**: All imports must include `.js` extension for ES module compatibility
2. **Direct search-index usage**: Avoid bypassing the MicroSearch wrapper; maintain abstraction
3. **Missing keyword fields**: Fields intended as exact-match should be specified in `keywords` array
4. **Test isolation**: Always use unique index paths (via UUID) to avoid test interference
