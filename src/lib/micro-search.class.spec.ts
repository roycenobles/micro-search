import { MicroSearch } from './micro-search.class.js';
import { Document, QueryRequest } from './micro-search.types.js';
import * as fs from 'fs';

// Define test document interface
interface TestDocument extends Document {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  publishedAt: string;
}

describe('MicroSearch', () => {
  let microSearch: MicroSearch<TestDocument>;
  let indexPath: string;
  const testIndices: string[] = [];
  const testDocuments: TestDocument[] = [
    {
      id: '1',
      title: 'Getting Started with TypeScript',
      content: 'TypeScript is a powerful superset of JavaScript...',
      author: 'John Doe',
      tags: ['typescript', 'programming'],
      publishedAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Advanced Search Techniques',
      content: 'Search engines use various algorithms...',
      author: 'Jane Smith',
      tags: ['search', 'algorithms'],
      publishedAt: '2024-01-20'
    },
    {
      id: '3',
      title: 'JavaScript Best Practices',
      content: 'Learn the best practices for writing clean JavaScript code...',
      author: 'John Doe',
      tags: ['javascript', 'programming'],
      publishedAt: '2024-01-10'
    }
  ];

  beforeEach(() => {
    // Create a unique test index name that will be created in a temp location
    const uniqueId = Math.random().toString(36).substring(2, 15);
    indexPath = `index/test-${uniqueId}`;
    testIndices.push(indexPath);
    microSearch = new MicroSearch<TestDocument>(indexPath);
  });

  afterEach(async () => {
    // Clean up the generated index directory after each test
    try {
      if (indexPath && fs.existsSync(indexPath)) {
        fs.rmSync(indexPath, { recursive: true, force: true });
      }
    } catch (error) {
      // Ignore cleanup errors - directory might not exist
    }
  });

  afterAll(async () => {
    // Clean up any remaining test indices
    for (const testIndex of testIndices) {
      try {
        if (fs.existsSync(testIndex)) {
          fs.rmSync(testIndex, { recursive: true, force: true });
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('constructor', () => {
    it('should create a MicroSearch instance', () => {
      expect(microSearch).toBeInstanceOf(MicroSearch);
    });

    it('should accept an index path parameter', () => {
      const uniqueId = Math.random().toString(36).substring(2, 15);
      const customPath = `test-custom-${uniqueId}`;
      testIndices.push(customPath);
      const customSearch = new MicroSearch<TestDocument>(customPath);
      expect(customSearch).toBeInstanceOf(MicroSearch);
      // Cleanup will be handled by afterAll
    });
  });

  describe('put', () => {
    it('should index a single document', async () => {
      await expect(microSearch.put(testDocuments[0])).resolves.not.toThrow();
    });

    it('should handle documents with required id field', async () => {
      const doc: TestDocument = {
        id: 'test-id',
        title: 'Test Document',
        content: 'Test content',
        author: 'Test Author',
        tags: ['test'],
        publishedAt: '2024-01-01'
      };

      await expect(microSearch.put(doc)).resolves.not.toThrow();
    });
  });

  describe('putAll', () => {
    it('should index multiple documents', async () => {
      await expect(microSearch.putAll(testDocuments)).resolves.not.toThrow();
    });

    it('should handle empty array', async () => {
      await expect(microSearch.putAll([])).resolves.not.toThrow();
    });

    it('should handle single document in array', async () => {
      await expect(microSearch.putAll([testDocuments[0]])).resolves.not.toThrow();
    });
  });

  describe('query', () => {
    beforeEach(async () => {
      // Index test documents before each query test
      await microSearch.putAll(testDocuments);
    });

    it('should execute a default query when no QUERY is provided', async () => {
      const request: QueryRequest = {};
      const result = await microSearch.query(request);

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('pages');
      expect(Array.isArray(result.results)).toBe(true);
      expect(typeof result.pages).toBe('object');
    });

    it('should return properly structured response', async () => {
      const request: QueryRequest = {
        QUERY: { FIELD: 'author', VALUE: 'John Doe' }
      };

      const result = await microSearch.query(request);

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('pages');
      expect(result.pages).toHaveProperty('total');
      expect(result.pages).toHaveProperty('current');
      expect(result.pages).toHaveProperty('size');
    });

    it('should handle field-specific search', async () => {
      const request: QueryRequest = {
        QUERY: { FIELD: 'author', VALUE: 'John Doe' }
      };

      const result = await microSearch.query(request);
      expect(result.results).toBeDefined();
    });

    it('should handle simple string query', async () => {
      const request: QueryRequest = {
        QUERY: 'typescript'
      };

      const result = await microSearch.query(request);
      expect(result.results).toBeDefined();
    });

    it('should handle AND queries', async () => {
      const request: QueryRequest = {
        QUERY: {
          AND: [
            { FIELD: 'author', VALUE: 'John Doe' },
            { FIELD: 'tags', VALUE: 'programming' }
          ]
        }
      };

      const result = await microSearch.query(request);
      expect(result.results).toBeDefined();
    });

    it('should handle OR queries', async () => {
      const request: QueryRequest = {
        QUERY: {
          OR: [
            { FIELD: 'title', VALUE: 'TypeScript' },
            { FIELD: 'title', VALUE: 'JavaScript' }
          ]
        }
      };

      const result = await microSearch.query(request);
      expect(result.results).toBeDefined();
    });

    it('should handle range queries', async () => {
      const request: QueryRequest = {
        QUERY: {
          FIELD: 'publishedAt',
          VALUE: {
            GTE: '2024-01-01',
            LTE: '2024-12-31'
          }
        }
      };

      const result = await microSearch.query(request);
      expect(result.results).toBeDefined();
    });

    it('should handle SORT parameter', async () => {
      const request: QueryRequest = {
        SORT: {
          FIELD: 'publishedAt',
          DIRECTION: 'DESCENDING',
          TYPE: 'ALPHABETIC'
        }
      };

      const result = await microSearch.query(request);
      expect(result.results).toBeDefined();
    });

    it('should handle PAGE parameter', async () => {
      const request: QueryRequest = {
        PAGE: {
          NUMBER: 1,
          SIZE: 10
        }
      };

      const result = await microSearch.query(request);
      expect(result.results).toBeDefined();
      expect(result.pages).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle invalid documents gracefully', async () => {
      const invalidDoc = { title: 'Missing ID' } as TestDocument;
      // The current implementation doesn't validate document structure,
      // so this test just ensures it doesn't crash
      await expect(microSearch.put(invalidDoc)).resolves.not.toThrow();
    });
  });
});