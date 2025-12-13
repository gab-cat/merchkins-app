'use node';

import { action } from '../../_generated/server';
import { v } from 'convex/values';
import { internal, api } from '../../_generated/api';
import { r2 } from '../../files/r2';
import { Buffer } from 'buffer';
import { generatePayoutInvoiceReadyEmail } from '../../helpers/emailTemplates/payoutInvoiceReady';
import { generatePaymentConfirmationEmail } from '../../helpers/emailTemplates/paymentConfirmation';
import { sendEmail, getPayoutsFromAddress } from '../../helpers/emailTemplates/mailgunClient';

/**
 * Generate a PDF invoice for a payout and optionally upload to R2
 * Calls the Next.js API route to generate the PDF using @react-pdf/renderer
 */
export const generateInvoicePdf = action({
  args: {
    invoiceId: v.id('payoutInvoices'),
    uploadToR2: v.optional(v.boolean()), // If true, upload to R2 and save URL
  },
  handler: async (ctx, args): Promise<{ success: boolean; pdfBase64?: string; invoiceUrl?: string; error?: string }> => {
    // Get the invoice data
    const invoice = await ctx.runQuery(api.payouts.queries.index.getPayoutInvoiceById, {
      invoiceId: args.invoiceId,
    });

    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    // If invoice already has a URL and we're not forcing regeneration, return it
    if (invoice.invoiceUrl && !args.uploadToR2) {
      return { success: true, invoiceUrl: invoice.invoiceUrl };
    }

    try {
      // Prepare invoice data for the API
      const invoiceData = {
        invoiceNumber: invoice.invoiceNumber,
        organizationInfo: {
          name: invoice.organizationInfo.name,
          slug: invoice.organizationInfo.slug,
          bankDetails: invoice.organizationInfo.bankDetails,
        },
        periodStart: invoice.periodStart,
        periodEnd: invoice.periodEnd,
        grossAmount: invoice.grossAmount,
        platformFeePercentage: invoice.platformFeePercentage,
        platformFeeAmount: invoice.platformFeeAmount,
        netAmount: invoice.netAmount,
        orderCount: invoice.orderCount,
        itemCount: invoice.itemCount,
        status: invoice.status,
        paidAt: invoice.paidAt,
        paidByInfo: invoice.paidByInfo,
        paymentReference: invoice.paymentReference,
        paymentNotes: invoice.paymentNotes,
        createdAt: invoice.createdAt,
        orderSummary: invoice.orderSummary,
      };

      // Get the app URL from environment
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://merchkins.com';
      console.log('appUrl', appUrl);

      // Call the Next.js API route to generate PDF
      const response = await fetch(`${appUrl}/api/invoices/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      // Get PDF as ArrayBuffer
      const pdfArrayBuffer = await response.arrayBuffer();
      const pdfBuffer = Buffer.from(pdfArrayBuffer);
      const pdfBase64 = pdfBuffer.toString('base64');

      // If uploadToR2 is requested, upload the PDF and save the URL
      if (args.uploadToR2) {
        try {
          // Create a Blob from the buffer
          const blob = new Blob([pdfBuffer], { type: 'application/pdf' });

          // Generate a unique key for the PDF
          const pdfKey = `payouts/invoices/${invoice.invoiceNumber}.pdf`;

          // Upload to R2
          const storageKey = await r2.store(ctx, blob, {
            key: pdfKey,
            type: 'application/pdf',
          });

          // Construct the public URL using hardcoded domain
          const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://r2.merchkins.com';
          const invoiceUrl = `${baseUrl.replace(/\/+$/, '')}/${storageKey.replace(/^\/+/, '')}`;

          // Update the invoice with the PDF URL
          await ctx.runMutation(internal.payouts.mutations.index.updateInvoicePdfUrl, {
            invoiceId: args.invoiceId,
            pdfStorageKey: storageKey,
            invoiceUrl: invoiceUrl,
          });

          return { success: true, pdfBase64, invoiceUrl };
        } catch (uploadError) {
          console.error('R2 upload error:', uploadError);
          // Return success with just pdfBase64 if upload fails
          return { success: true, pdfBase64, error: `PDF generated but upload failed: ${(uploadError as Error).message}` };
        }
      }

      return { success: true, pdfBase64 };
    } catch (error) {
      console.error('PDF generation error:', error);
      return { success: false, error: (error as Error).message };
    }
  },
});

/**
 * Send payout invoice email to organization admins
 */
export const sendPayoutInvoiceEmail = action({
  args: {
    invoiceId: v.id('payoutInvoices'),
  },
  handler: async (ctx, args): Promise<{ success: boolean; emailsSent?: number; error?: string }> => {
    // Get the invoice
    const invoice = await ctx.runQuery(api.payouts.queries.index.getPayoutInvoiceById, {
      invoiceId: args.invoiceId,
    });

    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    // Get current organization to check for notificationEmail
    const organization = await ctx.runQuery(api.organizations.queries.index.getOrganizationById, {
      organizationId: invoice.organizationId,
    });

    if (!organization) {
      return { success: false, error: 'Organization not found' };
    }

    // Determine recipient emails: use notificationEmail if set, otherwise fallback to admin emails
    let recipientEmails: string[] = [];

    if (organization.payoutBankDetails?.notificationEmail?.trim()) {
      // Use notification email from bank settings
      recipientEmails = [organization.payoutBankDetails.notificationEmail.trim()];
    } else {
      // Fallback to organization admins
      const orgAdmins = await ctx.runQuery(internal.organizations.queries.index.getOrganizationMembersInternal, {
        organizationId: invoice.organizationId,
        role: 'ADMIN',
        isActive: true,
      });

      if (!orgAdmins || orgAdmins.page.length === 0) {
        return { success: false, error: 'No active admins found for organization and no notification email configured' };
      }

      recipientEmails = orgAdmins.page.map((admin: any) => admin.userInfo.email);
    }

    // Generate email using template
    const emailContent = generatePayoutInvoiceReadyEmail({
      organizationName: invoice.organizationInfo.name,
      invoiceNumber: invoice.invoiceNumber,
      invoiceId: args.invoiceId,
      periodStart: invoice.periodStart,
      periodEnd: invoice.periodEnd,
      grossAmount: invoice.grossAmount,
      platformFeePercentage: invoice.platformFeePercentage,
      platformFeeAmount: invoice.platformFeeAmount,
      netAmount: invoice.netAmount,
      orderCount: invoice.orderCount,
      itemCount: invoice.itemCount,
    });

    // Send email using shared utility
    const result = await sendEmail({
      to: recipientEmails,
      subject: emailContent.subject,
      html: emailContent.html,
      from: getPayoutsFromAddress(),
      fromName: 'Merchkins Payouts',
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Update invoice with email sent timestamp
    await ctx.runMutation(internal.payouts.mutations.index.updateInvoiceEmailSent, {
      invoiceId: args.invoiceId,
      type: 'invoice',
    });

    return { success: true, emailsSent: recipientEmails.length };
  },
});

/**
 * Send payment confirmation email to organization admins
 */
export const sendPaymentConfirmationEmail = action({
  args: {
    invoiceId: v.id('payoutInvoices'),
  },
  handler: async (ctx, args): Promise<{ success: boolean; emailsSent?: number; error?: string }> => {
    // Get the invoice
    const invoice = await ctx.runQuery(api.payouts.queries.index.getPayoutInvoiceById, {
      invoiceId: args.invoiceId,
    });

    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    if (invoice.status !== 'PAID') {
      return { success: false, error: 'Invoice is not marked as paid' };
    }

    // Get current organization to check for notificationEmail
    const organization = await ctx.runQuery(api.organizations.queries.index.getOrganizationById, {
      organizationId: invoice.organizationId,
    });

    if (!organization) {
      return { success: false, error: 'Organization not found' };
    }

    // Determine recipient emails: use notificationEmail if set, otherwise fallback to admin emails
    let recipientEmails: string[] = [];

    if (organization.payoutBankDetails?.notificationEmail?.trim()) {
      // Use notification email from bank settings
      recipientEmails = [organization.payoutBankDetails.notificationEmail.trim()];
    } else {
      // Fallback to organization admins
      const orgAdmins = await ctx.runQuery(internal.organizations.queries.index.getOrganizationMembersInternal, {
        organizationId: invoice.organizationId,
        role: 'ADMIN',
        isActive: true,
      });

      if (!orgAdmins || orgAdmins.page.length === 0) {
        return { success: false, error: 'No active admins found for organization and no notification email configured' };
      }

      recipientEmails = orgAdmins.page.map((admin: any) => admin.userInfo.email);
    }

    // Generate email using template
    const emailContent = generatePaymentConfirmationEmail({
      organizationName: invoice.organizationInfo.name,
      invoiceNumber: invoice.invoiceNumber,
      netAmount: invoice.netAmount,
      paidAt: invoice.paidAt!,
      paymentReference: invoice.paymentReference,
      paymentNotes: invoice.paymentNotes,
    });

    // Send email using shared utility
    const result = await sendEmail({
      to: recipientEmails,
      subject: emailContent.subject,
      html: emailContent.html,
      from: getPayoutsFromAddress(),
      fromName: 'Merchkins Payouts',
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Update invoice with email sent timestamp
    await ctx.runMutation(internal.payouts.mutations.index.updateInvoiceEmailSent, {
      invoiceId: args.invoiceId,
      type: 'payment',
    });

    return { success: true, emailsSent: recipientEmails.length };
  },
});
