import { beforeEach, expect, test } from "vitest";
import { BookFactory } from "./Mocks/BookFactory";
import { BooksDB } from "./Mocks/BookModel";

beforeEach(() => {
  BooksDB.truncate();
});

test("Can create a model", (): void => {
  const book = BookFactory.create(false);

  expect(book).toBeDefined();
  expect(BooksDB.count(false)).toBe(1);
});

test("Can create many models", (): void => {
  const books = BookFactory.createMany(5);

  expect(books.length).toBeGreaterThan(0);
  expect(BooksDB.count(false)).toBe(5);
});

test("Can make a model definition", (): void => {
  const definition = BookFactory.make();

  expect(definition).toBeDefined();
});

test("Can make many model definitions", (): void => {
  const definitions = BookFactory.makeMany(5);

  expect(definitions).toBeDefined();
  expect(definitions.length).toBe(5);
});

test("Can override factory state", (): void => {
  const book = BookFactory.asRead().create();

  expect(book.read).toBe(true);
  expect(BooksDB.find(book.id)?.read).toBe(true);
});

test("Can revert factory state", (): void => {
  const firstBook = BookFactory.asRead().create();
  const secondBook = BookFactory.create();

  expect(firstBook.read).toBe(true);
  expect(secondBook.read).toBe(false);
});

test("Can revert factory state during mass creation", (): void => {
  const firstBatch = BookFactory.asRead().createMany(2);
  const secondBatch = BookFactory.createMany(2);

  expect(firstBatch[0].read).toBe(true);
  expect(secondBatch[0].read).toBe(false);
});
