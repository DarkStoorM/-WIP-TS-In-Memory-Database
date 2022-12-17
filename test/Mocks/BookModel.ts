import { Model } from "../../src/Base/Model";
import { Database } from "../../src/Base/Database";

export interface IBook {
  title: string;
  pages: number;
  read: boolean;
}

export class BookModel extends Model<IBook> implements IBook {
  public declare title: string;
  public declare pages: number;
  public declare read: boolean;

  public constructor(definition: IBook) {
    super(definition);
  }
}

export const BooksDB = new Database<IBook, BookModel>(BookModel);
