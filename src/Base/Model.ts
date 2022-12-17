import { TIndexedModel } from "../types/TIndexedModel";

/**
 * @template TInterfacedModel Interface implemented by custom Models
 */
export abstract class Model<TInterfacedModel> {
  public readonly id?: number;

  /**
   * @param   {TInterfacedModel}  definition  Model definition to create properties from
   */
  public constructor(definition: TInterfacedModel & TIndexedModel) {
    this.id = definition.id;

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
}
