import { TDBConstructor } from "../types/TDBConstructor";

export class Database<TInterfacedModel, TModel extends TInterfacedModel & { id?: number }> {
  /**
   * Current database index.
   */
  private autoincrement = 0;
  private records: Map<number, TInterfacedModel> = new Map();

  /**
   * @param   {TDBConstructor<TInterfacedModel>}  modelDefinition   Custom Model class used as a template for model definition instantiation
   */
  public constructor(private modelDefinition: TDBConstructor<TInterfacedModel, TModel>) {
    //
  }

  public static delete(): void {
    throw new Error(`Method not implemented`);
  }

  public static update() {
    throw new Error(`Method not implemented`);
  }

  /**
   * Returns all models from this database
   */
  public all = (): TModel[] => {
    const models: TModel[] = [];

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
  public first = (): TModel => new this.modelDefinition([...this.records.values()][0]);

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
  public last = (): TModel =>
    new this.modelDefinition([...this.records.values()][this.autoincrement - 1]);

  public update = (): void => {
    throw new Error(`Method not implemented`);
  };

  public where = (): TModel[] => {
    throw new Error(`Method not implemented`);
  };
}
