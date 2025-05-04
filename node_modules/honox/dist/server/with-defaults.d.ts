import * as hono from 'hono';
import { Env } from 'hono';
import * as hono_types from 'hono/types';
import { ServerOptions } from './server.js';
import '../constants.js';

declare const createApp: <E extends Env>(options?: ServerOptions<E>) => hono.Hono<E, hono_types.BlankSchema, "/">;

export { createApp };
