# In-Memory Database with TypeScript

A quickly mashed practice project with TypeScript of an In-Memory database. **This is not a real database driver. Written without any research.**

The goal was to create a generic database, that can store model templates and instantiate them as new Models when retrieved.

Table of Contents:

- [In-Memory Database with TypeScript](#in-memory-database-with-typescript)
  - [Database Structure](#database-structure)
    - [`First()`, `Last()`](#first-last)
      - [Notice on count()](#notice-on-count)
  - [Model Updates](#model-updates)
    - [Updating from the Model context](#updating-from-the-model-context)
    - [Updating from the Database context](#updating-from-the-database-context)
  - [Creating Models](#creating-models)
  - [Creating Factories](#creating-factories)
    - [Factory states](#factory-states)
  - [Deleting Models](#deleting-models)
  - [Conclusion](#conclusion)

---

## Database Structure

```ts
// Accepts a Model Class as a template for every new model
public constructor(private modelDefinition: TDBConstructor<T, U>) {}
// Instantiates all models
public all = () => U[]
// Returns the current model count
public count = () => number
// Deletes all selected models
public delete = () => number
// Looks up the Model by ID in the Database
public find = (index: number) => U | undefined
// Returns the first model either from Database or the Selected Models (Where Clause)
public first = (retrieveFromLastQuery = true) => U | undefined
// Returns selected models from the query
public get = () => U[]
// Inserts the model definition into the Database
public insert = (definition: T) => U
// Returns the last model either from Database or the Selected Models (Where Clause)
public last = (retrieveFromLastQuery = true) => U | undefined
// Removes everything
public truncate = () => void
// Executes an update on the selected Models (chainable) (1)
public update = <K extends keyof T>(
    where: keyof Pick<T, K>,
    value: T[K]
  ) => this
// Selects the database record based on the given key (column), filtered by Value (2)
public where = <K extends keyof T | keyof U>(
    whereColumn: keyof Pick<T & U, K>,
    value: (T & Required<U>)[K]
  ) => this
// Selects the database record with the matching index (3)
private whereIndexed = (index: number) => this
```

Custom generic type names were shortened only for this README, I don't like single-character generics in general, so I always give them full names. Refer to the [Database class](https://github.com/DarkStoorM/-WIP-TS-In-Memory-Database/blob/main/src/Base/Database.ts).

`(1)` - The `update` method uses type inference of the second argument based on what's in the first argument, providing *some* type safety. Unlike `where`, this excludes the `id` property as it's readonly and should not be changed/visible during the updates.

`(2)` - The `where` method uses the same type inference as explained above, except this includes the `id`, which is only required for the lookups. When `id` is specified during the `where` search, the Database will switch to another method explained below. The type inference is explained in [this gist](https://gist.github.com/DarkStoorM/2293b2f764d699355425d086f2f1f07e).

`(3)` - The `whereIndexed` method is used by `where` clause, but only when user searches by `id`. The reason for this is that the models don't store their IDs, they are used as a key in the `Map`, which are later added to the instantiated models to associate them for `update`/`delete` purposes.

### `First()`, `Last()`

The `first()` and `last()` methods accept an optional argument, which is `true` by default. This argument determines whether the Database returns the first/last model from scoped query or the Database itself. Since there are no `Collections` implemented or separate classes with those methods, this switch was faster to implement. A bit confusing, but still works.

Examples:

Create 5 unbanned users, then 5 banned users. Selecting `first()` in scoped context will return a user that was filtered by `banned` column, with `true` value.

Selecting `first(false)` returns the first record from the Database, in this case, an unbanned user.

```ts
UsersFactory.unbanned().createMany(5);
UsersFactory.banned().createMany(5);

const firstBanned = UsersDB.where("banned", true).first();
const firstDB = UsersDB.first(false);

// true
// false
console.log(firstBanned?.banned, firstDB?.banned);
```

#### Notice on count()

Since this database does not implement separate Query Builders, the `count` had to be implemented with a `boolean` switch to check the size of either the Database or the scoped query.

```ts
// This will access the Database size
UsersDB.count(false);
// This will not work, because, by default, the counter returns the size of a
// query scope, which at the moment is empty
UsersDB.count();

// This will access the query scope size
UsersDB.where("banned", true).count();
```

- `count(false)` - The provided argument will switch the context
- `count()` - Missing argument will default to the query scope

However, the arg-less `count()` can still work when executed in the following way:

```ts
const query UsersDB.where("banned", true);

UsersDB.count();
```

Although, we did not provide any arguments, the `count()` will still return the size of the scoped query even when called on `UsersDB`, because there are no separate collections to access the query scope or the Database.

The Query Scope stores selected models filtered by `where` clause and both `Maps` (scoped and Database) are typed with the same signature. To make the `count()` work properly, a Query Builder would need to be implemented, which has been omitted in this project.

---

## Model Updates

There are two ways of updating models:

- model context
- database context

### Updating from the Model context

To update the model from its context, a `save()` method can be called on the retrieved model after editing its properties:

```ts
const user = UsersFactory.create();

user.username = "TestUserName";
user.save();

console.log(user.username);
```

### Updating from the Database context

To update models from the Database context, user can query the models, then execute an `update()`

```ts
// Create 5 banned users, mass unban them later
UsersFactory.banned().createMany(5);

const query = UsersDB.where("banned", true).update("banned", false);

const users = query.get();

users.forEach((user) => {
  console.log(user.banned);
});
```

---

## Creating Models

Models are created with the following code:

```ts
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
}

export const UsersDB = new Database<IUser, UserModel>(UserModel);
```

`Interface` here is used to expose the model keys on instantiated models by providing the key structure to the Database.

Generic Model has to inherit from the base `Model` typed with the created interface.

Models have to pass an object of interfaced type to the inherited base Model along with the created Database object. The Database object reference will be used as a database connection inside that model, which allows executing updates.

Exported Database instance has to be typed with `interface`, then `model class`, as explained in the `Database`'s JSDoc. Each database accepts a constructor parameter of the created Model class, which is later used as a template for each instantiated model.

## Creating Factories

This project includes `FakerJS` for generating fake data for models.

Custom model factories can be created with the following code (assuming the above User Interface):

```ts
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
}

export const UsersFactory = new FactoryOfUsers();
```

Ignoring the naming, new factories are created by inheriting from the base `Factory`, typed with the created `interface` and a `model`.

The base factory accepts a model definition, which is a return value of a callback. In this definition we can specify the `columns` with fake data, or just static values. The parent also requires an existing Database to be passed as the second argument to allow inserting the created models into the database.

### Factory states

Model Factories also allow defining factory states, which will override the model definition before inserting it into the database:

```ts
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
    this.state({ banned: true });

    return this;
  }

  public unbanned(): this {
    this.state({ banned: false });

    return this;
  }
}

export const UsersFactory = new FactoryOfUsers();
```

Similar to what you can see in Laravel, you can override some properties before the model is inserted:

```ts
UsersFactory.banned().createMany(5);
```

With this, the `UsersFactory` can instead create 5 models, that have their `banned` property overridden with `true`. Useful for creating data for testing.

## Deleting Models

Deleting models can also be executed from different context, which works as same as Updating: model and database context:

```ts
let user: UserModel;

user = UsersFactory.create();
user.delete();

// undefined
console.log(user.username);

// ------------------------------------

UsersFactory.banned().createMany(5);

UsersDB.where("banned", true).delete();

// 0
console.log(UsersDB.count(false));
```

First method performs a delete on the instantiated model, which will completely flush the object along with deleting the associated model definition in the database.

The second method will delete all selected model definitions.

---

## Conclusion

There was not much thought put into this, the Database does not implement a proper Builder pattern and listeners, methods don't really represent the behavior from regular database drivers, but it was a fun project to play around with.

Also, unfortunately, Accessors and Mutators will not work.

Sorting was not implemented, because ¯\\\_(ツ)\_/¯.
