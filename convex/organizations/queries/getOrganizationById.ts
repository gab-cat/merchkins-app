import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Get organization by ID
export const getOrganizationByIdArgs = {
  organizationId: v.id("organizations"),
};

export const getOrganizationByIdHandler = async (
  ctx: QueryCtx,
  args: { organizationId: Id<"organizations"> }
) => {
  const organization = await ctx.db.get(args.organizationId);
  
  if (!organization || organization.isDeleted) {
    return null;
  }
  
  return organization;
};
