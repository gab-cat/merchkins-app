import { query } from "../../_generated/server";

// Import args and handlers
import { getCategoryByIdArgs, getCategoryByIdHandler } from "./getCategoryById";
import { getCategoryBySlugArgs, getCategoryBySlugHandler } from "./getCategoryBySlug";
import { getCategoriesArgs, getCategoriesHandler } from "./getCategories";
import { searchCategoriesArgs, searchCategoriesHandler } from "./searchCategories";
import { getCategoryHierarchyArgs, getCategoryHierarchyHandler } from "./getCategoryHierarchy";
import { getCategoryAnalyticsArgs, getCategoryAnalyticsHandler } from "./getCategoryAnalytics";
import { getPopularCategoriesArgs, getPopularCategoriesHandler } from "./getPopularCategories";

// Export query functions
export const getCategoryById = query({
  args: getCategoryByIdArgs,
  handler: getCategoryByIdHandler,
});

export const getCategoryBySlug = query({
  args: getCategoryBySlugArgs,
  handler: getCategoryBySlugHandler,
});

export const getCategories = query({
  args: getCategoriesArgs,
  handler: getCategoriesHandler,
});

export const searchCategories = query({
  args: searchCategoriesArgs,
  handler: searchCategoriesHandler,
});

export const getCategoryHierarchy = query({
  args: getCategoryHierarchyArgs,
  handler: getCategoryHierarchyHandler,
});

export const getCategoryAnalytics = query({
  args: getCategoryAnalyticsArgs,
  handler: getCategoryAnalyticsHandler,
});

export const getPopularCategories = query({
  args: getPopularCategoriesArgs,
  handler: getPopularCategoriesHandler,
});
