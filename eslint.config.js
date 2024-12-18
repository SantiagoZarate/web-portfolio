import pluginJs from '@eslint/js'
import pluginAstro from 'eslint-plugin-astro'
import globals from 'globals'
import pluginTs from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}']
  },
  {
    languageOptions: {
      globals: globals.browser
    },
    rules: {}
  },
  pluginJs.configs.recommended,
  ...pluginTs.configs.recommended,
  ...pluginAstro.configs.recommended
]
