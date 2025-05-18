import { FC } from 'hono/jsx';
import { JSX } from 'hono/jsx/jsx-runtime';
import { Manifest } from 'vite';

type Options = {
    manifest?: Manifest;
    prod?: boolean;
} & JSX.IntrinsicElements['link'];
declare const Link: FC<Options>;

export { Link };
