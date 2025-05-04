import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { ensureTrailngSlash } from "../utils/path.js";
import { HasIslands } from "./has-islands.js";
const Script = (options) => {
  const src = options.src;
  if (options.prod ?? import.meta.env.PROD) {
    let manifest = options.manifest;
    if (!manifest) {
      const MANIFEST = import.meta.glob("/dist/.vite/manifest.json", {
        eager: true
      });
      for (const [, manifestFile] of Object.entries(MANIFEST)) {
        if (manifestFile["default"]) {
          manifest = manifestFile["default"];
          break;
        }
      }
    }
    if (manifest) {
      const scriptInManifest = manifest[src.replace(/^\//, "")];
      if (scriptInManifest) {
        return /* @__PURE__ */ jsx(HasIslands, { children: /* @__PURE__ */ jsx(
          "script",
          {
            type: "module",
            async: !!options.async,
            src: `${ensureTrailngSlash(import.meta.env.BASE_URL)}${scriptInManifest.file}`,
            nonce: options.nonce
          }
        ) });
      }
    }
    return /* @__PURE__ */ jsx(Fragment, {});
  } else {
    return /* @__PURE__ */ jsx("script", { type: "module", async: !!options.async, src, nonce: options.nonce });
  }
};
export {
  Script
};
