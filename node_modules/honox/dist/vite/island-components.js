import _generate from "@babel/generator";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import {
  blockStatement,
  conditionalExpression,
  exportDefaultDeclaration,
  exportNamedDeclaration,
  exportSpecifier,
  functionExpression,
  identifier,
  importDeclaration,
  importSpecifier,
  jsxAttribute,
  jsxClosingElement,
  jsxElement,
  jsxExpressionContainer,
  jsxIdentifier,
  jsxOpeningElement,
  jsxSpreadAttribute,
  memberExpression,
  returnStatement,
  stringLiteral,
  variableDeclaration,
  variableDeclarator
} from "@babel/types";
import { parse as parseJsonc } from "jsonc-parser";
import fs from "fs/promises";
import path from "path";
import { isComponentName, matchIslandComponentId } from "./utils/path.js";
const generate = _generate.default ?? _generate;
const traverse = _traverse.default ?? _traverse;
function addSSRCheck(funcName, componentName, componentExport) {
  const isSSR = memberExpression(
    memberExpression(identifier("import"), identifier("meta")),
    identifier("env.SSR")
  );
  const props = [
    jsxAttribute(jsxIdentifier("componentName"), stringLiteral(componentName)),
    jsxAttribute(jsxIdentifier("Component"), jsxExpressionContainer(identifier(funcName))),
    jsxAttribute(jsxIdentifier("props"), jsxExpressionContainer(identifier("props")))
  ];
  if (componentExport && componentExport !== "default") {
    props.push(jsxAttribute(jsxIdentifier("componentExport"), stringLiteral(componentExport)));
  }
  const ssrElement = jsxElement(
    jsxOpeningElement(jsxIdentifier("HonoXIsland"), props, true),
    null,
    []
  );
  const clientElement = jsxElement(
    jsxOpeningElement(jsxIdentifier(funcName), [jsxSpreadAttribute(identifier("props"))], false),
    jsxClosingElement(jsxIdentifier(funcName)),
    []
  );
  const returnStmt = returnStatement(conditionalExpression(isSSR, ssrElement, clientElement));
  return functionExpression(null, [identifier("props")], blockStatement([returnStmt]));
}
const transformJsxTags = (contents, componentName) => {
  const ast = parse(contents, {
    sourceType: "module",
    plugins: ["typescript", "jsx"]
  });
  if (ast) {
    let isTransformed = false;
    traverse(ast, {
      // @ts-expect-error path is not typed
      ExportNamedDeclaration(path2) {
        if (path2.node.declaration?.type === "FunctionDeclaration") {
          const name = path2.node.declaration.id?.name;
          if (name && isComponentName(name)) {
            path2.insertBefore(path2.node.declaration);
            path2.replaceWith(
              exportNamedDeclaration(null, [exportSpecifier(identifier(name), identifier(name))])
            );
          }
          return;
        }
        if (path2.node.declaration?.type === "VariableDeclaration") {
          const kind = path2.node.declaration.kind;
          for (const declaration of path2.node.declaration.declarations) {
            if (declaration.id.type === "Identifier") {
              const name = declaration.id.name;
              if (!isComponentName(name)) {
                continue;
              }
              path2.insertBefore(variableDeclaration(kind, [declaration]));
              path2.insertBefore(
                exportNamedDeclaration(null, [exportSpecifier(identifier(name), identifier(name))])
              );
              path2.remove();
            }
          }
          return;
        }
        for (const specifier of path2.node.specifiers) {
          if (specifier.type !== "ExportSpecifier") {
            continue;
          }
          const exportAs = specifier.exported.type === "StringLiteral" ? specifier.exported.value : specifier.exported.name;
          if (exportAs !== "default" && !isComponentName(exportAs)) {
            continue;
          }
          isTransformed = true;
          const wrappedFunction = addSSRCheck(specifier.local.name, componentName, exportAs);
          const wrappedFunctionId = identifier("Wrapped" + specifier.local.name);
          path2.insertBefore(
            variableDeclaration("const", [variableDeclarator(wrappedFunctionId, wrappedFunction)])
          );
          specifier.local.name = wrappedFunctionId.name;
        }
      },
      // @ts-expect-error path is not typed
      ExportDefaultDeclaration(path2) {
        const declarationType = path2.node.declaration.type;
        if (declarationType === "FunctionDeclaration" || declarationType === "FunctionExpression" || declarationType === "ArrowFunctionExpression" || declarationType === "Identifier") {
          isTransformed = true;
          const functionName = (declarationType === "Identifier" ? path2.node.declaration.name : (declarationType === "FunctionDeclaration" || declarationType === "FunctionExpression") && path2.node.declaration.id?.name) || "__HonoIsladComponent__";
          let originalFunctionId;
          if (declarationType === "Identifier") {
            originalFunctionId = path2.node.declaration;
          } else {
            originalFunctionId = identifier(functionName + "Original");
            const originalFunction = path2.node.declaration.type === "FunctionExpression" || path2.node.declaration.type === "ArrowFunctionExpression" ? path2.node.declaration : functionExpression(
              null,
              path2.node.declaration.params,
              path2.node.declaration.body,
              void 0,
              path2.node.declaration.async
            );
            path2.insertBefore(
              variableDeclaration("const", [
                variableDeclarator(originalFunctionId, originalFunction)
              ])
            );
          }
          const wrappedFunction = addSSRCheck(originalFunctionId.name, componentName);
          const wrappedFunctionId = identifier("Wrapped" + functionName);
          path2.replaceWith(
            variableDeclaration("const", [variableDeclarator(wrappedFunctionId, wrappedFunction)])
          );
          ast.program.body.push(exportDefaultDeclaration(wrappedFunctionId));
        }
      }
    });
    if (isTransformed) {
      ast.program.body.unshift(
        importDeclaration(
          [importSpecifier(identifier("HonoXIsland"), identifier("HonoXIsland"))],
          stringLiteral("honox/vite/components")
        )
      );
    }
    const { code } = generate(ast);
    return code;
  }
};
function islandComponents(options) {
  let root = "";
  let reactApiImportSource = options?.reactApiImportSource;
  const islandDir = options?.islandDir ?? "/app/islands";
  return {
    name: "transform-island-components",
    configResolved: async (config) => {
      root = config.root;
      if (!reactApiImportSource) {
        const tsConfigFiles = ["deno.json", "deno.jsonc", "tsconfig.json"];
        let tsConfigRaw;
        for (const tsConfigFile of tsConfigFiles) {
          try {
            const tsConfigPath = path.resolve(process.cwd(), tsConfigFile);
            tsConfigRaw = await fs.readFile(tsConfigPath, "utf8");
            break;
          } catch {
          }
        }
        if (!tsConfigRaw) {
          console.warn("Cannot find tsconfig.json or deno.json(c)");
          return;
        }
        const tsConfig = parseJsonc(tsConfigRaw);
        reactApiImportSource = tsConfig?.compilerOptions?.jsxImportSource;
        if (reactApiImportSource === "hono/jsx/dom") {
          reactApiImportSource = "hono/jsx";
        }
      }
    },
    async load(id) {
      if (/\/honox\/.*?\/(?:server|vite)\/components\//.test(id)) {
        if (!reactApiImportSource) {
          return;
        }
        const contents = await fs.readFile(id, "utf-8");
        return {
          code: contents.replaceAll("hono/jsx", reactApiImportSource),
          map: null
        };
      }
      const rootPath = "/" + path.relative(root, id).replace(/\\/g, "/");
      const match = matchIslandComponentId(rootPath, islandDir);
      if (match) {
        const componentName = match[0];
        const contents = await fs.readFile(id, "utf-8");
        const code = transformJsxTags(contents, componentName);
        if (code) {
          return {
            code,
            map: null
          };
        }
      }
    }
  };
}
export {
  islandComponents,
  transformJsxTags
};
