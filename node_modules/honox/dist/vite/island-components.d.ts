import { Plugin } from 'vite';

declare const transformJsxTags: (contents: string, componentName: string) => any;
type IsIsland = (id: string) => boolean;
type IslandComponentsOptions = {
    /**
     * @deprecated
     */
    isIsland?: IsIsland;
    islandDir?: string;
    reactApiImportSource?: string;
};
declare function islandComponents(options?: IslandComponentsOptions): Plugin;

export { type IslandComponentsOptions, islandComponents, transformJsxTags };
