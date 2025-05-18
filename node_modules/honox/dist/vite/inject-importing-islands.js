import _generate from "@babel/generator";
import { parse } from "@babel/parser";
import precinct from "precinct";
import { normalizePath } from "vite";
import { readFile } from "fs/promises";
import path from "path";
import { IMPORTING_ISLANDS_ID } from "../constants.js";
import { matchIslandComponentId } from "./utils/path.js";
const generate = _generate.default ?? _generate;
async function injectImportingIslands(options) {
  let appPath = "";
  const islandDir = options?.islandDir ?? "/app/islands";
  let root = "";
  let config;
  const resolvedCache = /* @__PURE__ */ new Map();
  const cache = {};
  const walkDependencyTree = async (baseFile, resolve, dependencyFile) => {
    const depPath = dependencyFile ? typeof dependencyFile === "string" ? path.join(path.dirname(baseFile), dependencyFile) + ".tsx" : dependencyFile["id"] : baseFile;
    const deps = [depPath];
    try {
      if (!cache[depPath]) {
        cache[depPath] = (await readFile(depPath, { flag: "" })).toString();
      }
      const currentFileDeps = precinct(cache[depPath], {
        type: "tsx"
      });
      const childDeps = await Promise.all(
        currentFileDeps.map(async (file) => {
          const resolvedId = await resolve(file, baseFile);
          return await walkDependencyTree(depPath, resolve, resolvedId ?? file);
        })
      );
      deps.push(...childDeps.flat());
      return deps;
    } catch {
      return deps;
    }
  };
  return {
    name: "inject-importing-islands",
    configResolved: async (resolveConfig) => {
      config = resolveConfig;
      appPath = path.join(config.root, options?.appDir ?? "/app");
      root = config.root;
    },
    async transform(sourceCode, id) {
      if (!path.resolve(id).startsWith(appPath)) {
        return;
      }
      const resolve = async (importee, importer) => {
        if (resolvedCache.has(importee)) {
          return this.resolve(importee);
        }
        const resolvedId = await this.resolve(importee, importer);
        resolvedCache.set(importee, true);
        return resolvedId;
      };
      const hasIslandsImport = (await Promise.all(
        (await walkDependencyTree(id, resolve)).flat().map(async (x) => {
          const rootPath = "/" + path.relative(root, normalizePath(x)).replace(/\\/g, "/");
          return matchIslandComponentId(rootPath, islandDir);
        })
      )).some((matched) => matched);
      if (!hasIslandsImport) {
        return;
      }
      const ast = parse(sourceCode, {
        sourceType: "module",
        plugins: ["jsx", "typescript"]
      });
      const hasIslandsNode = {
        type: "ExportNamedDeclaration",
        declaration: {
          type: "VariableDeclaration",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: IMPORTING_ISLANDS_ID },
              init: { type: "BooleanLiteral", value: true }
            }
          ],
          kind: "const"
        }
      };
      ast.program.body.push(hasIslandsNode);
      const output = generate(ast, {}, sourceCode);
      return {
        code: output.code,
        map: output.map
      };
    }
  };
}
export {
  injectImportingIslands
};
