import { faker } from "@faker-js/faker";
import { Factory } from "../Base/Factory";
import { IUser, UserModel, UsersDB } from "../Models/User";

class FactoryOfUsers extends Factory<IUser, UserModel> {
  public constructor() {
    super(
      (): IUser => ({
        password: faker.internet.password(),
        username: faker.internet.userName(),
        banned: false,
      }),
      UsersDB
    );
  }

  /**
   * Create this user as Banned
   */
  public banned(): this {
    this.state({ banned: true });

    return this;
  }

  /**
   * Create this user as Unbanned
   */
  public unbanned(): this {
    this.state({ banned: false });

    return this;
  }

  /**
   * Create this user without a name
   */
  public unnamed(): this {
    this.state({ username: "" });

    return this;
  }
}

export const UsersFactory = new FactoryOfUsers();
