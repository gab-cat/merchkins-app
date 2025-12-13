import { ActionCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { api, internal } from '../../_generated/api';
import { generateRefundRequestReceivedEmail } from '../../helpers/emailTemplates/refundRequestReceived';
import { generateRefundApprovedEmail } from '../../helpers/emailTemplates/refundApproved';
import { generateRefundRejectedEmail } from '../../helpers/emailTemplates/refundRejected';
import { sendEmail, getSupportFromAddress } from '../../helpers/emailTemplates/mailgunClient';

export const sendRefundRequestEmailArgs = {
  refundRequestId: v.id('refundRequests'),
  type: v.union(v.literal('REQUEST_RECEIVED'), v.literal('APPROVED'), v.literal('REJECTED')),
} as const;

export const sendRefundRequestEmailHandler = async (
  ctx: ActionCtx,
  args: { refundRequestId: Id<'refundRequests'>; type: 'REQUEST_RECEIVED' | 'APPROVED' | 'REJECTED' }
): Promise<{ success: boolean; error?: string }> => {
  // Fetch refund request data
  const refundRequest = await ctx.runQuery(internal.refundRequests.queries.index.getRefundRequestByIdInternal, {
    refundRequestId: args.refundRequestId,
  });

  if (!refundRequest) {
    return { success: false, error: 'Refund request not found' };
  }

  let subject: string;
  let html: string;
  let recipientEmail: string;

  if (args.type === 'REQUEST_RECEIVED') {
    // Email to org admins
    const orgAdminsResult = await ctx.runQuery(internal.organizations.queries.index.getOrganizationMembersInternal, {
      organizationId: refundRequest.organizationId,
      role: 'ADMIN',
      isActive: true,
    });

    if (!orgAdminsResult || !orgAdminsResult.page || orgAdminsResult.page.length === 0) {
      return { success: false, error: 'No active admins found' };
    }

    const adminEmails = orgAdminsResult.page.map((admin: any) => admin.userInfo?.email).filter(Boolean);
    if (adminEmails.length === 0) {
      return { success: false, error: 'No admin emails found' };
    }
    recipientEmail = adminEmails[0];

    // Generate email using template
    const emailContent = generateRefundRequestReceivedEmail({
      orderNumber: refundRequest.orderInfo.orderNumber ?? 'N/A',
      orderDate: refundRequest.orderInfo.orderDate,
      refundAmount: refundRequest.refundAmount,
      customerFirstName: refundRequest.customerInfo.firstName ?? '',
      customerLastName: refundRequest.customerInfo.lastName ?? '',
      customerEmail: refundRequest.customerInfo.email,
      reason: refundRequest.reason,
      customerMessage: refundRequest.customerMessage,
    });
    subject = emailContent.subject;
    html = emailContent.html;
  } else if (args.type === 'APPROVED') {
    // Email to customer
    recipientEmail = refundRequest.customerInfo.email;
    const voucher = refundRequest.voucher;

    if (!voucher) {
      return { success: false, error: 'Voucher not found' };
    }

    // Generate email using template
    const emailContent = generateRefundApprovedEmail({
      customerFirstName: refundRequest.customerInfo.firstName ?? 'Customer',
      orderNumber: refundRequest.orderInfo.orderNumber ?? 'N/A',
      refundAmount: refundRequest.refundAmount,
      voucherCode: voucher.code,
      adminMessage: refundRequest.adminMessage,
    });
    subject = emailContent.subject;
    html = emailContent.html;
  } else {
    // REJECTED - Email to customer
    recipientEmail = refundRequest.customerInfo.email;

    // Generate email using template
    const emailContent = generateRefundRejectedEmail({
      customerFirstName: refundRequest.customerInfo.firstName ?? 'Customer',
      orderNumber: refundRequest.orderInfo.orderNumber ?? 'N/A',
      orderDate: refundRequest.orderInfo.orderDate,
      refundAmount: refundRequest.refundAmount,
      adminMessage: refundRequest.adminMessage,
    });
    subject = emailContent.subject;
    html = emailContent.html;
  }

  // Send email using shared utility
  const result = await sendEmail({
    to: recipientEmail,
    subject,
    html,
    from: getSupportFromAddress(),
    fromName: 'Merchkins Support',
  });

  return result;
};
