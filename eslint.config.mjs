import convexPlugin from '@convex-dev/eslint-plugin';
import tseslint from 'typescript-eslint';

const eslintConfig = [...tseslint.configs.recommended, ...convexPlugin.configs.recommended];

export default eslintConfig;
