import { Suspense, use } from "hono/jsx/dom";
import { COMPONENT_NAME, DATA_HONO_TEMPLATE, DATA_SERIALIZED_PROPS } from "../constants.js";
const buildCreateChildrenFn = (createElement, importComponent) => {
  let keyIndex = 0;
  const setChildrenFromTemplate = async (props, element) => {
    const maybeTemplate = element.childNodes[element.childNodes.length - 1];
    if (maybeTemplate?.nodeName === "TEMPLATE" && maybeTemplate?.getAttribute(DATA_HONO_TEMPLATE) !== null) {
      props.children = await createChildren(
        maybeTemplate.content.childNodes
      );
    }
  };
  const createElementFromHTMLElement = async (element) => {
    const props = {
      children: await createChildren(element.childNodes)
    };
    const attributes = element.attributes;
    for (let i = 0; i < attributes.length; i++) {
      props[attributes[i].name] = attributes[i].value;
    }
    return createElement(element.nodeName, {
      key: ++keyIndex,
      ...props
    });
  };
  const createChildren = async (childNodes) => {
    const children = [];
    for (let i = 0; i < childNodes.length; i++) {
      const child = childNodes[i];
      if (child.nodeType === 8) {
        continue;
      } else if (child.nodeType === 3) {
        children.push(child.textContent);
      } else if (child.nodeName === "TEMPLATE" && child.id.match(/(?:H|E):\d+/)) {
        const placeholderElement = document.createElement("hono-placeholder");
        placeholderElement.style.display = "none";
        let resolve;
        const promise = new Promise((r) => resolve = r);
        child.replaceWith = (node) => {
          createChildren(node.childNodes).then(resolve);
          placeholderElement.remove();
        };
        let fallback = [];
        for (
          // equivalent to i++
          placeholderElement.appendChild(child);
          i < childNodes.length;
          i++
        ) {
          const child2 = childNodes[i];
          if (child2.nodeType === 8) {
            placeholderElement.appendChild(child2);
            i--;
            break;
          } else if (child2.nodeType === 3) {
            fallback.push(child2.textContent);
          } else {
            fallback.push(await createElementFromHTMLElement(child2));
          }
        }
        const fallbackTemplates = document.querySelectorAll(
          `[data-hono-target="${child.id}"]`
        );
        if (fallbackTemplates.length > 0) {
          const fallbackTemplate = fallbackTemplates[fallbackTemplates.length - 1];
          fallback = await createChildren(fallbackTemplate.content.childNodes);
        }
        if (fallback.length === 0 && child.id.startsWith("E:")) {
          let resolve2;
          const promise2 = new Promise((r) => resolve2 = r);
          fallback = await createElement(Suspense, {
            fallback: [],
            children: [await createElement(() => use(promise2), {})]
          });
          placeholderElement.insertBefore = (node) => {
            createChildren(node.childNodes).then(resolve2);
          };
        }
        document.body.appendChild(placeholderElement);
        children.push(
          await createElement(Suspense, {
            fallback,
            children: [await createElement(() => use(promise), {})]
          })
        );
      } else {
        let component = void 0;
        const componentName = child.getAttribute(COMPONENT_NAME);
        if (componentName) {
          component = await importComponent(componentName);
        }
        if (component) {
          const props = JSON.parse(child.getAttribute(DATA_SERIALIZED_PROPS) || "{}");
          await setChildrenFromTemplate(props, child);
          children.push(
            await createElement(component, {
              key: ++keyIndex,
              ...props
            })
          );
        } else {
          children.push(await createElementFromHTMLElement(child));
        }
      }
    }
    return children;
  };
  return createChildren;
};
const hydrateComponentHonoSuspense = async (hydrateComponent) => {
  const templates = /* @__PURE__ */ new Set();
  const observerTargets = /* @__PURE__ */ new Set();
  document.querySelectorAll('template[id^="H:"], template[id^="E:"]').forEach((template) => {
    if (template.parentElement) {
      templates.add(template);
      observerTargets.add(template.parentElement);
    }
  });
  if (observerTargets.size === 0) {
    return;
  }
  const observer = new MutationObserver((mutations) => {
    const targets = /* @__PURE__ */ new Set();
    mutations.forEach((mutation) => {
      if (mutation.target instanceof Element) {
        targets.add(mutation.target);
        mutation.removedNodes.forEach((node) => {
          templates.delete(node);
        });
      }
    });
    targets.forEach((target) => {
      hydrateComponent(target);
    });
    if (templates.size === 0) {
      observer.disconnect();
    }
  });
  observerTargets.forEach((target) => {
    observer.observe(target, { childList: true });
  });
};
export {
  buildCreateChildrenFn,
  hydrateComponentHonoSuspense
};
