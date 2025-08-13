import { mutation, internalMutation } from "../../_generated/server";

import { createSurveyCategoryArgs, createSurveyCategoryHandler } from "./manageSurveyCategory";
import { updateSurveyCategoryArgs, updateSurveyCategoryHandler } from "./manageSurveyCategory";
import { deleteSurveyCategoryArgs, deleteSurveyCategoryHandler } from "./manageSurveyCategory";
import { restoreSurveyCategoryArgs, restoreSurveyCategoryHandler } from "./manageSurveyCategory";
import { updateSurveyCategoryStatsArgs, updateSurveyCategoryStatsHandler } from "./updateSurveyCategoryStats";
import { submitSurveyResponseArgs, submitSurveyResponseHandler } from "./submitSurveyResponse";
import { markSurveyResponseFollowUpArgs, markSurveyResponseFollowUpHandler } from "./markSurveyResponseFollowUp";

export const createSurveyCategory = mutation({ args: createSurveyCategoryArgs, handler: createSurveyCategoryHandler });
export const updateSurveyCategory = mutation({ args: updateSurveyCategoryArgs, handler: updateSurveyCategoryHandler });
export const deleteSurveyCategory = mutation({ args: deleteSurveyCategoryArgs, handler: deleteSurveyCategoryHandler });
export const restoreSurveyCategory = mutation({ args: restoreSurveyCategoryArgs, handler: restoreSurveyCategoryHandler });

export const submitSurveyResponse = mutation({ args: submitSurveyResponseArgs, handler: submitSurveyResponseHandler });
export const markSurveyResponseFollowUp = mutation({ args: markSurveyResponseFollowUpArgs, handler: markSurveyResponseFollowUpHandler });

export const updateSurveyCategoryStats = internalMutation({ args: updateSurveyCategoryStatsArgs, handler: updateSurveyCategoryStatsHandler });


