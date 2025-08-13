import { mutation, internalMutation } from "../../_generated/server";

import { createAnnouncementArgs, createAnnouncementHandler } from "./createAnnouncement";
import { updateAnnouncementArgs, updateAnnouncementHandler } from "./updateAnnouncement";
import { deleteAnnouncementArgs, deleteAnnouncementHandler } from "./deleteAnnouncement";
import { restoreAnnouncementArgs, restoreAnnouncementHandler } from "./restoreAnnouncement";
import { acknowledgeAnnouncementArgs, acknowledgeAnnouncementHandler } from "./manageAcknowledgment";
import { updateAnnouncementStatsArgs, updateAnnouncementStatsHandler } from "./updateAnnouncementStats";

export const createAnnouncement = mutation({
  args: createAnnouncementArgs,
  handler: createAnnouncementHandler,
});

export const updateAnnouncement = mutation({
  args: updateAnnouncementArgs,
  handler: updateAnnouncementHandler,
});

export const deleteAnnouncement = mutation({
  args: deleteAnnouncementArgs,
  handler: deleteAnnouncementHandler,
});

export const restoreAnnouncement = mutation({
  args: restoreAnnouncementArgs,
  handler: restoreAnnouncementHandler,
});

export const acknowledgeAnnouncement = mutation({
  args: acknowledgeAnnouncementArgs,
  handler: acknowledgeAnnouncementHandler,
});

export const updateAnnouncementStats = internalMutation({
  args: updateAnnouncementStatsArgs,
  handler: updateAnnouncementStatsHandler,
});


