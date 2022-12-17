import { Database } from "./Database";
import { TIndexedModel } from "../types/TIndexedModel";

export abstract class Factory<TInterfacedModel, TModel extends TInterfacedModel & TIndexedModel> {
  private factoryStateOverrides: Partial<TInterfacedModel> = {};

  public constructor(
    private readonly modelDefinition: () => TInterfacedModel,
    private readonly databaseConnection: Database<TInterfacedModel, TModel>
  ) {
    //
  }

  /**
   * Generates, inserts a new fake model definition and returns instantiated model based on that
   * definition
   *
   * @param   {boolean}   revertFactoryState  When set to true, will clear the factory states after generation
   */
  public create(revertFactoryState = true): TModel | void {
    return this.databaseConnection.insert(this.getModelFactoryDefinition(revertFactoryState));
  }

  /**
   * Generates, inserts series of new fake model definitions and returns an array of instantiated
   * models based on those definitions
   *
   * @param   {number}  amount  Amount of model definitions to create
   */
  public createMany(amount: number): (TModel | void)[] {
    const definitions = Array.from(Array(amount), (): TModel | void => this.create(false));

    this.revertFactoryState(true);

    return definitions;
  }

  /**
   * Generates and returns a new fake model definition without insertion
   *
   * @param   {boolean}   revertFactoryState  When set to true, will clear the factory states after generation
   */
  public make(revertFactoryState = true): TInterfacedModel {
    return this.getModelFactoryDefinition(revertFactoryState);
  }

  /**
   * Generates and returns an array of fake model definitions without insertion
   *
   * @param   {number}          amount  Amount of model definitions to generate
   */
  public makeMany(amount: number): TInterfacedModel[] {
    const definitions = Array.from(Array(amount), (): TInterfacedModel => this.make(false));

    this.revertFactoryState(true);

    return definitions;
  }

  /**
   * Overrides the factory state object that will be applied upon generation
   *
   * @param   {Pick<ModelInterface, Key>}    overriddenState   State to apply to the current overrides
   */
  protected state<Key extends keyof TInterfacedModel>(
    overriddenState: Pick<TInterfacedModel, Key>
  ): void {
    Object.assign(this.factoryStateOverrides, overriddenState);
  }

  /**
   * Returns the model factory definition after applying the factory state overrides
   *
   * @param   {boolean}   revertFactoryState  When set to true, will clear the factory states after generation
   */
  private getModelFactoryDefinition(revertFactoryState = true): TInterfacedModel {
    const definition = { ...this.modelDefinition(), ...this.factoryStateOverrides };

    this.revertFactoryState(revertFactoryState);

    return definition;
  }

  /**
   * Clears the current factory state overrides object.
   *
   * NOTICE: immediate revert should be applied for singular generation (omitted)
   *
   * @param   {boolean}  state  When true, will clear the current overrides
   */
  private revertFactoryState(state = true): void {
    if (state) {
      this.factoryStateOverrides = {};
    }
  }
}
