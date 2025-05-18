import { Hydrate, CreateElement, CreateChildren, TriggerHydration } from '../types.js';

type ClientOptions = {
    hydrate?: Hydrate;
    createElement?: CreateElement;
    /**
     * Create "children" attribute of a component from a list of child nodes
     */
    createChildren?: CreateChildren;
    /**
     * Trigger hydration on your own
     */
    triggerHydration?: TriggerHydration;
    ISLAND_FILES?: Record<string, () => Promise<unknown>>;
    /**
     * @deprecated
     */
    island_root?: string;
};
declare const createClient: (options?: ClientOptions) => Promise<void>;

export { type ClientOptions, createClient };
