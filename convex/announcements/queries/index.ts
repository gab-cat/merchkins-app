import { query } from "../../_generated/server";

import { getAnnouncementByIdArgs, getAnnouncementByIdHandler } from "./getAnnouncementById";
import { getAnnouncementsArgs, getAnnouncementsHandler } from "./getAnnouncements";
import { searchAnnouncementsArgs, searchAnnouncementsHandler } from "./searchAnnouncements";
import { getPinnedAnnouncementsArgs, getPinnedAnnouncementsHandler } from "./getPinnedAnnouncements";
import { getAnnouncementAnalyticsArgs, getAnnouncementAnalyticsHandler } from "./getAnnouncementAnalytics";

export const getAnnouncementById = query({
  args: getAnnouncementByIdArgs,
  handler: getAnnouncementByIdHandler,
});

export const getAnnouncements = query({
  args: getAnnouncementsArgs,
  handler: getAnnouncementsHandler,
});

export const searchAnnouncements = query({
  args: searchAnnouncementsArgs,
  handler: searchAnnouncementsHandler,
});

export const getPinnedAnnouncements = query({
  args: getPinnedAnnouncementsArgs,
  handler: getPinnedAnnouncementsHandler,
});

export const getAnnouncementAnalytics = query({
  args: getAnnouncementAnalyticsArgs,
  handler: getAnnouncementAnalyticsHandler,
});


