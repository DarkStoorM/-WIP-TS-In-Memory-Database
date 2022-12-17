import { Database } from "./Database";
import { TIndexedModel } from "../types/TIndexedModel";

/**
 * @template TInterfacedModel Interface implemented by custom Models
 */
export abstract class Model<TInterfacedModel> {
  public readonly id: number;

  /**
   * @param   {TInterfacedModel}  definition  Model definition to create properties from
   * @param   {Database}          connection  Already existing database of the target models
   */
  public constructor(
    private readonly definition: TInterfacedModel & TIndexedModel,
    private readonly connection: Database<TInterfacedModel, TInterfacedModel>
  ) {
    // At this point we require the id, which is not the case when creating models
    this.id = definition.id as number;

    // Drop the id requirement
    for (const key in definition as TInterfacedModel) {
      // Don't override the id, as this field is forced by default as readonly
      if (key === "id") continue;

      // Dynamically create all getters/setters according to the given model definition
      Object.defineProperty(this, key, {
        get: () => definition[key],
        set: (value) => (definition[key] = value),
        enumerable: true,
      });
    }
  }

  public save = (): void => {
    const query = this.connection.whereIndexed(this.id);

    let key: keyof typeof this.definition;
    for (key in this.definition) {
      // Keys are readonly
      if (key === "id") continue;

      query.update(key, this.definition[key]);
    }
  };
}
