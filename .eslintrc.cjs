module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint/eslint-plugin",
    "typescript-sort-keys",
    "sort-keys-plus",
    "simple-import-sort",
    "sort-class-members",
  ],
  extends: [
    "plugin:unicorn/recommended",
    "airbnb-base",
    "airbnb-typescript/base",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  root: true,
  env: {
    node: true,
  },
  ignorePatterns: [".eslintrc.cjs"],
  rules: {
    // Use function hoisting to improve code readability
    // https://typescript-eslint.io/rules/no-use-before-define/#how-to-use
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": [
      "error",
      { variables: false, functions: false },
    ],
    // https://www.lloydatkinson.net/posts/2022/default-exports-in-javascript-modules-are-terrible/
    "import/prefer-default-export": "off",
    "import/no-default-export": "error",
    // Prefer no filenames on import
    "import/extensions": [
      "error",
      "never",
      {
        json: "always",
        module: "always",
        service: "always",
        entity: "always",
        interface: "always",
        types: "always",
        config: "always",
        validation: "always",
        utils: "always",
        error: "always",
        dto: "always",
      },
    ],
    // Common abbreviations are known and readable
    "unicorn/prevent-abbreviations": "off",
    // Airbnb prefers forEach
    "unicorn/no-array-for-each": "off",
    // Prefer different cases for different types of files
    "unicorn/filename-case": "off",
    // null has a different meaning as undefined if used correctly
    "unicorn/no-null": "off",
    // https://stackoverflow.com/questions/44939304/eslint-should-be-listed-in-the-projects-dependencies-not-devdependencies
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    // Nest prefers interfaces to be prefixed with 'I'
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "interface",
        format: ["PascalCase"],
      },
    ],
    "@typescript-eslint/lines-between-class-members": "off",
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "lines-between-class-members": "off",
    "no-console": 0,
    "no-await-in-loop": 0,
    "no-restricted-syntax": [
      "error",
      {
        selector: "ForInStatement",
        message:
          "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.",
      },
      // {
      //   selector: 'ForOfStatement',
      //   message:
      //     'iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.',
      // },
      {
        selector: "LabeledStatement",
        message:
          "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.",
      },
      {
        selector: "WithStatement",
        message:
          "`with` is disallowed in strict mode because it makes code impossible to predict and optimize.",
      },
    ],
    "no-continue": 0,
    "consistent-return": 0,
    "default-case": 0,
    "unicorn/prefer-top-level-await": 0,
    "unicorn/prefer-module": 0,
    "@typescript-eslint/explicit-function-return-type": "error",
    "simple-import-sort/imports": "error",
    "sort-class-members/sort-class-members": [
      2,
      {
        order: [
          // Static public properties
          {
            type: "property",
            static: true,
            private: false,
            sort: "alphabetical",
          },
          // Static private properties
          {
            type: "property",
            static: true,
            private: true,
            sort: "alphabetical",
          },
          // Public properties
          {
            type: "property",
            static: false,
            private: false,
            sort: "alphabetical",
          },
          // Private properties
          {
            type: "property",
            static: false,
            private: true,
            sort: "alphabetical",
          },
          // Constructor
          "constructor",
          // Public methods
          {
            type: "method",
            static: false,
            private: false,
            sort: "alphabetical",
          },
          // Private methods
          {
            type: "method",
            static: false,
            private: true,
            sort: "alphabetical",
          },
          // Public static methods
          { type: "method", static: true, private: true, sort: "alphabetical" },
          // Private static methods
          { type: "method", static: true, private: true, sort: "alphabetical" },
        ],
        accessorPairPositioning: "getThenSet",
      },
    ],
  },
  overrides: [
    {
      files: ["src/*/constants.ts", "data/**"],
      rules: {
        "sort-keys-plus/sort-keys": "error",
        "typescript-sort-keys/interface": "error",
      },
    },
  ],
};
