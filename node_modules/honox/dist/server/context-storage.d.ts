import { Context } from 'hono';
import { AsyncLocalStorage } from 'node:async_hooks';

declare const contextStorage: AsyncLocalStorage<Context<any, any, {}>>;

export { contextStorage };
