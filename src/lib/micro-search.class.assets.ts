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
  {
    id: "c1d2e3f4-1111-2222-3333-444455556677",
    title: "The C Programming Language",
    content: "Classic introduction to the C programming language.",
    author: "Brian W. Kernighan, Dennis M. Ritchie",
    tags: ["c", "programming", "language"],
  },
  {
    id: "d2e3f4a5-2222-3333-4444-555566667788",
    title: "Patterns of Enterprise Application Architecture",
    content: "A catalog of patterns for enterprise software architecture.",
    author: "Martin Fowler",
    tags: ["architecture", "enterprise", "patterns"],
  },
  {
    id: "e3f4a5b6-3333-4444-5555-666677778899",
    title: "Domain-Driven Design: Tackling Complexity in the Heart of Software",
    content: "Principles and patterns for domain-driven design.",
    author: "Eric Evans",
    tags: ["domain-driven design", "architecture", "software"],
  },
  {
    id: "f4a5b6c7-4444-5555-6666-777788889900",
    title: "Introduction to the Theory of Programming Languages",
    content: "A comprehensive introduction to programming language theory.",
    author: "Bertrand Meyer",
    tags: ["programming languages", "theory", "computer science"],
  },
  {
    id: "a5b6c7d8-5555-6666-7777-888899990011",
    title: "Programming Rust",
    content: "A practical guide to systems programming with Rust.",
    author: "Jim Blandy, Jason Orendorff",
    tags: ["rust", "systems programming", "language"],
  },
  {
    id: "b6c7d8e9-6666-7777-8888-999900001122",
    title: "Eloquent JavaScript",
    content: "A modern introduction to programming in JavaScript.",
    author: "Marijn Haverbeke",
    tags: ["javascript", "programming", "web"],
  },
  {
    id: "c7d8e9f0-7777-8888-9999-000011112233",
    title: "Pro Git",
    content: "Comprehensive guide to Git version control.",
    author: "Scott Chacon, Ben Straub",
    tags: ["git", "version control", "software"],
  },
  {
    id: "d8e9f0a1-8888-9999-0000-111122223344",
    title: "The Little Schemer",
    content: "A playful introduction to recursive programming in Scheme.",
    author: "Daniel P. Friedman, Matthias Felleisen",
    tags: ["scheme", "recursion", "functional programming"],
  },
  {
    id: "e9f0a1b2-9999-0000-1111-222233334455",
    title: "Programming Elixir",
    content: "A guide to functional programming with Elixir.",
    author: "Dave Thomas",
    tags: ["elixir", "functional programming", "language"],
  },
  {
    id: "f0a1b2c3-0000-1111-2222-333344445566",
    title: "Grokking Algorithms",
    content: "An illustrated guide for learning algorithms.",
    author: "Aditya Bhargava",
    tags: ["algorithms", "illustrated", "computer science"],
  },
];
