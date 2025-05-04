import { Env, Hono, MiddlewareHandler, NotFoundHandler, ErrorHandler } from 'hono';
import { H } from 'hono/types';
import { IMPORTING_ISLANDS_ID } from '../constants.js';

declare const METHODS: readonly ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"];
type HasIslandFile = {
    [key in typeof IMPORTING_ISLANDS_ID]?: boolean;
};
type InnerMeta = {} & HasIslandFile;
type AppFile = {
    default: Hono;
} & InnerMeta;
type RouteFile = {
    default?: Function;
} & {
    [M in (typeof METHODS)[number]]?: H[];
} & InnerMeta;
type RendererFile = {
    default: MiddlewareHandler;
} & InnerMeta;
type NotFoundFile = {
    default: NotFoundHandler;
} & InnerMeta;
type ErrorFile = {
    default: ErrorHandler;
} & InnerMeta;
type MiddlewareFile = {
    default: MiddlewareHandler[];
};
type InitFunction<E extends Env = Env> = (app: Hono<E>) => void;
type BaseServerOptions<E extends Env = Env> = {
    ROUTES: Record<string, RouteFile | AppFile>;
    RENDERER: Record<string, RendererFile>;
    NOT_FOUND: Record<string, NotFoundFile>;
    ERROR: Record<string, ErrorFile>;
    MIDDLEWARE: Record<string, MiddlewareFile>;
    root: string;
    app?: Hono<E>;
    init?: InitFunction<E>;
    /**
     * Appends a trailing slash to URL if the route file is an index file, e.g., `index.tsx` or `index.mdx`.
     * @default false
     */
    trailingSlash?: boolean;
};
type ServerOptions<E extends Env = Env> = Partial<BaseServerOptions<E>>;
declare const createApp: <E extends Env>(options: BaseServerOptions<E>) => Hono<E>;

export { type ServerOptions, createApp };
