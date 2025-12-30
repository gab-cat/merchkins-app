/// <reference types="vite/client" />

/**
 * Test setup for convex-test
 * This file exports the modules glob pattern required for convex-test to work properly.
 * Import this in your test files along with the schema.
 */

// Glob pattern that matches all Convex function files
// This includes all .ts files in the convex folder and subfolders
// The pattern MUST include _generated files for convex-test to work
export const modules = import.meta.glob('./**/*.ts');
