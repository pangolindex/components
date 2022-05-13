module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
  },
  globals: {
    window: true,
    document: true,
    localStorage: true,
    FormData: true,
    FileReader: true,
    Blob: true,
    navigator: true,
  },
  parserOptions: {
    project: 'tsconfig.json',
    ecmaVersion: 6, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true,
      modules: true,
      experimentalObjectRestSpread: true,
    },
  },
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  plugins: ['react', '@typescript-eslint', 'react-hooks'],
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
    'prettier',
  ],
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', '.'],
        paths: ['src'],
      },
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'import/named': 'off',
    '@typescript-eslint/no-non-null-assertion': "off",
    // 'no-nested-ternary': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '[Rr]eact' }],
    '@typescript-eslint/no-empty-function': 'off',
    'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
      },
    ],
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      },
    ],
  },
};
