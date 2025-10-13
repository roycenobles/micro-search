import { MicroSearch } from './lib/micro-search.class.js';
import { Document } from './lib/micro-search.types.js';

// Define your document type extending the base Document interface
interface BlogPost extends Document {
    id: string;
    title: string;
    content: string;
    author: string;
    tags: string[];
    publishedAt: string;
}

async function example() {
    // Create a MicroSearch instance with proper typing
    const search = new MicroSearch<BlogPost>('index/blog-posts');

    // Sample documents to index
    const posts: BlogPost[] = [
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
        }
    ];

    try {
        // Index documents (properly typed)
        await search.put(posts);

        console.log('Documents indexed successfully');

        // // Example queries with proper typing
        // const queries: Query[] = [
        //     // Simple field search
        //     'typescript',
            
        //     // Field-specific search
        //     {
        //         FIELD: 'author',
        //         VALUE: 'John Doe'
        //     },
            
        //     // AND query
        //     {
        //         AND: [
        //             {
        //                 FIELD: 'tags',
        //                 VALUE: 'programming'
        //             },
        //             {
        //                 FIELD: 'author',
        //                 VALUE: 'John'
        //             }
        //         ]
        //     },
            
        //     // OR query
        //     {
        //         OR: [
        //             {
        //                 FIELD: 'title',
        //                 VALUE: 'TypeScript'
        //             },
        //             {
        //                 FIELD: 'title',
        //                 VALUE: 'Search'
        //             }
        //         ]
        //     },
            
        //     // Range query
        //     {
        //         FIELD: 'publishedAt',
        //         VALUE: {
        //             GTE: '2024-01-01',
        //             LTE: '2024-12-31'
        //         }
        //     }
        // ];

        // // Execute queries and get properly typed results
        // for (const query of queries) {
        //     const result = await search.query(query);
        //     console.log(`Query:`, JSON.stringify(query, null, 2));
        //     console.log(`Found ${result.totalHits} results:`, result.results);
        //     console.log('---');
        // }

        // // Other operations
        // console.log('Total documents:', await search.getDocumentCount());

        // // Delete a document
        // await search.delete(['1']);
        // console.log('Document deleted. New count:', await search.getDocumentCount());

    } catch (error) {
        console.error('Search error:', error);
    }
}

// Run the example
example().catch(console.error);
