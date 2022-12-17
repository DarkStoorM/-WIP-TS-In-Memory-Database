/**
 * Alias describing a generic class constructor
 */
export type TDBConstructor<TInterface, TModel extends TInterface> = new (
  definition: TInterface
) => TModel;
