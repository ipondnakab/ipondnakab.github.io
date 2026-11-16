import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative } from "node:path";
// @vitest-environment node
// Use the pinned core entry: the root entry installs global matchers and
// throws with this repository's deliberate Vitest globals: false setting.
import { projectFiles } from "archunit/dist/src/files";
import ts from "typescript";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const features = readdirSync("src/features", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
const walk = (folder: string): string[] =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
const files = walk("src").filter((file) => /\.tsx?$/.test(file));
const productionFiles = files.filter(
  (file) => !/\.(test|spec)\.tsx?$/.test(file),
);
const parse = (file: string) =>
  ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );

describe("architecture dependencies (ArchUnitTS)", () => {
  it("has no production source dependency cycles", async () => {
    expect(
      await projectFiles()
        .inPath(/^src\/(?!.*\.(?:test|spec)\.tsx?$).*\.tsx?$/)
        .should()
        .haveNoCycles()
        .check(),
    ).toEqual([]);
  }, 30000);

  it("keeps shared independent of app and features", async () => {
    expect(
      await projectFiles()
        .inFolder("src/shared/**")
        .shouldNot()
        .dependOnFiles()
        .inFolder(/^src\/(app|features)(\/|$)/)
        .check(),
    ).toEqual([]);
  }, 30000);

  it("keeps features independent of routes", async () => {
    expect(
      await projectFiles()
        .inFolder("src/features/**")
        .shouldNot()
        .dependOnFiles()
        .inFolder("src/app/**")
        .check(),
    ).toEqual([]);
  }, 30000);

  for (const feature of features.filter((name) =>
    files.some((file) =>
      new RegExp(`^src/features/${name}/(lib|model|constants)(/|\\.)`).test(
        file,
      ),
    ),
  )) {
    it(`protects ${feature}'s private modules from external consumers`, async () => {
      expect(
        await projectFiles()
          .inPath(new RegExp(`^src/(?!features/${feature}/).*`))
          .shouldNot()
          .dependOnFiles()
          .inPath(
            new RegExp(`^src/features/${feature}/(lib|model|constants)(/|\\.)`),
          )
          .check(),
      ).toEqual([]);
    }, 30000);
  }

  it("keeps feature barrels independent of components", async () => {
    expect(
      await projectFiles()
        .inPath(/^src\/features\/[^/]+\/index\.ts$/)
        .shouldNot()
        .dependOnFiles()
        .inFolder(/^src\/features\/[^/]+\/components(\/|$)/)
        .check(),
    ).toEqual([]);
  }, 30000);
});

