import { BookModel, BooksDB, IBook } from "./BookModel";
import { Factory } from "../../src/Base/Factory";
import { faker } from "@faker-js/faker";

class BooksFactory extends Factory<IBook, BookModel> {
  public constructor() {
    super(
      (): IBook => ({
        title: `${faker.word.adjective()} ${faker.word.verb()}`,
        pages: parseInt(faker.random.numeric(), 10),
        read: Math.random() < 0.5,
      }),
      BooksDB
    );
  }

  public asRead(): this {
    this.state({ read: true });

    return this;
  }

  public asUnread(): this {
    this.state({ read: false });

    return this;
  }
}

export const BookFactory = new BooksFactory();
