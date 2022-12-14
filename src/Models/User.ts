import { Database } from "../Base/Database";
import { Model } from "../Base/Model";

interface IUser {
  banned: boolean;
  password: string;
  username: string;
}

export class UserModel extends Model<IUser> implements IUser {
  public declare banned: boolean;
  public declare password: string;
  public declare username: string;

  public constructor(definition: IUser) {
    super(definition);
  }
}

export const UsersDB = new Database<IUser, UserModel>(UserModel);