describe("source folder consistency", () => {
  it("keeps static export routes free of server entry points", () => {
    expect(
      files.filter(
        (file) =>
          /^src\/app\/api\//.test(file) ||
          /(^|\/)(route|middleware)\.tsx?$/.test(file),
      ),
    ).toEqual([]);
  });

  it("uses only the documented source layers and feature folders", () => {
    expect(readdirSync("src").sort()).toEqual(["app", "features", "shared"]);
    expect(readdirSync("src/shared").sort()).toEqual([
      "config",
      "i18n",
      "layouts",
      "lib",
      "providers",
      "seo",
      "types",
      "ui",
    ]);
    const invalid = files.filter((file) => {
      if (!file.startsWith("src/features/")) return false;
      return !/^src\/features\/[a-z0-9]+(?:-[a-z0-9]+)*\/(?:index\.ts|constants(?:\.test)?\.ts|(?:components|lib|model|constants)\/.*)$/.test(
        file,
      );
    });
    expect(invalid).toEqual([]);
  });

  it("keeps component folders for PascalCase TSX components and their tests", () => {
    expect(
      files.filter(
        (file) =>
          /\/(components|ui|layouts|providers|seo)\//.test(file) &&
          !/^[A-Z][A-Za-z0-9]*(?:\.test)?\.tsx?$/.test(basename(file)),
      ),
    ).toEqual([]);
    expect(
      productionFiles.filter(
        (file) =>
          /\/(components|ui|layouts|providers|seo)\//.test(file) &&
          !file.endsWith(".tsx"),
      ),
    ).toEqual([]);
  });

  it("uses kebab-case for supporting modules, with TSX only when JSX is present", () => {
    const invalid = productionFiles.filter((file) => {
      if (
        !/\/(lib|model|constants|types|config)\//.test(file) &&
        !file.endsWith("/constants.ts")
      )
        return false;
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.tsx?$/.test(basename(file))) return true;
      let jsx = false;
      const visit = (node: ts.Node): void => {
        if (
          ts.isJsxElement(node) ||
          ts.isJsxSelfClosingElement(node) ||
          ts.isJsxFragment(node)
        )
          jsx = true;
        ts.forEachChild(node, visit);
      };
      visit(parse(file));
      return file.endsWith(".tsx") && !jsx;
    });
    expect(invalid).toEqual([]);
  });

  it("keeps domain types in model or shared/types (component props stay beside components)", () => {
    const invalid = productionFiles.flatMap((file) => {
      if (
        !file.startsWith("src/features/") &&
        !file.startsWith("src/shared/lib/")
      )
        return [];
      if (file.includes("/model/")) return [];
      return parse(file).statements.flatMap((node) =>
        (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
        !(
          /\/(components|ui|layouts|providers|seo)\//.test(file) &&
          /Props$/.test(node.name.text)
        )
          ? [`${file}: ${node.name.text}`]
          : [],
      );
    });
    expect(invalid).toEqual([]);
  });

  it("keeps runtime data out of type models", () => {
    expect(
      productionFiles.flatMap((file) =>
        file.includes("/model/")
          ? parse(file)
              .statements.filter(ts.isVariableStatement)
              .map(() => file)
          : [],
      ),
    ).toEqual([]);
  });

  it("keeps pure named helpers out of component modules", () => {
    expect(
      productionFiles.flatMap((file) =>
        !file.includes("/components/")
          ? []
          : parse(file)
              .statements.filter(
                (node) =>
                  ts.isVariableStatement(node) &&
                  node.modifiers?.some(
                    (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
                  ),
              )
              .map(() => file),
      ),
    ).toEqual([]);
  });
});

// Run the real CLI once against a batch of isolated files. The configured
// feature overrides apply to the same relative paths as real source files.
interface LintFixture {
  path: string;
  source: string;
  rule?: string;
  severity?: string;
}
interface LintDiagnostic {
  filename: string;
  code: string;
  severity: string;
}
const fixtures: LintFixture[] = [];
const addFixture = (
  folder: string,
  name: string,
  source: string,
  rule?: string,
  severity = "error",
) => {
  const fixture = { path: `${folder}/${name}.tsx`, source, rule, severity };
  fixtures.push(fixture);
  return fixture;
};
const architectureExamples = features.map((feature) => {
  const other = features.find((name) => name !== feature)!;
  const folder = `src/features/${feature}/components`;
  const forbidden = [
    `@/features/${other}/lib/private`,
    `@/features/${other}/model/private`,
    `@/features/${other}/constants`,
    "@/app/page",
    "../sibling",
    "./nested/helper",
  ].map((dependency, index) =>
    addFixture(
      folder,
      `Forbidden${index}`,
      `export { value } from "${dependency}";`,
      "no-restricted-imports",
    ),
  );
  const allowed = [
    `@/features/${feature}/model/private`,
    `@/features/${other}`,
    `@/features/${other}/components/Example`,
    "./Sibling",
    "@/shared/lib/example",
  ].map((dependency, index) =>
    addFixture(
      folder,
      `Allowed${index}`,
      `export { value } from "${dependency}";`,
    ),
  );
  const barrel = {
    path: `src/features/${feature}/index.ts`,
    source: `export { default as Example } from "@/features/${feature}/components/Example";`,
    rule: "no-restricted-imports",
    severity: "error",
  };
  fixtures.push(barrel);
  return { feature, examples: [...forbidden, ...allowed, barrel] };
});
const reverseExamples = [
  addFixture(
    "src/shared/ui",
    "ReverseFeature",
    'export { value } from "@/features/chat";',
    "no-restricted-imports",
  ),
  addFixture(
    "src/shared/ui",
    "ReverseRoute",
    'export { value } from "@/app/layout";',
    "no-restricted-imports",
  ),
  addFixture(
    "src/app",
    "PrivateFeature",
    'export { value } from "@/features/chat/model/chat";',
    "no-restricted-imports",
  ),
];
const fixImportsFixture = addFixture(
  "src/shared/config",
  "FixImports",
  'import { unused } from "example"; import "./setup"; const unusedValue = 1; export const value = 2;',
  "no-unused-vars",
);
const policyExamples = [
  fixImportsFixture,
  addFixture(
    "src/features/chat/components",
    "JsxUsage",
    'import React from "react"; const Child = () => <div />; export const Example = () => <Child />;',
  ),
  addFixture(
    "src/shared/config",
    "Any",
    "export const value: any = 1;",
    "no-explicit-any",
  ),
  addFixture("src/shared/config", "Console", "console.log(1);", "no-console"),
  addFixture(
    "src/shared/config",
    "UnusedImport",
    'import { unused } from "example";',
    "no-unused-vars",
  ),
  addFixture(
    "src/shared/config",
    "UnusedVariable",
    "const unused = 1;",
    "no-unused-vars",
  ),
  addFixture(
    "src/shared/config",
    "ObjectType",
    "export type Example = { value: number };",
    "consistent-type-definitions",
  ),
  addFixture("src/shared/config", "Var", "export var value = 1;", "no-var"),
  addFixture(
    "src/shared/config",
    "PreferConst",
    "let value = 1; export { value };",
    "prefer-const",
  ),
  addFixture(
    "src/shared/config",
    "Equality",
    "export const same = (a: string, b: string) => a == b;",
    "eqeqeq",
  ),
  addFixture(
    "src/shared/config",
    "AllowedPolicy",
    `export interface Example { value: number }
const _unused = 1;
console.warn("warning"); console.error("error");`,
  ),
  addFixture(
    "src/features/chat/components",
    "Hook",
    'import { useState } from "react"; export const Example = ({ visible }: { visible: boolean }) => { if (visible) useState(0); return null; };',
    "rules-of-hooks",
  ),
  addFixture(
    "src/app",
    "Script",
    'export const Example = () => <script src="https://example.com/script.js" />;',
    "no-sync-scripts",
  ),
  addFixture(
    "src/shared/ui",
    "Alt",
    'export const Example = () => <img src="/example.png" />;',
    "alt-text",
    "warning",
  ),
  ...[
    "componentWillMount",
    "componentWillReceiveProps",
    "componentWillUpdate",
  ].map((name, index) =>
    addFixture(
      "src/features/chat/components",
      `DeprecatedLifecycle${index}`,
      `import React from "react"; export class Example extends React.Component { ${name}() {} render() { return null; } }`,
      "no-deprecated-lifecycle",
    ),
  ),
  addFixture(
    "src/shared/config",
    "DeprecatedImport",
    'export { render } from "react-dom";',
    "no-restricted-imports",
  ),
  addFixture(
    "src/shared/config",
    "DeprecatedProperty",
    'import ReactDOM from "react-dom"; export const render = ReactDOM.render;',
    "no-restricted-properties",
  ),
  addFixture(
    "src/shared/config",
    "ModernReact",
    'export { createRoot } from "react-dom/client";',
  ),
];
let fixtureRoot: string;
let diagnostics: LintDiagnostic[] = [];
beforeAll(() => {
  fixtureRoot = mkdtempSync(join(tmpdir(), "portfolio-oxlint-"));
  // Materialize the CLI's evaluated configuration in the isolated project so
  // override globs use the fixture root, rather than the production root.
  const configResult = spawnSync(
    process.execPath,
    [join(process.cwd(), "node_modules/oxlint/bin/oxlint"), "--print-config"],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  expect(configResult.status, configResult.stderr + configResult.stdout).toBe(
    0,
  );
  writeFileSync(join(fixtureRoot, ".oxlintrc.json"), configResult.stdout);
  for (const fixture of fixtures) {
    const file = join(fixtureRoot, fixture.path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, fixture.source);
  }
  const result = spawnSync(
    process.execPath,
    [
      join(process.cwd(), "node_modules/oxlint/bin/oxlint"),
      "--config",
      join(fixtureRoot, ".oxlintrc.json"),
      "--format",
      "json",
      "src",
    ],
    { cwd: fixtureRoot, encoding: "utf8" },
  );
  expect(result.error, result.error?.message).toBeUndefined();
  expect([0, 1], `${result.stderr}\n${result.stdout}`).toContain(result.status);
  expect(
    result.stdout.trim().startsWith("{"),
    result.stdout + result.stderr,
  ).toBe(true);
  const report = JSON.parse(result.stdout) as {
    diagnostics: LintDiagnostic[];
    number_of_files: number;
  };
  expect(report.number_of_files).toBe(fixtures.length);
  diagnostics = report.diagnostics;
}, 30000);
afterAll(() => {
  if (fixtureRoot) rmSync(fixtureRoot, { recursive: true, force: true });
});
const expectFixture = (fixture: LintFixture) => {
  const messages = diagnostics.filter((diagnostic) => {
    const file = diagnostic.filename.startsWith(fixtureRoot)
      ? relative(fixtureRoot, diagnostic.filename)
      : diagnostic.filename;
    return file === fixture.path;
  });
  if (fixture.rule)
    expect(messages, fixture.path).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: expect.stringContaining(fixture.rule),
          severity: fixture.severity,
        }),
      ]),
    );
  else expect(messages, fixture.path).toEqual([]);
};
describe("Oxlint architecture rejection examples", () => {
  for (const { feature, examples } of architectureExamples) {
    it(`enforces private modules, aliases and barrel boundaries for ${feature}`, () =>
      examples.forEach(expectFixture));
  }
  it("rejects reverse shared dependencies and private route imports", () =>
    reverseExamples.forEach(expectFixture));
});
describe("Oxlint coding policy", () => {
  for (const fixture of policyExamples)
    it(`preserves ${fixture.rule ?? "allowed policy"} (${basename(fixture.path)})`, () =>
      expectFixture(fixture));
});

it("fixes unused imports while preserving side-effect imports and unused variable diagnostics", () => {
  const file = join(fixtureRoot, fixImportsFixture.path);
  const result = spawnSync(
    process.execPath,
    [
      join(process.cwd(), "node_modules/oxlint/bin/oxlint"),
      "--config",
      join(fixtureRoot, ".oxlintrc.json"),
      "--fix",
      "--format",
      "json",
      file,
    ],
    { cwd: fixtureRoot, encoding: "utf8" },
  );
  expect(result.error).toBeUndefined();
  const source = readFileSync(file, "utf8");
  expect(source).not.toContain("{ unused }");
  expect(source).toContain('import "./setup"');
  expect(source).toContain("const unusedValue = 1");
  const report = JSON.parse(result.stdout) as { diagnostics: LintDiagnostic[] };
  expect(report.diagnostics).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: expect.stringContaining("no-unused-vars"),
        severity: "error",
      }),
    ]),
  );
});
