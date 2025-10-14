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
    id: "a1e2c3d4-1111-2222-3333-444455556666",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    content:
      "Clean Code teaches principles and best practices for writing clean, maintainable code.",
    author: "Robert C. Martin",
    tags: ["clean code", "software", "best practices"],
  },
  {
    id: "b2f3e4a5-2222-3333-4444-555566667777",
    title: "The Pragmatic Programmer",
    content:
      "A guide to pragmatic thinking and effective software development.",
    author: "Andrew Hunt, David Thomas",
    tags: ["pragmatic", "software", "development"],
  },
  {
    id: "c3a4b5c6-3333-4444-5555-666677778888",
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    content:
      "Classic book introducing design patterns for object-oriented programming.",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    tags: ["design patterns", "object-oriented", "software"],
  },
  {
    id: "d4b5c6d7-4444-5555-6666-777788889999",
    title: "Refactoring: Improving the Design of Existing Code",
    content:
      "Techniques for refactoring code to improve its structure and readability.",
    author: "Martin Fowler",
    tags: ["refactoring", "code quality", "software"],
  },
  {
    id: "e5c6d7e8-5555-6666-7777-888899990000",
    title: "You Don't Know JS Yet",
    content: "Deep dive into JavaScript core concepts and mechanics.",
    author: "Kyle Simpson",
    tags: ["javascript", "programming", "js"],
  },
  {
    id: "f6d7e8f9-6666-7777-8888-999900001111",
    title: "Introduction to Algorithms",
    content: "Comprehensive textbook on algorithms and data structures.",
    author:
      "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    tags: ["algorithms", "data structures", "computer science"],
  },
  {
    id: "a7e8f9a0-7777-8888-9999-000011112222",
    title: "Effective Java",
    content: "Best practices and tips for writing effective Java code.",
    author: "Joshua Bloch",
    tags: ["java", "best practices", "programming"],
  },
  {
    id: "b8f9a0b1-8888-9999-0000-111122223333",
    title: "Code Complete",
    content: "A practical handbook of software construction.",
    author: "Steve McConnell",
    tags: ["software", "construction", "best practices"],
  },
  {
    id: "c9a0b1c2-9999-0000-1111-222233334444",
    title: "Structure and Interpretation of Computer Programs",
    content: "Classic introduction to computer science using Scheme.",
    author: "Harold Abelson, Gerald Jay Sussman",
    tags: ["computer science", "scheme", "programming"],
  },
  {
    id: "d0b1c2d3-0000-1111-2222-333344445555",
    title: "Working Effectively with Legacy Code",
    content: "Strategies for maintaining and improving legacy codebases.",
    author: "Michael Feathers",
    tags: ["legacy code", "maintenance", "refactoring"],
  },
  {
    id: "e1c2d3e4-1111-2222-3333-444455556666",
    title: "Head First Design Patterns",
    content: "A visually rich guide to learning design patterns.",
    author: "Eric Freeman, Bert Bates, Kathy Sierra, Elisabeth Robson",
    tags: ["design patterns", "object-oriented", "software"],
  },
  {
    id: "f2d3e4f5-2222-3333-4444-555566667777",
    title: "Programming Pearls",
    content: "Essays on programming techniques and problem solving.",
    author: "Jon Bentley",
    tags: ["programming", "techniques", "problem solving"],
  },
  {
    id: "a3e4f5a6-3333-4444-5555-666677778888",
    title: "The Art of Computer Programming",
    content: "Comprehensive reference on algorithms and programming theory.",
    author: "Donald E. Knuth",
    tags: ["algorithms", "computer science", "theory"],
  },
  {
    id: "b4f5a6b7-4444-5555-6666-777788889999",
    title: "JavaScript: The Good Parts",
    content: "A focused look at the best features of JavaScript.",
    author: "Douglas Crockford",
    tags: ["javascript", "programming", "js"],
  },
  {
    id: "c5a6b7c8-5555-6666-7777-888899990000",
    title: "Test-Driven Development: By Example",
    content: "Introduction to test-driven development techniques.",
    author: "Kent Beck",
    tags: ["testing", "tdd", "software"],
  },
  {
    id: "d6b7c8d9-6666-7777-8888-999900001111",
    title: "Continuous Delivery",
    content:
      "Principles and practices for delivering software rapidly and reliably.",
    author: "Jez Humble, David Farley",
    tags: ["continuous delivery", "devops", "software"],
  },
  {
    id: "e7c8d9e0-7777-8888-9999-000011112222",
    title: "The Mythical Man-Month",
    content: "Essays on software engineering and project management.",
    author: "Frederick P. Brooks Jr.",
    tags: ["software engineering", "project management", "essays"],
  },
  {
    id: "f8d9e0f1-8888-9999-0000-111122223333",
    title: "Introduction to the Theory of Computation",
    content: "Textbook covering automata, computability, and complexity.",
    author: "Michael Sipser",
    tags: ["computation", "theory", "computer science"],
  },
  {
    id: "a9e0f1a2-9999-0000-1111-222233334444",
    title: "Python Crash Course",
    content: "A fast-paced introduction to Python programming.",
    author: "Eric Matthes",
    tags: ["python", "programming", "introduction"],
  },
  {
    id: "b0f1a2b3-0000-1111-2222-333344445555",
    title: "Effective TypeScript",
    content: "Best practices for using TypeScript effectively.",
    author: "Dan Vanderkam",
    tags: ["typescript", "best practices", "programming"],
  },
];
