import { Manifest } from 'vite';

type Options = {
    src: string;
    async?: boolean;
    prod?: boolean;
    manifest?: Manifest;
    nonce?: string;
};
declare const Script: (options: Options) => any;

export { Script };
