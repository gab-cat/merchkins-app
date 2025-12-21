// Chatwoot Order Flow - Index
// Re-exports all order flow modules for easy imports

// Session management
export { getActiveSession, getUserByContact, createSession, updateSession } from './sessionManager';

// Order flow start
export { startOrderFlow } from './startOrderFlow';

// Order step handlers
export { handleVariantSelection, handleSizeSelection, handleQuantityInput, handleNotesInput } from './orderStepHandlers';

// Email handlers
export { handleEmailInput, handleOTPVerification } from './emailHandlers';

// Email verification
export { createVerificationCode, verifyCode, getOrCreateUser } from './emailVerification';

// Email sending action
export { sendOTPEmail } from './sendOTPEmail';

// Order completion
export { completeOrder } from './completeOrder';

// Order creation
export { createMessengerOrder } from './createMessengerOrder';
