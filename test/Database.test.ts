import { beforeEach, expect, test } from "vitest";
import { Database } from "../src/Base/Database";
import { BookFactory } from "./Mocks/BookFactory";
import { BookModel, BooksDB, IBook } from "./Mocks/BookModel";

beforeEach(() => {
  BooksDB.truncate();
});

test("Can retrieve all models", (): void => {
  BookFactory.createMany(10);

  const books = BooksDB.all();

  expect(books.length).toBe(10);
});

test("Can truncate the database", (): void => {
  BookFactory.createMany(10);
  BooksDB.truncate();

  expect(BooksDB.count()).toBe(0);
});

test("Can retrieve the first model from the Database", (): void => {
  // insert a dummy first
  BooksDB.insert({
    title: "TEST",
    pages: 1,
    read: true,
  });

  BookFactory.asRead().createMany(5);

  const firstBook = BooksDB.first(false);

  expect(firstBook?.title).toBe("TEST");
});

test("Can retrieve the first model from a query scope", (): void => {
  // insert a dummy first
  BooksDB.insert({
    title: "TEST",
    pages: 1,
    read: true,
  });

  BookFactory.asRead().createMany(5);

  const firstFilteredBook = BooksDB.where("read", true).first();

  expect(firstFilteredBook?.title).toBe("TEST");
});

test("Can retrieve the last model from the Database", (): void => {
  BookFactory.asRead().createMany(5);

  // insert a dummy at the end
  BooksDB.insert({
    title: "TEST",
    pages: 1,
    read: true,
  });

  const lastBook = BooksDB.last(false);

  expect(lastBook?.title).toBe("TEST");
});

test("Can retrieve the last model from a query scope", (): void => {
  BookFactory.asRead().createMany(5);

  // insert a dummy at the end
  BooksDB.insert({
    title: "TEST",
    pages: 1,
    read: true,
  });
  const lastFilteredBook = BooksDB.where("read", true).last();

  expect(lastFilteredBook?.title).toBe("TEST");
});

test("first() can return undefined from query scope and the database", (): void => {
  const book = BooksDB.first();
  const bookScoped = BooksDB.where("pages", 283745683792).first();

  expect(book).toBeUndefined();
  expect(bookScoped).toBeUndefined();
});

test("last() can return undefined from query scope and the database", (): void => {
  const book = BooksDB.last();
  const bookScoped = BooksDB.where("pages", 1).last();

  expect(book).toBeUndefined();
  expect(bookScoped).toBeUndefined();
});

test("Insertion can return created model", (): void => {
  const newModel = BooksDB.insert(
    {
      pages: 1,
      read: true,
      title: "test",
    },
    true
  );

  expect(newModel?.title).toBe("test");
});

test("Can execute getter on query scope", (): void => {
  BookFactory.asRead().createMany(10);

  const books = BooksDB.where("read", true).get();

  expect(books.length).toBe(10);
});

test("Can delete queried models", (): void => {
  BookFactory.asRead().createMany(5);
  BookFactory.asUnread().createMany(5);

  // After deleting 5 books marked as Read, created by the factory, there should be only 5
  // books left
  BooksDB.where("read", false).delete();

  expect(BooksDB.count()).toBe(5);
});

test("Can still execute Delete on empty query scope", (): void => {
  BookFactory.asRead().createMany(5);

  const affectedRows = BooksDB.where("read", false).delete();

  expect(affectedRows).toBe(0);
});

test("Can update models from query scope", (): void => {
  BookFactory.asRead().create();

  const book = BooksDB.where("read", true).update("read", false).first();

  expect(book).toBeDefined();
  expect(book?.read).toBe(false);
});
