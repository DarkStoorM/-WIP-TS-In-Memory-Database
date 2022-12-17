import { Database } from "../Base/Database";
import { Model } from "../Base/Model";

export interface IUser {
  banned: boolean;
  password: string;
  username: string;
}

export class UserModel extends Model<IUser> implements IUser {
  public declare banned: boolean;
  public declare password: string;
  public declare username: string;

  public constructor(definition: IUser) {
    super(definition, UsersDB);
  }

  /**
   * Bans this user and updates his status in the database
   */
  public ban = (): this => this.changeBannedState(true);

  /**
   * Unbans this user and updates his status in the database
   */
  public unban = (): this => this.changeBannedState(false);

  private changeBannedState = (state: boolean): this => {
    this.banned = state;
    this.save();

    return this;
  };
}

export const UsersDB = new Database<IUser, UserModel>(UserModel);
