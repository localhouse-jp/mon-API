import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { ensureTrailngSlash } from "../utils/path.js";
const Link = (options) => {
  let { href, prod, manifest, ...rest } = options;
  if (href) {
    if (prod ?? import.meta.env.PROD) {
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
        const assetInManifest = manifest[href.replace(/^\//, "")];
        if (assetInManifest) {
          if (href.startsWith("/")) {
            return /* @__PURE__ */ jsx(
              "link",
              {
                href: `${ensureTrailngSlash(import.meta.env.BASE_URL)}${assetInManifest.file}`,
                ...rest
              }
            );
          }
          return /* @__PURE__ */ jsx("link", { href: assetInManifest.file, ...rest });
        }
      }
      return /* @__PURE__ */ jsx(Fragment, {});
    } else {
      return /* @__PURE__ */ jsx("link", { href, ...rest });
    }
  }
  return /* @__PURE__ */ jsx("link", { ...rest });
};
export {
  Link
};
