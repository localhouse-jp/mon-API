import { Plugin } from 'vite';

type InjectImportingIslandsOptions = {
    appDir?: string;
    islandDir?: string;
};
declare function injectImportingIslands(options?: InjectImportingIslandsOptions): Promise<Plugin>;

export { injectImportingIslands };
