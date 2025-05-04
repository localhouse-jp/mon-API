import { Hono } from "hono";
import { createFactory } from "hono/factory";
const factory = createFactory();
const createRoute = factory.createHandlers;
const createHono = () => {
  return new Hono();
};
export {
  createHono,
  createRoute
};
