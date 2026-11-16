import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type OxlintOverride } from "oxlint";

const features = readdirSync(
  fileURLToPath(new URL("./src/features", import.meta.url)),
  { withFileTypes: true },
)
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
const deprecatedImports = [
  {
    name: "react",
    importNames: [
      "renderComponent",
      "renderComponentToString",
      "renderComponentToStaticMarkup",
      "isValidComponent",
      "isValidClass",
      "render",
      "unmountComponentAtNode",
      "findDOMNode",
      "renderToString",
      "renderToStaticMarkup",
      "createClass",
      "PropTypes",
      "DOM",
    ],
    message: "Use supported React 18 APIs.",
  },
  {
    name: "react-dom",
    importNames: ["render", "hydrate", "unmountComponentAtNode"],
    message: "Use createRoot/hydrateRoot and root.unmount instead.",
  },
  {
    name: "react-dom/server",
    importNames: ["renderToNodeStream"],
    message: "Use renderToPipeableStream instead.",
  },
  {
    name: "react-addons-perf",
    importNames: ["printDOM", "getMeasurementsSummaryMap"],
    message: "This React performance API is deprecated.",
  },
];
const siblingImports = [
  {
    group: ["../*", "../**", "./*/**"],
    message:
      "Use the '@/' path alias for cross-folder imports. Relative imports are only allowed for same-folder siblings (./).",
  },
];
const privateModules = {
  group: [
    "@/features/*/lib",
    "@/features/*/lib/**",
    "@/features/*/model",
    "@/features/*/model/**",
    "@/features/*/constants",
    "@/features/*/constants/**",
  ],
  message:
    "Feature internals are private. Import types, constants and helpers via the feature barrel ('@/features/<name>'); only 'components/<Component>' may be imported by path.",
};
const appImports = {
  group: ["@/app", "@/app/**"],
  message: "Modules must not import from app/.",
};
// Use positive feature patterns: negated patterns can cancel a later barrel
// restriction in Oxlint. Rejection fixtures guard this compatibility detail.
const restriction = (
  patterns: typeof siblingImports,
): NonNullable<OxlintOverride["rules"]> => ({
  "no-restricted-imports": ["error", { paths: deprecatedImports, patterns }],
});
const overrides: OxlintOverride[] = [
  {
    files: ["**/src/shared/**"],
    rules: restriction([
      ...siblingImports,
      {
        group: ["@/features", "@/features/**"],
        message:
          "shared/ must not import features/. Invert the dependency with a slot or prop.",
      },
      appImports,
    ]),
  },
  {
    files: ["**/src/app/**"],
    rules: restriction([...siblingImports, privateModules]),
  },
];
for (const feature of features) {
  const boundaries = [
    ...siblingImports,
    {
      ...privateModules,
      group: features
        .filter((name) => name !== feature)
        .flatMap((name) =>
          privateModules.group.map((pattern) =>
            pattern.replace("@/features/*/", `@/features/${name}/`),
          ),
        ),
    },
    appImports,
  ];
  overrides.push({
    files: [`**/src/features/${feature}/**`],
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: deprecatedImports, patterns: boundaries },
      ],
    },
  });
  overrides.push({
    files: [`**/src/features/${feature}/index.ts`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: deprecatedImports,
          patterns: [
            ...boundaries,
            {
              group: [
                "./components",
                "./components/**",
                "@/features/*/components",
                "@/features/*/components/**",
              ],
              message:
                "Barrels export types, constants and pure helpers. Import components by path.",
            },
          ],
        },
      ],
    },
  });
}

