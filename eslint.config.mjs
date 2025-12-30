import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import convexPlugin from '@convex-dev/eslint-plugin';
import oxlint from 'eslint-plugin-oxlint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  convexPlugin.configs.recommended,
];

export default eslintConfig;
