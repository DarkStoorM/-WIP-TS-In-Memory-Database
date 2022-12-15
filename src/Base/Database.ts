import { TDBConstructor } from "../types/TDBConstructor";
import { TIndexedModel } from "../types/TIndexedModel";

export class Database<TInterfacedModel, TModel extends TInterfacedModel & TIndexedModel> {
  /**
   * Current database index.
   */
  private autoincrement = 0;
  private records: Map<number, TInterfacedModel> = new Map();

  /**
   * Represents the results of the last used Where Clause.
   *
   * NOTICE: this will only be cleared when called with Get/Delete
   */
  public lastQuery: Map<number, TInterfacedModel> = new Map();

  /**
   * @param   {TDBConstructor<TInterfacedModel>}  modelDefinition   Custom Model class used as a template for model definition instantiation
   */
  public constructor(private modelDefinition: TDBConstructor<TInterfacedModel, TModel>) {
    //
  }

  public static update() {
    throw new Error(`Method not implemented`);
  }

  /**
   * Returns all models from this database
   */
  public all = (): TModel[] => {
    const models: TModel[] = [];

    // Instantiate all models from this database
    this.records.forEach((record: TInterfacedModel): void => {
      models.push(new this.modelDefinition(record));
    });

    return models;
  };

  /**
   * Returns the current size of this database
   */
  public count = (): number => this.records.size;

  /**
   * Returns the first model from this database
   */
  public first = (): TModel | undefined => {
    const firstModel = this.records.entries().next();

    // Database can be empty, so we can just return undefined
    if (!firstModel.value) {
      return;
    }

    // Instantiate when available
    return new this.modelDefinition(firstModel.value[1]);
  };

  /**
   * Executes the selected models instantiation and returns them as an array of those models (or empty)
   */
  public get = (): TModel[] => {
    const models: TModel[] = [];

    // Instantiate only the selected models
    this.lastQuery.forEach((record: TInterfacedModel): void => {
      models.push(new this.modelDefinition(record));
    });

    // Prepare the query for new results
    this.lastQuery.clear();

    return models;
  };

  /**
   * Inserts the given model definition into the database and returns a new instance of this model based on the
   * given definition when prompted
   *
   * @param   {TInterfacedModel}  definition  Model definition later used to instantiate the new model with
   */
  public insert = (definition: TInterfacedModel, returnNew = false): TModel | void => {
    const template = { id: this.autoincrement };

    // Insert this definition under the next database index
    this.records.set(++this.autoincrement, definition);

    return returnNew ? new this.modelDefinition(Object.assign(template, definition)) : void 0;
  };

  /**
   * Returns the last model from this database)
   */
  public last = (): TModel | undefined => {
    const lastModel = this.records.get(this.autoincrement);

    // Database can be empty, so we can just return undefined
    if (!lastModel) {
      return;
    }

    return new this.modelDefinition(lastModel);
  };

  public update = (): void => {
    throw new Error(`Method not implemented`);
  };

  /**
   * Filters the currently held records by provided filter: column -> value and stores them in the recently used
   * query, appending the results - overridden by shared filtering clauses.
   *
   * The results can be retrieved with `.get()` as a final call.
   *
   * @param   {keyof T} whereColumn   Which column to access from the records
   * @param   {T[Key]}  value         Value to filter the records with from the provided column
   */
  /* The union in the `whereColumn` argument is required to extend the `Key`'s list of properties */
  public where = <Key extends keyof TInterfacedModel | keyof TIndexedModel>(
    /* The type intersection is required to expose the optional `id` property */
    whereColumn: keyof Pick<TInterfacedModel & TIndexedModel, Key>,
    /* The Required<> type intersection is required to satisfy the `Key`'s constraints and to force the actual type
       for that argument, since the intersected property is optional */
    value: (TInterfacedModel & Required<TIndexedModel>)[Key]
  ): this => {
    const iterator = this.records.entries();
    let result = iterator.next();

    // Filter all records and select only those matching the criteria
    while (!result.done) {
      // Store the matching record with the corresponding internal index
      if (result.value[1][whereColumn as keyof TInterfacedModel] === value) {
        this.lastQuery.set(result.value[0], result.value[1]);
      }

      result = iterator.next();
    }

    return this;
  };
}
