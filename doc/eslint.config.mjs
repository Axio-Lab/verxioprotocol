import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Disable unescaped entities rule for documentation content
      'react/no-unescaped-entities': 'off',
      // Allow unused variables in demo/documentation code
      '@typescript-eslint/no-unused-vars': 'warn',
      // Allow any types in documentation examples
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow empty functions in demo code
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
]

export default eslintConfig


