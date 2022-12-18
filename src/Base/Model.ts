import { Database } from "./Database";
import { TIndexedModel } from "../types/TIndexedModel";

/**
 * @template TInterfacedModel Interface implemented by custom Models
 */
export abstract class Model<TInterfacedModel> {
  public readonly id: (TInterfacedModel & Required<TIndexedModel>)["id"];

  /**
   * @param   {TInterfacedModel}  definition  Model definition to create properties from
   * @param   {Database}          connection  Already existing database of the target models
   */
  public constructor(
    private readonly definition: TInterfacedModel & TIndexedModel,
    private readonly connection: Database<TInterfacedModel, TInterfacedModel>
  ) {
    // At this point we require the id, which is not the case when creating models
    // The cast is required to match the ids between the types
    this.id = definition.id as (TInterfacedModel & Required<TIndexedModel>)["id"];

    // Drop the id requirement
    for (const key in definition as TInterfacedModel) {
      // Don't override the id, as this field is forced by default as readonly
      if (key === "id") continue;

      // Dynamically create all getters/setters according to the given model definition
      Object.defineProperty(this, key, {
        get: () => definition[key],
        set: (value) => (definition[key] = value),
        enumerable: true,
        configurable: true,
      });
    }
  }

  /**
   * Deletes this model from the database and flushes this object
   */
  public delete = (): void => {
    this.connection.where("id", this.id).delete();

    Object.setPrototypeOf(this, null);
    Object.keys(this).forEach((key) => delete this[key as keyof this]);
  };

  /**
   * Updates the corresponding model definition with this model's properties
   *
   * @throws Error when corresponding model was deleted
   */
  public save = (): void => {
    if (!this.connection.find(this.id)) {
      throw new Error(`The model with id:${this.id} did not exist in the database.`);
    }

    const query = this.connection.where("id", this.id);

    let key: keyof typeof this.definition;
    for (key in this.definition) {
      // Keys are readonly
      if (key === "id") continue;

      query.update(key, this.definition[key]);
    }
  };
}
