import { CreateElement, CreateChildren, HydrateComponent } from '../types.js';

type ImportComponent = (name: string) => Promise<Function | undefined>;
declare const buildCreateChildrenFn: (createElement: CreateElement, importComponent: ImportComponent) => CreateChildren;
declare const hydrateComponentHonoSuspense: (hydrateComponent: HydrateComponent) => Promise<void>;

export { buildCreateChildrenFn, hydrateComponentHonoSuspense };