export default defineConfig({
  plugins: ["typescript", "react", "nextjs", "jsx-a11y", "import"],
  jsPlugins: [
    fileURLToPath(
      new URL("./tooling/oxlint-react-compat.mjs", import.meta.url),
    ),
  ],
  categories: { correctness: "off" },
  env: { browser: true, node: true, es2021: true },
  settings: { react: { version: "18.3" }, next: { rootDir: "." } },
  ignorePatterns: [
    "node_modules/**",
    ".next/**",
    "dist/**",
    "out/**",
    "build/**",
    "coverage/**",
    "public/**",
    "portfolio-api/**",
    "next-env.d.ts",
    "postcss.config.js",
  ],
  rules: {
    "portfolio-react/no-deprecated-lifecycle": "error",
    ...{
      "no-console": [
        "error",
        {
          allow: ["warn", "error"],
        },
      ],
      "no-var": ["error"],
      "prefer-const": ["error"],
      eqeqeq: ["error", "smart"],
      "no-unneeded-ternary": ["error"],
      "object-shorthand": ["error", "properties"],
      "typescript/no-explicit-any": ["error"],
      "typescript/consistent-type-definitions": ["error", "interface"],
      "typescript/ban-ts-comment": ["error"],
      "eslint/no-array-constructor": ["error"],
      "typescript/no-duplicate-enum-values": ["error"],
      "typescript/no-extra-non-null-assertion": ["error"],
      "typescript/no-misused-new": ["error"],
      "typescript/no-namespace": ["error"],
      "typescript/no-non-null-asserted-optional-chain": ["error"],
      "typescript/no-require-imports": ["error"],
      "typescript/no-this-alias": ["error"],
      "typescript/no-unnecessary-type-constraint": ["error"],
      "typescript/no-unsafe-declaration-merging": ["error"],
      "typescript/no-unsafe-function-type": ["error"],
      "eslint/no-unused-expressions": ["error"],
      "typescript/no-wrapper-object-types": ["error"],
      "typescript/prefer-as-const": ["error"],
      "typescript/prefer-namespace-keyword": ["error"],
      "typescript/triple-slash-reference": ["error"],
      "prefer-rest-params": ["error"],
      "prefer-spread": ["error"],
      "nextjs/no-html-link-for-pages": ["error"],
      "nextjs/no-sync-scripts": ["error"],
      "nextjs/google-font-display": ["warn"],
      "nextjs/google-font-preconnect": ["warn"],
      "nextjs/next-script-for-ga": ["warn"],
      "nextjs/no-async-client-component": ["warn"],
      "nextjs/no-before-interactive-script-outside-document": ["warn"],
      "nextjs/no-css-tags": ["warn"],
      "nextjs/no-head-element": ["warn"],
      "nextjs/no-img-element": ["warn"],
      "nextjs/no-page-custom-font": ["warn"],
      "nextjs/no-styled-jsx-in-document": ["warn"],
      "nextjs/no-title-in-document-head": ["warn"],
      "nextjs/no-typos": ["warn"],
      "nextjs/no-unwanted-polyfillio": ["warn"],
      "nextjs/inline-script-id": ["error"],
      "nextjs/no-assign-module-variable": ["error"],
      "nextjs/no-document-import-in-page": ["error"],
      "nextjs/no-duplicate-head": ["error"],
      "nextjs/no-head-import-in-document": ["error"],
      "nextjs/no-script-component-in-head": ["error"],
      "import/no-anonymous-default-export": ["warn"],
      "jsx-a11y/alt-text": [
        "warn",
        {
          elements: ["img"],
          img: ["Image"],
        },
      ],
      "jsx-a11y/aria-props": ["warn"],
      "jsx-a11y/aria-proptypes": ["warn"],
      "jsx-a11y/aria-unsupported-elements": ["warn"],
      "jsx-a11y/role-has-required-aria-props": ["warn"],
      "jsx-a11y/role-supports-aria-props": ["warn"],
      "react/rules-of-hooks": ["error"],
      "react/exhaustive-deps": ["warn"],
      "react/display-name": [2],
      "react/jsx-key": [2],
      "react/jsx-no-comment-textnodes": [2],
      "react/jsx-no-duplicate-props": [2],
      "react/jsx-no-undef": [2],
      "react/no-children-prop": [2],
      "react/no-danger-with-children": [2],
      "react/no-direct-mutation-state": [2],
      "react/no-find-dom-node": [2],
      "react/no-is-mounted": [2],
      "react/no-render-return-value": [2],
      "react/no-string-refs": [2],
      "react/no-unescaped-entities": [2],
      "react/require-render-return": [2],
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "none",
          fix: { imports: "safe-fix", variables: "off" },
        },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "React",
          property: "renderComponent",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "React",
          property: "renderComponentToString",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "React",
          property: "renderComponentToStaticMarkup",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "React",
          property: "isValidComponent",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "React",
          property: "isValidClass",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "React",
          property: "render",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "React",
          property: "unmountComponentAtNode",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "React",
          property: "findDOMNode",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "React",
          property: "renderToString",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "React",
          property: "renderToStaticMarkup",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "React",
          property: "createClass",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "React",
          property: "PropTypes",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "React",
          property: "DOM",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "ReactDOM",
          property: "render",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "ReactDOM",
          property: "hydrate",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "ReactDOM",
          property: "unmountComponentAtNode",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "ReactDOMServer",
          property: "renderToNodeStream",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "ReactPerf",
          property: "printDOM",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "ReactPerf",
          property: "getMeasurementsSummaryMap",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "Perf",
          property: "printDOM",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "Perf",
          property: "getMeasurementsSummaryMap",
          message: "Use supported React 18 APIs.",
        },
        {
          object: "this",
          property: "transferPropsTo",
          message: "Use props spreading instead.",
        },
        {
          object: "React.addons",
          property: "classSet",
        },
        {
          object: "React.addons",
          property: "cloneWithProps",
        },
        {
          object: "React.addons",
          property: "LinkedStateMixin",
        },
        {
          object: "React.addons",
          property: "TestUtils",
        },
      ],
    },
    "no-restricted-imports": [
      "error",
      { paths: deprecatedImports, patterns: siblingImports },
    ],
  },
  overrides,
});
