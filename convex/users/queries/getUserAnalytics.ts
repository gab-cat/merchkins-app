import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Get user activity analytics
export const getUserAnalyticsArgs = {
  userId: v.optional(v.id("users")),
  timeRange: v.optional(v.union(v.literal("7d"), v.literal("30d"), v.literal("90d"), v.literal("1y"))),
};

export const getUserAnalyticsHandler = async (
  ctx: QueryCtx,
  args: {
    userId?: Id<"users">;
    timeRange?: "7d" | "30d" | "90d" | "1y";
  }
) => {
  const { userId, timeRange = "30d" } = args;
  
  // Calculate time range in milliseconds
  const now = Date.now();
  const timeRanges = {
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "90d": 90 * 24 * 60 * 60 * 1000,
    "1y": 365 * 24 * 60 * 60 * 1000,
  };
  const cutoffTime = now - timeRanges[timeRange];
  
  if (userId) {
    // Get specific user analytics
    const user = await ctx.db.get(userId);
    if (!user || user.isDeleted) {
      throw new Error("User not found");
    }
    
    return {
      totalOrders: user.totalOrders || 0,
      totalSpent: user.totalSpent || 0,
      reviewCount: user.reviewCount || 0,
      lastLoginAt: user.lastLoginAt,
      lastOrderAt: user.lastOrderAt,
      organizationCount: (user.organizationMemberships || []).filter(m => m.isActive).length,
    };
  } else {
    // Get platform analytics
    const allUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();
    
    const activeUsers = allUsers.filter(user => 
      user.lastLoginAt && user.lastLoginAt >= cutoffTime
    );
    
    const totalUsers = allUsers.length;
    const activeUsersCount = activeUsers.length;
    const totalOrders = allUsers.reduce((sum, user) => sum + (user.totalOrders || 0), 0);
    const totalRevenue = allUsers.reduce((sum, user) => sum + (user.totalSpent || 0), 0);
    const staffCount = allUsers.filter(user => user.isStaff).length;
    const merchantCount = allUsers.filter(user => user.isMerchant).length;
    const adminCount = allUsers.filter(user => user.isAdmin).length;
    
    return {
      totalUsers,
      activeUsers: activeUsersCount,
      totalOrders,
      totalRevenue,
      staffCount,
      merchantCount,
      adminCount,
      averageOrdersPerUser: totalUsers > 0 ? totalOrders / totalUsers : 0,
      averageRevenuePerUser: totalUsers > 0 ? totalRevenue / totalUsers : 0,
    };
  }
};
