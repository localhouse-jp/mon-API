import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { IMPORTING_ISLANDS_ID } from "../../constants.js";
import { contextStorage } from "../context-storage.js";
const HasIslands = ({ children }) => {
  const c = contextStorage.getStore();
  if (!c) {
    throw new Error("No context found");
  }
  return /* @__PURE__ */ jsx(Fragment, { children: c.get(IMPORTING_ISLANDS_ID) && children });
};
export {
  HasIslands
};
