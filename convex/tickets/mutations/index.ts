import { internalMutation, mutation } from "../../_generated/server";

import { createTicketArgs, createTicketHandler } from "./createTicket";
import { updateTicketArgs, updateTicketHandler } from "./updateTicket";
import { deleteTicketArgs, deleteTicketHandler } from "./deleteTicket";
import { restoreTicketArgs, restoreTicketHandler } from "./restoreTicket";
import { updateTicketStatsArgs, updateTicketStatsHandler } from "./updateTicketStats";
import { addTicketUpdateArgs, addTicketUpdateHandler } from "./manageTicketUpdates";
import { assignTicketArgs, assignTicketHandler } from "./manageAssignee";

export const createTicket = mutation({ args: createTicketArgs, handler: createTicketHandler });
export const updateTicket = mutation({ args: updateTicketArgs, handler: updateTicketHandler });
export const deleteTicket = mutation({ args: deleteTicketArgs, handler: deleteTicketHandler });
export const restoreTicket = mutation({ args: restoreTicketArgs, handler: restoreTicketHandler });

export const addTicketUpdate = mutation({ args: addTicketUpdateArgs, handler: addTicketUpdateHandler });
export const assignTicket = mutation({ args: assignTicketArgs, handler: assignTicketHandler });

export const updateTicketStats = internalMutation({ args: updateTicketStatsArgs, handler: updateTicketStatsHandler });



