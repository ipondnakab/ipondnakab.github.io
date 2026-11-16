// Oxlint has no native counterpart for react/no-deprecated. Native import and
// property restrictions cover deprecated APIs; this rule covers lifecycle names.
// Keep these checks until Oxlint provides the equivalent native React rule.
const deprecatedLifecycles = new Set([
  "componentWillMount",
  "componentWillReceiveProps",
  "componentWillUpdate",
]);

const reactCompat = {
  meta: { name: "portfolio-react" },
  rules: {
    "no-deprecated-lifecycle": {
      meta: {
        type: "problem",
        schema: [],
        messages: {
          deprecated:
            "{{name}} is deprecated in React 18. Use supported lifecycle methods or hooks.",
        },
      },
      create(context) {
        const check = (node) => {
          const name = node.key?.name ?? node.key?.value;
          if (deprecatedLifecycles.has(name)) {
            context.report({
              node: node.key,
              messageId: "deprecated",
              data: { name },
            });
          }
        };
        return {
          MethodDefinition: check,
          PropertyDefinition: check,
          Property: check,
        };
      },
    },
  },
};

export default reactCompat;
