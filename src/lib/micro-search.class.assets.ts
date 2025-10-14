import { Document } from "./micro-search.types.js";

export interface TestDocument extends Document {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
}

export const TestDocuments: TestDocument[] = [
  {
    id: "1",
    title: "Getting Started with TypeScript",
    content: "TypeScript is a powerful superset of JavaScript...",
    author: "John Doe",
    tags: ["typescript", "programming"],
  },
  {
    id: "2",
    title: "Advanced Search Techniques",
    content: "Search engines use various algorithms...",
    author: "Jane Smith",
    tags: ["search", "algorithms"],
  },
  {
    id: "3",
    title: "JavaScript Best Practices",
    content: "Learn the best practices for writing clean JavaScript code...",
    author: "John Doe",
    tags: ["javascript", "programming"],
  },
];
