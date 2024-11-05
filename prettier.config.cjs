/** @type {import('prettier').Config} */
const config = {
  plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  tailwindConfig: './tailwind.config.ts',
  importOrder: [
    '^(react/(.*)$)|^(react$)|^(react-native(.*)$)',
    '^(next/(.*)$)|^(next$)',
    '<THIRD_PARTY_MODULES>',
    '',
    '',
    '^@/(.*)$',
    '',
    '^~/',
    '^[../]',
    '^[./]',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.2.2',
  endOfLine: 'lf',
  semi: false,
  tabWidth: 2,
  useTabs: false,
  trailingComma: 'es5',
  singleQuote: true,
  bracketSpacing: true,
  bracketSameLine: true,
  singleAttributePerLine: true,
  printWidth: 160,
}

module.exports = config
