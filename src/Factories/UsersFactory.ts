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

  public banned(): this {
    this.state({ banned: false });

    return this;
  }

  public unnamed(): this {
    this.state({ username: "" });

    return this;
  }
}

export const UsersFactory = new FactoryOfUsers();
