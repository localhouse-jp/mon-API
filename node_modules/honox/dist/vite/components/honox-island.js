import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createElement } from "hono/jsx";
import { createContext, useContext, isValidElement } from "hono/jsx";
import {
  COMPONENT_NAME,
  COMPONENT_EXPORT,
  DATA_SERIALIZED_PROPS,
  DATA_HONO_TEMPLATE
} from "../../constants";
const inIsland = Symbol();
const inChildren = Symbol();
const IslandContext = createContext({
  [inIsland]: false,
  [inChildren]: false
});
const isElementPropValue = (value) => Array.isArray(value) ? value.some(isElementPropValue) : typeof value === "object" && isValidElement(value);
const HonoXIsland = ({
  componentName,
  componentExport,
  Component,
  props
}) => {
  const elementProps = {};
  const restProps = {};
  for (const key in props) {
    const value = props[key];
    if (isElementPropValue(value)) {
      elementProps[key] = value;
    } else {
      restProps[key] = value;
    }
  }
  const islandState = useContext(IslandContext);
  return islandState[inChildren] || !islandState[inIsland] ? (
    // top-level or slot content
    /* @__PURE__ */ jsxs(
      "honox-island",
      {
        ...{
          [COMPONENT_NAME]: componentName,
          [COMPONENT_EXPORT]: componentExport || void 0,
          [DATA_SERIALIZED_PROPS]: JSON.stringify(restProps)
        },
        children: [
          /* @__PURE__ */ jsx(IslandContext.Provider, { value: { ...islandState, [inIsland]: true }, children: /* @__PURE__ */ jsx(Component, { ...props }) }),
          Object.entries(elementProps).map(([key, children]) => /* @__PURE__ */ createElement("template", { ...{ [DATA_HONO_TEMPLATE]: key }, key }, /* @__PURE__ */ jsx(IslandContext.Provider, { value: { ...islandState, [inChildren]: true }, children })))
        ]
      }
    )
  ) : (
    // nested component
    /* @__PURE__ */ jsx(Component, { ...props })
  );
};
export {
  HonoXIsland
};
