/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as announcements_index from "../announcements/index.js";
import type * as announcements_mutations_createAnnouncement from "../announcements/mutations/createAnnouncement.js";
import type * as announcements_mutations_deleteAnnouncement from "../announcements/mutations/deleteAnnouncement.js";
import type * as announcements_mutations_index from "../announcements/mutations/index.js";
import type * as announcements_mutations_manageAcknowledgment from "../announcements/mutations/manageAcknowledgment.js";
import type * as announcements_mutations_restoreAnnouncement from "../announcements/mutations/restoreAnnouncement.js";
import type * as announcements_mutations_updateAnnouncement from "../announcements/mutations/updateAnnouncement.js";
import type * as announcements_mutations_updateAnnouncementStats from "../announcements/mutations/updateAnnouncementStats.js";
import type * as announcements_queries_getAnnouncementAnalytics from "../announcements/queries/getAnnouncementAnalytics.js";
import type * as announcements_queries_getAnnouncementById from "../announcements/queries/getAnnouncementById.js";
import type * as announcements_queries_getAnnouncements from "../announcements/queries/getAnnouncements.js";
import type * as announcements_queries_getPinnedAnnouncements from "../announcements/queries/getPinnedAnnouncements.js";
import type * as announcements_queries_index from "../announcements/queries/index.js";
import type * as announcements_queries_searchAnnouncements from "../announcements/queries/searchAnnouncements.js";
import type * as carts_mutations_addItem from "../carts/mutations/addItem.js";
import type * as carts_mutations_clearCart from "../carts/mutations/clearCart.js";
import type * as carts_mutations_createOrGetCart from "../carts/mutations/createOrGetCart.js";
import type * as carts_mutations_index from "../carts/mutations/index.js";
import type * as carts_mutations_markAbandoned from "../carts/mutations/markAbandoned.js";
import type * as carts_mutations_mergeCarts from "../carts/mutations/mergeCarts.js";
import type * as carts_mutations_removeItem from "../carts/mutations/removeItem.js";
import type * as carts_mutations_setItemNote from "../carts/mutations/setItemNote.js";
import type * as carts_mutations_setItemSelected from "../carts/mutations/setItemSelected.js";
import type * as carts_mutations_updateCartStats from "../carts/mutations/updateCartStats.js";
import type * as carts_mutations_updateItemQuantity from "../carts/mutations/updateItemQuantity.js";
import type * as carts_queries_getAbandonedCarts from "../carts/queries/getAbandonedCarts.js";
import type * as carts_queries_getCartById from "../carts/queries/getCartById.js";
import type * as carts_queries_getCartByUser from "../carts/queries/getCartByUser.js";
import type * as carts_queries_getCartSummary from "../carts/queries/getCartSummary.js";
import type * as carts_queries_index from "../carts/queries/index.js";
import type * as categories_mutations_createCategory from "../categories/mutations/createCategory.js";
import type * as categories_mutations_deleteCategory from "../categories/mutations/deleteCategory.js";
import type * as categories_mutations_index from "../categories/mutations/index.js";
import type * as categories_mutations_restoreCategory from "../categories/mutations/restoreCategory.js";
import type * as categories_mutations_updateCategory from "../categories/mutations/updateCategory.js";
import type * as categories_mutations_updateCategoryStats from "../categories/mutations/updateCategoryStats.js";
import type * as categories_queries_getCategories from "../categories/queries/getCategories.js";
import type * as categories_queries_getCategoryAnalytics from "../categories/queries/getCategoryAnalytics.js";
import type * as categories_queries_getCategoryById from "../categories/queries/getCategoryById.js";
import type * as categories_queries_getCategoryBySlug from "../categories/queries/getCategoryBySlug.js";
import type * as categories_queries_getCategoryHierarchy from "../categories/queries/getCategoryHierarchy.js";
import type * as categories_queries_getPopularCategories from "../categories/queries/getPopularCategories.js";
import type * as categories_queries_index from "../categories/queries/index.js";
import type * as categories_queries_searchCategories from "../categories/queries/searchCategories.js";
import type * as chats_index from "../chats/index.js";
import type * as chats_mutations_createChatRoom from "../chats/mutations/createChatRoom.js";
import type * as chats_mutations_index from "../chats/mutations/index.js";
import type * as chats_mutations_manageMessage from "../chats/mutations/manageMessage.js";
import type * as chats_mutations_manageParticipants from "../chats/mutations/manageParticipants.js";
import type * as chats_mutations_sendMessage from "../chats/mutations/sendMessage.js";
import type * as chats_mutations_updateRoom from "../chats/mutations/updateRoom.js";
import type * as chats_mutations_updateTyping from "../chats/mutations/updateTyping.js";
import type * as chats_queries_getChatRoomById from "../chats/queries/getChatRoomById.js";
import type * as chats_queries_getChatRooms from "../chats/queries/getChatRooms.js";
import type * as chats_queries_getChatRoomsPage from "../chats/queries/getChatRoomsPage.js";
import type * as chats_queries_getMessages from "../chats/queries/getMessages.js";
import type * as chats_queries_getTypingUsers from "../chats/queries/getTypingUsers.js";
import type * as chats_queries_getUnreadCount from "../chats/queries/getUnreadCount.js";
import type * as chats_queries_getUnreadCounts from "../chats/queries/getUnreadCounts.js";
import type * as chats_queries_index from "../chats/queries/index.js";
import type * as chats_queries_searchChats from "../chats/queries/searchChats.js";
import type * as files_actions from "../files/actions.js";
import type * as files_mutations_deleteFile from "../files/mutations/deleteFile.js";
import type * as files_mutations_index from "../files/mutations/index.js";
import type * as files_queries_getFileById from "../files/queries/getFileById.js";
import type * as files_queries_getFilesByEntity from "../files/queries/getFilesByEntity.js";
import type * as files_queries_getFilesByUser from "../files/queries/getFilesByUser.js";
import type * as files_queries_index from "../files/queries/index.js";
import type * as files_r2 from "../files/r2.js";
import type * as helpers_auth from "../helpers/auth.js";
import type * as helpers_index from "../helpers/index.js";
import type * as helpers_organizations from "../helpers/organizations.js";
import type * as helpers_permissions from "../helpers/permissions.js";
import type * as helpers_utils from "../helpers/utils.js";
import type * as helpers_validation from "../helpers/validation.js";
import type * as http from "../http.js";
import type * as logs_index from "../logs/index.js";
import type * as logs_mutations_index from "../logs/mutations/index.js";
import type * as logs_mutations_logArchive from "../logs/mutations/logArchive.js";
import type * as logs_mutations_logCreate from "../logs/mutations/logCreate.js";
import type * as logs_mutations_logDelete from "../logs/mutations/logDelete.js";
import type * as logs_mutations_logRestore from "../logs/mutations/logRestore.js";
import type * as logs_queries_index from "../logs/queries/index.js";
import type * as logs_queries_logById from "../logs/queries/logById.js";
import type * as logs_queries_logsAnalytics from "../logs/queries/logsAnalytics.js";
import type * as logs_queries_logsList from "../logs/queries/logsList.js";
import type * as logs_queries_logsSearch from "../logs/queries/logsSearch.js";
import type * as messages_mutations_createMessage from "../messages/mutations/createMessage.js";
import type * as messages_mutations_deleteMessage from "../messages/mutations/deleteMessage.js";
import type * as messages_mutations_index from "../messages/mutations/index.js";
import type * as messages_mutations_replyToMessage from "../messages/mutations/replyToMessage.js";
import type * as messages_mutations_restoreMessage from "../messages/mutations/restoreMessage.js";
import type * as messages_mutations_updateMessage from "../messages/mutations/updateMessage.js";
import type * as messages_mutations_updateMessageStats from "../messages/mutations/updateMessageStats.js";
import type * as messages_queries_getConversation from "../messages/queries/getConversation.js";
import type * as messages_queries_getMessageAnalytics from "../messages/queries/getMessageAnalytics.js";
import type * as messages_queries_getMessageById from "../messages/queries/getMessageById.js";
import type * as messages_queries_getMessages from "../messages/queries/getMessages.js";
import type * as messages_queries_getMessagesByEmail from "../messages/queries/getMessagesByEmail.js";
import type * as messages_queries_index from "../messages/queries/index.js";
import type * as messages_queries_searchMessages from "../messages/queries/searchMessages.js";
import type * as models_announcements from "../models/announcements.js";
import type * as models_carts from "../models/carts.js";
import type * as models_categories from "../models/categories.js";
import type * as models_chats from "../models/chats.js";
import type * as models_files from "../models/files.js";
import type * as models_logs from "../models/logs.js";
import type * as models_messages from "../models/messages.js";
import type * as models_orders from "../models/orders.js";
import type * as models_organizations from "../models/organizations.js";
import type * as models_payments from "../models/payments.js";
import type * as models_permissions from "../models/permissions.js";
import type * as models_products from "../models/products.js";
import type * as models_surveys from "../models/surveys.js";
import type * as models_tickets from "../models/tickets.js";
import type * as models_users from "../models/users.js";
import type * as orders_mutations_cancelOrder from "../orders/mutations/cancelOrder.js";
import type * as orders_mutations_createOrder from "../orders/mutations/createOrder.js";
import type * as orders_mutations_deleteOrder from "../orders/mutations/deleteOrder.js";
import type * as orders_mutations_index from "../orders/mutations/index.js";
import type * as orders_mutations_restoreOrder from "../orders/mutations/restoreOrder.js";
import type * as orders_mutations_updateOrder from "../orders/mutations/updateOrder.js";
import type * as orders_mutations_updateOrderStats from "../orders/mutations/updateOrderStats.js";
import type * as orders_queries_getOrderAnalytics from "../orders/queries/getOrderAnalytics.js";
import type * as orders_queries_getOrderById from "../orders/queries/getOrderById.js";
import type * as orders_queries_getOrders from "../orders/queries/getOrders.js";
import type * as orders_queries_getOrdersPage from "../orders/queries/getOrdersPage.js";
import type * as orders_queries_index from "../orders/queries/index.js";
import type * as orders_queries_searchOrders from "../orders/queries/searchOrders.js";
import type * as organizations_mutations_addMember from "../organizations/mutations/addMember.js";
import type * as organizations_mutations_createInviteLink from "../organizations/mutations/createInviteLink.js";
import type * as organizations_mutations_createOrganization from "../organizations/mutations/createOrganization.js";
import type * as organizations_mutations_deactivateInviteLink from "../organizations/mutations/deactivateInviteLink.js";
import type * as organizations_mutations_deleteOrganization from "../organizations/mutations/deleteOrganization.js";
import type * as organizations_mutations_index from "../organizations/mutations/index.js";
import type * as organizations_mutations_joinOrganization from "../organizations/mutations/joinOrganization.js";
import type * as organizations_mutations_joinPublicOrganization from "../organizations/mutations/joinPublicOrganization.js";
import type * as organizations_mutations_removeMember from "../organizations/mutations/removeMember.js";
import type * as organizations_mutations_requestToJoinOrganization from "../organizations/mutations/requestToJoinOrganization.js";
import type * as organizations_mutations_reviewJoinRequest from "../organizations/mutations/reviewJoinRequest.js";
import type * as organizations_mutations_updateMemberActivity from "../organizations/mutations/updateMemberActivity.js";
import type * as organizations_mutations_updateMemberRole from "../organizations/mutations/updateMemberRole.js";
import type * as organizations_mutations_updateOrganization from "../organizations/mutations/updateOrganization.js";
import type * as organizations_mutations_updateOrganizationStats from "../organizations/mutations/updateOrganizationStats.js";
import type * as organizations_queries_checkOrganizationPermission from "../organizations/queries/checkOrganizationPermission.js";
import type * as organizations_queries_getInviteLinkByCode from "../organizations/queries/getInviteLinkByCode.js";
import type * as organizations_queries_getOrganizationAnalytics from "../organizations/queries/getOrganizationAnalytics.js";
import type * as organizations_queries_getOrganizationById from "../organizations/queries/getOrganizationById.js";
import type * as organizations_queries_getOrganizationBySlug from "../organizations/queries/getOrganizationBySlug.js";
import type * as organizations_queries_getOrganizationInviteLinks from "../organizations/queries/getOrganizationInviteLinks.js";
import type * as organizations_queries_getOrganizationMembers from "../organizations/queries/getOrganizationMembers.js";
import type * as organizations_queries_getOrganizations from "../organizations/queries/getOrganizations.js";
import type * as organizations_queries_getOrganizationsByUser from "../organizations/queries/getOrganizationsByUser.js";
import type * as organizations_queries_getPopularOrganizations from "../organizations/queries/getPopularOrganizations.js";
import type * as organizations_queries_index from "../organizations/queries/index.js";
import type * as organizations_queries_listJoinRequests from "../organizations/queries/listJoinRequests.js";
import type * as organizations_queries_searchOrganizations from "../organizations/queries/searchOrganizations.js";
import type * as payments_index from "../payments/index.js";
import type * as payments_mutations_createPayment from "../payments/mutations/createPayment.js";
import type * as payments_mutations_deletePayment from "../payments/mutations/deletePayment.js";
import type * as payments_mutations_index from "../payments/mutations/index.js";
import type * as payments_mutations_refundPayment from "../payments/mutations/refundPayment.js";
import type * as payments_mutations_restorePayment from "../payments/mutations/restorePayment.js";
import type * as payments_mutations_updatePayment from "../payments/mutations/updatePayment.js";
import type * as payments_mutations_updatePaymentStats from "../payments/mutations/updatePaymentStats.js";
import type * as payments_queries_getPaymentAnalytics from "../payments/queries/getPaymentAnalytics.js";
import type * as payments_queries_getPaymentById from "../payments/queries/getPaymentById.js";
import type * as payments_queries_getPayments from "../payments/queries/getPayments.js";
import type * as payments_queries_index from "../payments/queries/index.js";
import type * as payments_queries_searchPayments from "../payments/queries/searchPayments.js";
import type * as permissions_mutations_assignOrganizationPermission from "../permissions/mutations/assignOrganizationPermission.js";
import type * as permissions_mutations_assignUserPermission from "../permissions/mutations/assignUserPermission.js";
import type * as permissions_mutations_bulkAssignUserPermissions from "../permissions/mutations/bulkAssignUserPermissions.js";
import type * as permissions_mutations_createPermission from "../permissions/mutations/createPermission.js";
import type * as permissions_mutations_deletePermission from "../permissions/mutations/deletePermission.js";
import type * as permissions_mutations_index from "../permissions/mutations/index.js";
import type * as permissions_mutations_revokeOrganizationPermission from "../permissions/mutations/revokeOrganizationPermission.js";
import type * as permissions_mutations_revokeUserPermission from "../permissions/mutations/revokeUserPermission.js";
import type * as permissions_mutations_updatePermission from "../permissions/mutations/updatePermission.js";
import type * as permissions_queries_checkEntityPermission from "../permissions/queries/checkEntityPermission.js";
import type * as permissions_queries_getOrganizationMemberPermissions from "../permissions/queries/getOrganizationMemberPermissions.js";
import type * as permissions_queries_getPermissionAnalytics from "../permissions/queries/getPermissionAnalytics.js";
import type * as permissions_queries_getPermissionByCode from "../permissions/queries/getPermissionByCode.js";
import type * as permissions_queries_getPermissionById from "../permissions/queries/getPermissionById.js";
import type * as permissions_queries_getPermissionUsageSummary from "../permissions/queries/getPermissionUsageSummary.js";
import type * as permissions_queries_getPermissions from "../permissions/queries/getPermissions.js";
import type * as permissions_queries_getPermissionsByCategory from "../permissions/queries/getPermissionsByCategory.js";
import type * as permissions_queries_getUserPermissions from "../permissions/queries/getUserPermissions.js";
import type * as permissions_queries_index from "../permissions/queries/index.js";
import type * as permissions_queries_searchPermissions from "../permissions/queries/searchPermissions.js";
import type * as products_mutations_bulkOperations from "../products/mutations/bulkOperations.js";
import type * as products_mutations_createProduct from "../products/mutations/createProduct.js";
import type * as products_mutations_deleteProduct from "../products/mutations/deleteProduct.js";
import type * as products_mutations_index from "../products/mutations/index.js";
import type * as products_mutations_manageProductImages from "../products/mutations/manageProductImages.js";
import type * as products_mutations_manageVariants from "../products/mutations/manageVariants.js";
import type * as products_mutations_restoreProduct from "../products/mutations/restoreProduct.js";
import type * as products_mutations_updateProduct from "../products/mutations/updateProduct.js";
import type * as products_mutations_updateProductStats from "../products/mutations/updateProductStats.js";
import type * as products_queries_getPopularProducts from "../products/queries/getPopularProducts.js";
import type * as products_queries_getProductAnalytics from "../products/queries/getProductAnalytics.js";
import type * as products_queries_getProductById from "../products/queries/getProductById.js";
import type * as products_queries_getProductBySlug from "../products/queries/getProductBySlug.js";
import type * as products_queries_getProductRecommendations from "../products/queries/getProductRecommendations.js";
import type * as products_queries_getProducts from "../products/queries/getProducts.js";
import type * as products_queries_index from "../products/queries/index.js";
import type * as products_queries_searchProducts from "../products/queries/searchProducts.js";
import type * as seeds_index from "../seeds/index.js";
import type * as seeds_seedData from "../seeds/seedData.js";
import type * as surveys_index from "../surveys/index.js";
import type * as surveys_mutations_index from "../surveys/mutations/index.js";
import type * as surveys_mutations_manageSurveyCategory from "../surveys/mutations/manageSurveyCategory.js";
import type * as surveys_mutations_markSurveyResponseFollowUp from "../surveys/mutations/markSurveyResponseFollowUp.js";
import type * as surveys_mutations_submitSurveyResponse from "../surveys/mutations/submitSurveyResponse.js";
import type * as surveys_mutations_updateSurveyCategoryStats from "../surveys/mutations/updateSurveyCategoryStats.js";
import type * as surveys_queries_index from "../surveys/queries/index.js";
import type * as surveys_queries_surveyAnalytics from "../surveys/queries/surveyAnalytics.js";
import type * as surveys_queries_surveyCategories from "../surveys/queries/surveyCategories.js";
import type * as surveys_queries_surveyResponses from "../surveys/queries/surveyResponses.js";
import type * as tickets_index from "../tickets/index.js";
import type * as tickets_mutations_createTicket from "../tickets/mutations/createTicket.js";
import type * as tickets_mutations_deleteTicket from "../tickets/mutations/deleteTicket.js";
import type * as tickets_mutations_index from "../tickets/mutations/index.js";
import type * as tickets_mutations_manageAssignee from "../tickets/mutations/manageAssignee.js";
import type * as tickets_mutations_manageReads from "../tickets/mutations/manageReads.js";
import type * as tickets_mutations_manageTicketUpdates from "../tickets/mutations/manageTicketUpdates.js";
import type * as tickets_mutations_restoreTicket from "../tickets/mutations/restoreTicket.js";
import type * as tickets_mutations_updateTicket from "../tickets/mutations/updateTicket.js";
import type * as tickets_mutations_updateTicketStats from "../tickets/mutations/updateTicketStats.js";
import type * as tickets_queries_getTicketAnalytics from "../tickets/queries/getTicketAnalytics.js";
import type * as tickets_queries_getTicketById from "../tickets/queries/getTicketById.js";
import type * as tickets_queries_getTicketUpdates from "../tickets/queries/getTicketUpdates.js";
import type * as tickets_queries_getTickets from "../tickets/queries/getTickets.js";
import type * as tickets_queries_getTicketsPage from "../tickets/queries/getTicketsPage.js";
import type * as tickets_queries_getUnreadCount from "../tickets/queries/getUnreadCount.js";
import type * as tickets_queries_index from "../tickets/queries/index.js";
import type * as tickets_queries_searchTickets from "../tickets/queries/searchTickets.js";
import type * as users_mutations_addOrganizationMembership from "../users/mutations/addOrganizationMembership.js";
import type * as users_mutations_clerkWebhook from "../users/mutations/clerkWebhook.js";
import type * as users_mutations_completeOnboarding from "../users/mutations/completeOnboarding.js";
import type * as users_mutations_deleteUser from "../users/mutations/deleteUser.js";
import type * as users_mutations_index from "../users/mutations/index.js";
import type * as users_mutations_removeOrganizationMembership from "../users/mutations/removeOrganizationMembership.js";
import type * as users_mutations_restoreUser from "../users/mutations/restoreUser.js";
import type * as users_mutations_updateLastLogin from "../users/mutations/updateLastLogin.js";
import type * as users_mutations_updateOrderStats from "../users/mutations/updateOrderStats.js";
import type * as users_mutations_updatePreferences from "../users/mutations/updatePreferences.js";
import type * as users_mutations_updateProfile from "../users/mutations/updateProfile.js";
import type * as users_mutations_updateUserPermissions from "../users/mutations/updateUserPermissions.js";
import type * as users_mutations_updateUserRole from "../users/mutations/updateUserRole.js";
import type * as users_queries_checkUserPermission from "../users/queries/checkUserPermission.js";
import type * as users_queries_getCurrentUser from "../users/queries/getCurrentUser.js";
import type * as users_queries_getRecentlyActiveUsers from "../users/queries/getRecentlyActiveUsers.js";
import type * as users_queries_getUserAnalytics from "../users/queries/getUserAnalytics.js";
import type * as users_queries_getUserByEmail from "../users/queries/getUserByEmail.js";
import type * as users_queries_getUserById from "../users/queries/getUserById.js";
import type * as users_queries_getUsers from "../users/queries/getUsers.js";
import type * as users_queries_getUsersByManager from "../users/queries/getUsersByManager.js";
import type * as users_queries_getUsersByOrganization from "../users/queries/getUsersByOrganization.js";
import type * as users_queries_index from "../users/queries/index.js";
import type * as users_queries_searchUsers from "../users/queries/searchUsers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "announcements/index": typeof announcements_index;
  "announcements/mutations/createAnnouncement": typeof announcements_mutations_createAnnouncement;
  "announcements/mutations/deleteAnnouncement": typeof announcements_mutations_deleteAnnouncement;
  "announcements/mutations/index": typeof announcements_mutations_index;
  "announcements/mutations/manageAcknowledgment": typeof announcements_mutations_manageAcknowledgment;
  "announcements/mutations/restoreAnnouncement": typeof announcements_mutations_restoreAnnouncement;
  "announcements/mutations/updateAnnouncement": typeof announcements_mutations_updateAnnouncement;
  "announcements/mutations/updateAnnouncementStats": typeof announcements_mutations_updateAnnouncementStats;
  "announcements/queries/getAnnouncementAnalytics": typeof announcements_queries_getAnnouncementAnalytics;
  "announcements/queries/getAnnouncementById": typeof announcements_queries_getAnnouncementById;
  "announcements/queries/getAnnouncements": typeof announcements_queries_getAnnouncements;
  "announcements/queries/getPinnedAnnouncements": typeof announcements_queries_getPinnedAnnouncements;
  "announcements/queries/index": typeof announcements_queries_index;
  "announcements/queries/searchAnnouncements": typeof announcements_queries_searchAnnouncements;
  "carts/mutations/addItem": typeof carts_mutations_addItem;
  "carts/mutations/clearCart": typeof carts_mutations_clearCart;
  "carts/mutations/createOrGetCart": typeof carts_mutations_createOrGetCart;
  "carts/mutations/index": typeof carts_mutations_index;
  "carts/mutations/markAbandoned": typeof carts_mutations_markAbandoned;
  "carts/mutations/mergeCarts": typeof carts_mutations_mergeCarts;
  "carts/mutations/removeItem": typeof carts_mutations_removeItem;
  "carts/mutations/setItemNote": typeof carts_mutations_setItemNote;
  "carts/mutations/setItemSelected": typeof carts_mutations_setItemSelected;
  "carts/mutations/updateCartStats": typeof carts_mutations_updateCartStats;
  "carts/mutations/updateItemQuantity": typeof carts_mutations_updateItemQuantity;
  "carts/queries/getAbandonedCarts": typeof carts_queries_getAbandonedCarts;
  "carts/queries/getCartById": typeof carts_queries_getCartById;
  "carts/queries/getCartByUser": typeof carts_queries_getCartByUser;
  "carts/queries/getCartSummary": typeof carts_queries_getCartSummary;
  "carts/queries/index": typeof carts_queries_index;
  "categories/mutations/createCategory": typeof categories_mutations_createCategory;
  "categories/mutations/deleteCategory": typeof categories_mutations_deleteCategory;
  "categories/mutations/index": typeof categories_mutations_index;
  "categories/mutations/restoreCategory": typeof categories_mutations_restoreCategory;
  "categories/mutations/updateCategory": typeof categories_mutations_updateCategory;
  "categories/mutations/updateCategoryStats": typeof categories_mutations_updateCategoryStats;
  "categories/queries/getCategories": typeof categories_queries_getCategories;
  "categories/queries/getCategoryAnalytics": typeof categories_queries_getCategoryAnalytics;
  "categories/queries/getCategoryById": typeof categories_queries_getCategoryById;
  "categories/queries/getCategoryBySlug": typeof categories_queries_getCategoryBySlug;
  "categories/queries/getCategoryHierarchy": typeof categories_queries_getCategoryHierarchy;
  "categories/queries/getPopularCategories": typeof categories_queries_getPopularCategories;
  "categories/queries/index": typeof categories_queries_index;
  "categories/queries/searchCategories": typeof categories_queries_searchCategories;
  "chats/index": typeof chats_index;
  "chats/mutations/createChatRoom": typeof chats_mutations_createChatRoom;
  "chats/mutations/index": typeof chats_mutations_index;
  "chats/mutations/manageMessage": typeof chats_mutations_manageMessage;
  "chats/mutations/manageParticipants": typeof chats_mutations_manageParticipants;
  "chats/mutations/sendMessage": typeof chats_mutations_sendMessage;
  "chats/mutations/updateRoom": typeof chats_mutations_updateRoom;
  "chats/mutations/updateTyping": typeof chats_mutations_updateTyping;
  "chats/queries/getChatRoomById": typeof chats_queries_getChatRoomById;
  "chats/queries/getChatRooms": typeof chats_queries_getChatRooms;
  "chats/queries/getChatRoomsPage": typeof chats_queries_getChatRoomsPage;
  "chats/queries/getMessages": typeof chats_queries_getMessages;
  "chats/queries/getTypingUsers": typeof chats_queries_getTypingUsers;
  "chats/queries/getUnreadCount": typeof chats_queries_getUnreadCount;
  "chats/queries/getUnreadCounts": typeof chats_queries_getUnreadCounts;
  "chats/queries/index": typeof chats_queries_index;
  "chats/queries/searchChats": typeof chats_queries_searchChats;
  "files/actions": typeof files_actions;
  "files/mutations/deleteFile": typeof files_mutations_deleteFile;
  "files/mutations/index": typeof files_mutations_index;
  "files/queries/getFileById": typeof files_queries_getFileById;
  "files/queries/getFilesByEntity": typeof files_queries_getFilesByEntity;
  "files/queries/getFilesByUser": typeof files_queries_getFilesByUser;
  "files/queries/index": typeof files_queries_index;
  "files/r2": typeof files_r2;
  "helpers/auth": typeof helpers_auth;
  "helpers/index": typeof helpers_index;
  "helpers/organizations": typeof helpers_organizations;
  "helpers/permissions": typeof helpers_permissions;
  "helpers/utils": typeof helpers_utils;
  "helpers/validation": typeof helpers_validation;
  http: typeof http;
  "logs/index": typeof logs_index;
  "logs/mutations/index": typeof logs_mutations_index;
  "logs/mutations/logArchive": typeof logs_mutations_logArchive;
  "logs/mutations/logCreate": typeof logs_mutations_logCreate;
  "logs/mutations/logDelete": typeof logs_mutations_logDelete;
  "logs/mutations/logRestore": typeof logs_mutations_logRestore;
  "logs/queries/index": typeof logs_queries_index;
  "logs/queries/logById": typeof logs_queries_logById;
  "logs/queries/logsAnalytics": typeof logs_queries_logsAnalytics;
  "logs/queries/logsList": typeof logs_queries_logsList;
  "logs/queries/logsSearch": typeof logs_queries_logsSearch;
  "messages/mutations/createMessage": typeof messages_mutations_createMessage;
  "messages/mutations/deleteMessage": typeof messages_mutations_deleteMessage;
  "messages/mutations/index": typeof messages_mutations_index;
  "messages/mutations/replyToMessage": typeof messages_mutations_replyToMessage;
  "messages/mutations/restoreMessage": typeof messages_mutations_restoreMessage;
  "messages/mutations/updateMessage": typeof messages_mutations_updateMessage;
  "messages/mutations/updateMessageStats": typeof messages_mutations_updateMessageStats;
  "messages/queries/getConversation": typeof messages_queries_getConversation;
  "messages/queries/getMessageAnalytics": typeof messages_queries_getMessageAnalytics;
  "messages/queries/getMessageById": typeof messages_queries_getMessageById;
  "messages/queries/getMessages": typeof messages_queries_getMessages;
  "messages/queries/getMessagesByEmail": typeof messages_queries_getMessagesByEmail;
  "messages/queries/index": typeof messages_queries_index;
  "messages/queries/searchMessages": typeof messages_queries_searchMessages;
  "models/announcements": typeof models_announcements;
  "models/carts": typeof models_carts;
  "models/categories": typeof models_categories;
  "models/chats": typeof models_chats;
  "models/files": typeof models_files;
  "models/logs": typeof models_logs;
  "models/messages": typeof models_messages;
  "models/orders": typeof models_orders;
  "models/organizations": typeof models_organizations;
  "models/payments": typeof models_payments;
  "models/permissions": typeof models_permissions;
  "models/products": typeof models_products;
  "models/surveys": typeof models_surveys;
  "models/tickets": typeof models_tickets;
  "models/users": typeof models_users;
  "orders/mutations/cancelOrder": typeof orders_mutations_cancelOrder;
  "orders/mutations/createOrder": typeof orders_mutations_createOrder;
  "orders/mutations/deleteOrder": typeof orders_mutations_deleteOrder;
  "orders/mutations/index": typeof orders_mutations_index;
  "orders/mutations/restoreOrder": typeof orders_mutations_restoreOrder;
  "orders/mutations/updateOrder": typeof orders_mutations_updateOrder;
  "orders/mutations/updateOrderStats": typeof orders_mutations_updateOrderStats;
  "orders/queries/getOrderAnalytics": typeof orders_queries_getOrderAnalytics;
  "orders/queries/getOrderById": typeof orders_queries_getOrderById;
  "orders/queries/getOrders": typeof orders_queries_getOrders;
  "orders/queries/getOrdersPage": typeof orders_queries_getOrdersPage;
  "orders/queries/index": typeof orders_queries_index;
  "orders/queries/searchOrders": typeof orders_queries_searchOrders;
  "organizations/mutations/addMember": typeof organizations_mutations_addMember;
  "organizations/mutations/createInviteLink": typeof organizations_mutations_createInviteLink;
  "organizations/mutations/createOrganization": typeof organizations_mutations_createOrganization;
  "organizations/mutations/deactivateInviteLink": typeof organizations_mutations_deactivateInviteLink;
  "organizations/mutations/deleteOrganization": typeof organizations_mutations_deleteOrganization;
  "organizations/mutations/index": typeof organizations_mutations_index;
  "organizations/mutations/joinOrganization": typeof organizations_mutations_joinOrganization;
  "organizations/mutations/joinPublicOrganization": typeof organizations_mutations_joinPublicOrganization;
  "organizations/mutations/removeMember": typeof organizations_mutations_removeMember;
  "organizations/mutations/requestToJoinOrganization": typeof organizations_mutations_requestToJoinOrganization;
  "organizations/mutations/reviewJoinRequest": typeof organizations_mutations_reviewJoinRequest;
  "organizations/mutations/updateMemberActivity": typeof organizations_mutations_updateMemberActivity;
  "organizations/mutations/updateMemberRole": typeof organizations_mutations_updateMemberRole;
  "organizations/mutations/updateOrganization": typeof organizations_mutations_updateOrganization;
  "organizations/mutations/updateOrganizationStats": typeof organizations_mutations_updateOrganizationStats;
  "organizations/queries/checkOrganizationPermission": typeof organizations_queries_checkOrganizationPermission;
  "organizations/queries/getInviteLinkByCode": typeof organizations_queries_getInviteLinkByCode;
  "organizations/queries/getOrganizationAnalytics": typeof organizations_queries_getOrganizationAnalytics;
  "organizations/queries/getOrganizationById": typeof organizations_queries_getOrganizationById;
  "organizations/queries/getOrganizationBySlug": typeof organizations_queries_getOrganizationBySlug;
  "organizations/queries/getOrganizationInviteLinks": typeof organizations_queries_getOrganizationInviteLinks;
  "organizations/queries/getOrganizationMembers": typeof organizations_queries_getOrganizationMembers;
  "organizations/queries/getOrganizations": typeof organizations_queries_getOrganizations;
  "organizations/queries/getOrganizationsByUser": typeof organizations_queries_getOrganizationsByUser;
  "organizations/queries/getPopularOrganizations": typeof organizations_queries_getPopularOrganizations;
  "organizations/queries/index": typeof organizations_queries_index;
  "organizations/queries/listJoinRequests": typeof organizations_queries_listJoinRequests;
  "organizations/queries/searchOrganizations": typeof organizations_queries_searchOrganizations;
  "payments/index": typeof payments_index;
  "payments/mutations/createPayment": typeof payments_mutations_createPayment;
  "payments/mutations/deletePayment": typeof payments_mutations_deletePayment;
  "payments/mutations/index": typeof payments_mutations_index;
  "payments/mutations/refundPayment": typeof payments_mutations_refundPayment;
  "payments/mutations/restorePayment": typeof payments_mutations_restorePayment;
  "payments/mutations/updatePayment": typeof payments_mutations_updatePayment;
  "payments/mutations/updatePaymentStats": typeof payments_mutations_updatePaymentStats;
  "payments/queries/getPaymentAnalytics": typeof payments_queries_getPaymentAnalytics;
  "payments/queries/getPaymentById": typeof payments_queries_getPaymentById;
  "payments/queries/getPayments": typeof payments_queries_getPayments;
  "payments/queries/index": typeof payments_queries_index;
  "payments/queries/searchPayments": typeof payments_queries_searchPayments;
  "permissions/mutations/assignOrganizationPermission": typeof permissions_mutations_assignOrganizationPermission;
  "permissions/mutations/assignUserPermission": typeof permissions_mutations_assignUserPermission;
  "permissions/mutations/bulkAssignUserPermissions": typeof permissions_mutations_bulkAssignUserPermissions;
  "permissions/mutations/createPermission": typeof permissions_mutations_createPermission;
  "permissions/mutations/deletePermission": typeof permissions_mutations_deletePermission;
  "permissions/mutations/index": typeof permissions_mutations_index;
  "permissions/mutations/revokeOrganizationPermission": typeof permissions_mutations_revokeOrganizationPermission;
  "permissions/mutations/revokeUserPermission": typeof permissions_mutations_revokeUserPermission;
  "permissions/mutations/updatePermission": typeof permissions_mutations_updatePermission;
  "permissions/queries/checkEntityPermission": typeof permissions_queries_checkEntityPermission;
  "permissions/queries/getOrganizationMemberPermissions": typeof permissions_queries_getOrganizationMemberPermissions;
  "permissions/queries/getPermissionAnalytics": typeof permissions_queries_getPermissionAnalytics;
  "permissions/queries/getPermissionByCode": typeof permissions_queries_getPermissionByCode;
  "permissions/queries/getPermissionById": typeof permissions_queries_getPermissionById;
  "permissions/queries/getPermissionUsageSummary": typeof permissions_queries_getPermissionUsageSummary;
  "permissions/queries/getPermissions": typeof permissions_queries_getPermissions;
  "permissions/queries/getPermissionsByCategory": typeof permissions_queries_getPermissionsByCategory;
  "permissions/queries/getUserPermissions": typeof permissions_queries_getUserPermissions;
  "permissions/queries/index": typeof permissions_queries_index;
  "permissions/queries/searchPermissions": typeof permissions_queries_searchPermissions;
  "products/mutations/bulkOperations": typeof products_mutations_bulkOperations;
  "products/mutations/createProduct": typeof products_mutations_createProduct;
  "products/mutations/deleteProduct": typeof products_mutations_deleteProduct;
  "products/mutations/index": typeof products_mutations_index;
  "products/mutations/manageProductImages": typeof products_mutations_manageProductImages;
  "products/mutations/manageVariants": typeof products_mutations_manageVariants;
  "products/mutations/restoreProduct": typeof products_mutations_restoreProduct;
  "products/mutations/updateProduct": typeof products_mutations_updateProduct;
  "products/mutations/updateProductStats": typeof products_mutations_updateProductStats;
  "products/queries/getPopularProducts": typeof products_queries_getPopularProducts;
  "products/queries/getProductAnalytics": typeof products_queries_getProductAnalytics;
  "products/queries/getProductById": typeof products_queries_getProductById;
  "products/queries/getProductBySlug": typeof products_queries_getProductBySlug;
  "products/queries/getProductRecommendations": typeof products_queries_getProductRecommendations;
  "products/queries/getProducts": typeof products_queries_getProducts;
  "products/queries/index": typeof products_queries_index;
  "products/queries/searchProducts": typeof products_queries_searchProducts;
  "seeds/index": typeof seeds_index;
  "seeds/seedData": typeof seeds_seedData;
  "surveys/index": typeof surveys_index;
  "surveys/mutations/index": typeof surveys_mutations_index;
  "surveys/mutations/manageSurveyCategory": typeof surveys_mutations_manageSurveyCategory;
  "surveys/mutations/markSurveyResponseFollowUp": typeof surveys_mutations_markSurveyResponseFollowUp;
  "surveys/mutations/submitSurveyResponse": typeof surveys_mutations_submitSurveyResponse;
  "surveys/mutations/updateSurveyCategoryStats": typeof surveys_mutations_updateSurveyCategoryStats;
  "surveys/queries/index": typeof surveys_queries_index;
  "surveys/queries/surveyAnalytics": typeof surveys_queries_surveyAnalytics;
  "surveys/queries/surveyCategories": typeof surveys_queries_surveyCategories;
  "surveys/queries/surveyResponses": typeof surveys_queries_surveyResponses;
  "tickets/index": typeof tickets_index;
  "tickets/mutations/createTicket": typeof tickets_mutations_createTicket;
  "tickets/mutations/deleteTicket": typeof tickets_mutations_deleteTicket;
  "tickets/mutations/index": typeof tickets_mutations_index;
  "tickets/mutations/manageAssignee": typeof tickets_mutations_manageAssignee;
  "tickets/mutations/manageReads": typeof tickets_mutations_manageReads;
  "tickets/mutations/manageTicketUpdates": typeof tickets_mutations_manageTicketUpdates;
  "tickets/mutations/restoreTicket": typeof tickets_mutations_restoreTicket;
  "tickets/mutations/updateTicket": typeof tickets_mutations_updateTicket;
  "tickets/mutations/updateTicketStats": typeof tickets_mutations_updateTicketStats;
  "tickets/queries/getTicketAnalytics": typeof tickets_queries_getTicketAnalytics;
  "tickets/queries/getTicketById": typeof tickets_queries_getTicketById;
  "tickets/queries/getTicketUpdates": typeof tickets_queries_getTicketUpdates;
  "tickets/queries/getTickets": typeof tickets_queries_getTickets;
  "tickets/queries/getTicketsPage": typeof tickets_queries_getTicketsPage;
  "tickets/queries/getUnreadCount": typeof tickets_queries_getUnreadCount;
  "tickets/queries/index": typeof tickets_queries_index;
  "tickets/queries/searchTickets": typeof tickets_queries_searchTickets;
  "users/mutations/addOrganizationMembership": typeof users_mutations_addOrganizationMembership;
  "users/mutations/clerkWebhook": typeof users_mutations_clerkWebhook;
  "users/mutations/completeOnboarding": typeof users_mutations_completeOnboarding;
  "users/mutations/deleteUser": typeof users_mutations_deleteUser;
  "users/mutations/index": typeof users_mutations_index;
  "users/mutations/removeOrganizationMembership": typeof users_mutations_removeOrganizationMembership;
  "users/mutations/restoreUser": typeof users_mutations_restoreUser;
  "users/mutations/updateLastLogin": typeof users_mutations_updateLastLogin;
  "users/mutations/updateOrderStats": typeof users_mutations_updateOrderStats;
  "users/mutations/updatePreferences": typeof users_mutations_updatePreferences;
  "users/mutations/updateProfile": typeof users_mutations_updateProfile;
  "users/mutations/updateUserPermissions": typeof users_mutations_updateUserPermissions;
  "users/mutations/updateUserRole": typeof users_mutations_updateUserRole;
  "users/queries/checkUserPermission": typeof users_queries_checkUserPermission;
  "users/queries/getCurrentUser": typeof users_queries_getCurrentUser;
  "users/queries/getRecentlyActiveUsers": typeof users_queries_getRecentlyActiveUsers;
  "users/queries/getUserAnalytics": typeof users_queries_getUserAnalytics;
  "users/queries/getUserByEmail": typeof users_queries_getUserByEmail;
  "users/queries/getUserById": typeof users_queries_getUserById;
  "users/queries/getUsers": typeof users_queries_getUsers;
  "users/queries/getUsersByManager": typeof users_queries_getUsersByManager;
  "users/queries/getUsersByOrganization": typeof users_queries_getUsersByOrganization;
  "users/queries/index": typeof users_queries_index;
  "users/queries/searchUsers": typeof users_queries_searchUsers;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  r2: {
    lib: {
      deleteMetadata: FunctionReference<
        "mutation",
        "internal",
        { bucket: string; key: string },
        null
      >;
      deleteObject: FunctionReference<
        "mutation",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          secretAccessKey: string;
        },
        null
      >;
      deleteR2Object: FunctionReference<
        "action",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          secretAccessKey: string;
        },
        null
      >;
      getMetadata: FunctionReference<
        "query",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          secretAccessKey: string;
        },
        {
          bucket: string;
          bucketLink: string;
          contentType?: string;
          key: string;
          lastModified: string;
          link: string;
          sha256?: string;
          size?: number;
          url: string;
        } | null
      >;
      listMetadata: FunctionReference<
        "query",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          cursor?: string;
          endpoint: string;
          limit?: number;
          secretAccessKey: string;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            bucket: string;
            bucketLink: string;
            contentType?: string;
            key: string;
            lastModified: string;
            link: string;
            sha256?: string;
            size?: number;
            url: string;
          }>;
          pageStatus?: null | "SplitRecommended" | "SplitRequired";
          splitCursor?: null | string;
        }
      >;
      store: FunctionReference<
        "action",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          secretAccessKey: string;
          url: string;
        },
        any
      >;
      syncMetadata: FunctionReference<
        "action",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          onComplete?: string;
          secretAccessKey: string;
        },
        null
      >;
      upsertMetadata: FunctionReference<
        "mutation",
        "internal",
        {
          bucket: string;
          contentType?: string;
          key: string;
          lastModified: string;
          link: string;
          sha256?: string;
          size?: number;
        },
        { isNew: boolean }
      >;
    };
  };
};
