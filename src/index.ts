import { UsersFactory } from "./Factories/UsersFactory";
import { UsersDB } from "./Models/User";

/*
 * --------------------------------------------------------------------------
 * Example User Model manipulation
 * --------------------------------------------------------------------------
 *
 * Create an example user with manually passed data, e.g. coming from some form
 *
 */
const user = UsersDB.insert({
  banned: false,
  username: "Test username",
  password: "8923n_NV093J.",
});

// User Model-scope methods to manipulate this model
// Ban the user. This method already implements an internal save() inside the model
user.ban();

console.log(`${user.username}: ${user.banned ? "banned" : "unbanned"}`);

// Sanity check: unban

user.unban();

console.log(`${user.username}: ${user.banned ? "banned" : "unbanned"}`);

/*
 * --------------------------------------------------------------------------
 * Creation by Factory
 * --------------------------------------------------------------------------
 *
 * Model Factories allow creating multiple instances of the given model
 *
 */

// Create 10 banned users as a test
UsersFactory.banned().createMany(10);

// 10
console.log(UsersDB.count(false));
