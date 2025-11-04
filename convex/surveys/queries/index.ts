import { query } from '../../_generated/server';

import { getSurveyCategoryByIdArgs, getSurveyCategoryByIdHandler } from './surveyCategories';
import { getSurveyCategoriesArgs, getSurveyCategoriesHandler } from './surveyCategories';
import { searchSurveyResponsesArgs, searchSurveyResponsesHandler } from './surveyResponses';
import { getSurveyResponseByIdArgs, getSurveyResponseByIdHandler } from './surveyResponses';
import { getSurveyAnalyticsArgs, getSurveyAnalyticsHandler } from './surveyAnalytics';

export const getSurveyCategoryById = query({ args: getSurveyCategoryByIdArgs, handler: getSurveyCategoryByIdHandler });
export const getSurveyCategories = query({ args: getSurveyCategoriesArgs, handler: getSurveyCategoriesHandler });

export const getSurveyResponseById = query({ args: getSurveyResponseByIdArgs, handler: getSurveyResponseByIdHandler });
export const searchSurveyResponses = query({ args: searchSurveyResponsesArgs, handler: searchSurveyResponsesHandler });

export const getSurveyAnalytics = query({ args: getSurveyAnalyticsArgs, handler: getSurveyAnalyticsHandler });
