'use node';

import { action } from '../../_generated/server';
import { v } from 'convex/values';
import { internal, api } from '../../_generated/api';
import { r2 } from '../../files/r2';
import { PDFDocument, StandardFonts, rgb, PDFImage } from 'pdf-lib';
import { formatCurrency } from '../../helpers';
import { Buffer } from 'buffer';

/**
 * Generate a PDF invoice for a payout and optionally upload to R2
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
      // Format currency helper for PDF (using "PHP" instead of "₱" to avoid WinAnsi encoding issues)
      const formatCurrencyPdf = (amount: number) => `PHP ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      // Format date helper
      const formatDate = (timestamp: number) =>
        new Date(timestamp).toLocaleDateString('en-PH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

      // Primary brand color: #1d43d8 -> RGB(29, 67, 216) -> normalized RGB(0.114, 0.263, 0.847)
      const primaryColor = rgb(29 / 255, 67 / 255, 216 / 255);

      // Create PDF document using pdf-lib
      const pdfDoc = await PDFDocument.create();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Embed Merchkins logo
      let logoImage: PDFImage | null = null;
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com';
        const logoUrl = `${appUrl}/favicon.ico`;
        const logoResponse = await fetch(logoUrl);
        if (logoResponse.ok) {
          const logoBytes = await logoResponse.arrayBuffer();
          // Try to embed as PNG first, fallback to other formats
          try {
            logoImage = await pdfDoc.embedPng(logoBytes);
          } catch {
            try {
              logoImage = await pdfDoc.embedJpg(logoBytes);
            } catch {
              console.warn('Could not embed logo image');
            }
          }
        }
      } catch (logoError) {
        console.warn('Failed to fetch logo:', logoError);
      }

      // A4 size: 595.28 x 841.89 points
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 50;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      // Helper functions (defined before use)
      const drawText = (
        text: string,
        x: number,
        yPos: number,
        options: { font?: typeof helveticaFont; size?: number; color?: ReturnType<typeof rgb> } = {}
      ) => {
        const { font = helveticaFont, size = 10, color = rgb(0, 0, 0) } = options;
        page.drawText(text, { x, y: yPos, font, size, color });
      };

      const drawRightAlignedText = (
        text: string,
        yPos: number,
        options: { font?: typeof helveticaFont; size?: number; color?: ReturnType<typeof rgb> } = {}
      ) => {
        const { font = helveticaFont, size = 10, color = rgb(0, 0, 0) } = options;
        const textWidth = font.widthOfTextAtSize(text, size);
        page.drawText(text, { x: pageWidth - margin - textWidth, y: yPos, font, size, color });
      };

      const drawCenteredText = (
        text: string,
        yPos: number,
        options: { font?: typeof helveticaFont; size?: number; color?: ReturnType<typeof rgb> } = {}
      ) => {
        const { font = helveticaFont, size = 10, color = rgb(0, 0, 0) } = options;
        const textWidth = font.widthOfTextAtSize(text, size);
        page.drawText(text, { x: (pageWidth - textWidth) / 2, y: yPos, font, size, color });
      };

      const drawLine = (x1: number, y1: number, x2: number, y2: number, colorOverride?: ReturnType<typeof rgb>, thicknessOverride?: number) => {
        page.drawLine({
          start: { x: x1, y: y1 },
          end: { x: x2, y: y2 },
          thickness: thicknessOverride || 1,
          color: colorOverride || rgb(0, 0, 0),
        });
      };

      const drawRectangle = (x: number, y: number, width: number, height: number, color: ReturnType<typeof rgb>) => {
        page.drawRectangle({
          x,
          y: y - height,
          width,
          height,
          color,
        });
      };

      // Draw header background with primary color
      const headerHeight = 120;
      drawRectangle(margin, y + 20, pageWidth - margin * 2, headerHeight, primaryColor);
      y -= 20;

      // Draw logo if available
      if (logoImage) {
        const logoSize = 60;
        const logoX = margin + 20;
        const logoY = y - 10;
        try {
          page.drawImage(logoImage, {
            x: logoX,
            y: logoY - logoSize,
            width: logoSize,
            height: logoSize,
          });
        } catch (logoDrawError) {
          console.warn('Could not draw logo:', logoDrawError);
        }
      }

      // Header title with primary color (white text on colored background)
      drawCenteredText('PAYOUT INVOICE', y, {
        font: helveticaBoldFont,
        size: 28,
        color: rgb(1, 1, 1), // White text on primary color background
      });
      y -= 40;

      // Invoice details (right-aligned, white text on colored background)
      drawRightAlignedText(`Invoice Number: ${invoice.invoiceNumber}`, y, { color: rgb(1, 1, 1) });
      y -= 16;
      drawRightAlignedText(`Generated: ${formatDate(invoice.createdAt)}`, y, { color: rgb(0.95, 0.95, 0.95) });
      y -= 16;
      drawRightAlignedText(`Period: ${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}`, y, { color: rgb(0.95, 0.95, 0.95) });
      y -= 16;
      drawRightAlignedText(`Status: ${invoice.status}`, y, { color: rgb(0.95, 0.95, 0.95) });
      y -= 50;

      // Organization details section with primary color header
      drawText('Payee Details', margin, y, { font: helveticaBoldFont, size: 14, color: primaryColor });
      y -= 5;
      drawLine(margin, y, pageWidth - margin, y, primaryColor, 2);
      y -= 20;
      drawText(`Organization: ${invoice.organizationInfo.name}`, margin, y);
      y -= 15;

      if (invoice.organizationInfo.bankDetails) {
        drawText(`Bank: ${invoice.organizationInfo.bankDetails.bankName}`, margin, y);
        y -= 15;
        drawText(`Account Name: ${invoice.organizationInfo.bankDetails.accountName}`, margin, y);
        y -= 15;
        drawText(`Account Number: ${invoice.organizationInfo.bankDetails.accountNumber}`, margin, y);
        y -= 15;
      } else {
        drawText('Bank details not provided', margin, y, { color: rgb(0.4, 0.4, 0.4) });
        y -= 15;
      }
      y -= 25;

      // Financial summary section with primary color header and background box
      const summaryBoxY = y + 10;
      drawRectangle(margin, summaryBoxY, pageWidth - margin * 2, 100, rgb(0.95, 0.96, 1)); // Light blue background
      drawText('Financial Summary', margin + 10, y, { font: helveticaBoldFont, size: 14, color: primaryColor });
      y -= 5;
      drawLine(margin + 10, y, pageWidth - margin - 10, y, primaryColor, 2);
      y -= 25;

      const col1 = margin;
      const col2 = pageWidth - margin - 150;

      // Gross Amount
      drawText('Gross Sales Amount:', col1, y);
      drawRightAlignedText(formatCurrencyPdf(invoice.grossAmount), y);
      y -= 20;

      // Platform Fee
      drawText(`Platform Fee (${invoice.platformFeePercentage}%):`, col1, y);
      drawRightAlignedText(`-${formatCurrencyPdf(invoice.platformFeeAmount)}`, y, { color: rgb(0.86, 0.15, 0.15) });
      y -= 20;

      // Divider line with primary color
      drawLine(col1 + 10, y, pageWidth - margin - 10, y, primaryColor, 1.5);
      y -= 20;

      // Net Amount (bold with primary color)
      drawText('Net Payout Amount:', col1 + 10, y, { font: helveticaBoldFont, size: 14, color: primaryColor });
      drawRightAlignedText(formatCurrencyPdf(invoice.netAmount), y, { font: helveticaBoldFont, size: 14, color: primaryColor });
      y -= 50;

      // Order summary section with primary color header
      drawText('Order Summary', margin, y, { font: helveticaBoldFont, size: 14, color: primaryColor });
      y -= 5;
      drawLine(margin, y, pageWidth - margin, y, primaryColor, 2);
      y -= 20;
      drawText(`Total Orders: ${invoice.orderCount} | Total Items: ${invoice.itemCount}`, margin, y, { size: 11 });
      y -= 25;

      // Order table header
      const tableCol1 = margin; // Order #
      const tableCol2 = margin + 90; // Date
      const tableCol3 = margin + 190; // Customer
      const tableCol4 = margin + 320; // Items
      const tableCol5 = margin + 370; // Amount

      // Table header background
      const tableHeaderY = y + 5;
      drawRectangle(tableCol1, tableHeaderY, pageWidth - margin - tableCol1, 18, rgb(0.95, 0.96, 1)); // Light blue background

      drawText('Order #', tableCol1 + 5, y, { font: helveticaBoldFont, size: 10, color: primaryColor });
      drawText('Date', tableCol2, y, { font: helveticaBoldFont, size: 10, color: primaryColor });
      drawText('Customer', tableCol3, y, { font: helveticaBoldFont, size: 10, color: primaryColor });
      drawText('Items', tableCol4, y, { font: helveticaBoldFont, size: 10, color: primaryColor });
      drawText('Amount', tableCol5, y, { font: helveticaBoldFont, size: 10, color: primaryColor });
      y -= 5;

      // Header underline with primary color
      drawLine(tableCol1, y, pageWidth - margin, y, primaryColor, 1.5);
      y -= 15;

      // Order rows - limit to 20 orders per page
      const displayOrders = invoice.orderSummary.slice(0, 20);

      for (let i = 0; i < displayOrders.length; i++) {
        const order = displayOrders[i];
        // Check if we need a new page
        if (y < 100) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
          // Redraw table header on new page
          const tableHeaderY = y + 5;
          drawRectangle(tableCol1, tableHeaderY, pageWidth - margin - tableCol1, 18, rgb(0.95, 0.96, 1));
          drawText('Order #', tableCol1 + 5, y, { font: helveticaBoldFont, size: 10, color: primaryColor });
          drawText('Date', tableCol2, y, { font: helveticaBoldFont, size: 10, color: primaryColor });
          drawText('Customer', tableCol3, y, { font: helveticaBoldFont, size: 10, color: primaryColor });
          drawText('Items', tableCol4, y, { font: helveticaBoldFont, size: 10, color: primaryColor });
          drawText('Amount', tableCol5, y, { font: helveticaBoldFont, size: 10, color: primaryColor });
          y -= 5;
          drawLine(tableCol1, y, pageWidth - margin, y, primaryColor, 1.5);
          y -= 15;
        }

        // Alternate row background for better readability
        if (i % 2 === 0) {
          drawRectangle(tableCol1, y + 3, pageWidth - margin - tableCol1, 16, rgb(0.98, 0.98, 1));
        }

        drawText(order.orderNumber.slice(0, 15), tableCol1 + 5, y, { size: 9 });
        drawText(formatDate(order.orderDate), tableCol2, y, { size: 9 });
        drawText(order.customerName.slice(0, 20), tableCol3, y, { size: 9 });
        drawText(order.itemCount.toString(), tableCol4, y, { size: 9 });
        drawText(formatCurrencyPdf(order.totalAmount), tableCol5, y, { size: 9 });
        y -= 18;
      }

      if (invoice.orderSummary.length > 20) {
        y -= 10;
        drawText(`... and ${invoice.orderSummary.length - 20} more orders`, tableCol1, y, { size: 9, color: rgb(0.4, 0.4, 0.4) });
      }

      // Footer
      const footerY = 50;
      drawCenteredText('This is a computer-generated invoice. For questions, contact support@merchkins.com', footerY, {
        size: 8,
        color: rgb(0.4, 0.4, 0.4),
      });
      drawCenteredText('Generated by Merchkins Payout System', footerY - 12, { size: 8, color: rgb(0.4, 0.4, 0.4) });

      // Payment details if paid
      if (invoice.status === 'PAID' && invoice.paidAt) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;

        // Payment confirmation page header
        const paymentHeaderY = y + 20;
        drawRectangle(margin, paymentHeaderY, pageWidth - margin * 2, 80, primaryColor);
        drawText('Payment Confirmation', margin + 20, y, { font: helveticaBoldFont, size: 16, color: rgb(1, 1, 1) });
        y -= 35;
        drawText(`Paid on: ${formatDate(invoice.paidAt)}`, margin, y);
        y -= 15;
        if (invoice.paidByInfo) {
          drawText(`Processed by: ${invoice.paidByInfo.firstName || ''} ${invoice.paidByInfo.lastName || ''}`, margin, y);
          y -= 15;
        }
        if (invoice.paymentReference) {
          drawText(`Reference: ${invoice.paymentReference}`, margin, y);
          y -= 15;
        }
        if (invoice.paymentNotes) {
          y -= 10;
          drawText(`Notes: ${invoice.paymentNotes}`, margin, y);
        }
      }

      // Generate PDF bytes
      const pdfBytes = await pdfDoc.save();

      // Convert Uint8Array to base64 using Buffer
      const pdfBuffer = Buffer.from(pdfBytes);
      const pdfBase64 = pdfBuffer.toString('base64');

      // If uploadToR2 is requested, upload the PDF and save the URL
      if (args.uploadToR2) {
        try {
          // Create a Blob from the Buffer (which is compatible with BlobPart)
          const blob = new Blob([pdfBuffer], { type: 'application/pdf' });

          // Generate a unique key for the PDF
          const pdfKey = `payouts/invoices/${invoice.invoiceNumber}.pdf`;

          // Upload to R2
          const storageKey = await r2.store(ctx, blob, {
            key: pdfKey,
            type: 'application/pdf',
          });

          // Construct the public URL
          const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
          let invoiceUrl: string;

          if (baseUrl) {
            invoiceUrl = `${baseUrl.replace(/\/+$/, '')}/${storageKey.replace(/^\/+/, '')}`;
          } else {
            // Fallback to signed URL (expires in 7 days)
            invoiceUrl = await r2.getUrl(storageKey, { expiresIn: 604800 });
          }

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
      const orgAdmins = await ctx.runQuery(api.organizations.queries.index.getOrganizationMembers, {
        organizationId: invoice.organizationId,
        role: 'ADMIN',
        isActive: true,
      });

      if (!orgAdmins || orgAdmins.page.length === 0) {
        return { success: false, error: 'No active admins found for organization and no notification email configured' };
      }

      recipientEmails = orgAdmins.page.map((admin: any) => admin.userInfo.email);
    }

    // Format currency
    const formatCurrency = (amount: number) => `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Format date
    const formatDate = (timestamp: number) =>
      new Date(timestamp).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payout Invoice Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1d43d8 0%, #3b5fe8 100%); padding: 30px 40px; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Payout Invoice Ready</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your weekly payout summary is available</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hello ${invoice.organizationInfo.name} Team,
              </p>
              
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                Your payout invoice for the period <strong>${formatDate(invoice.periodStart)}</strong> to <strong>${formatDate(invoice.periodEnd)}</strong> is now ready.
              </p>
              
              <!-- Invoice Summary Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Invoice Number</span>
                          <p style="margin: 4px 0 0; color: #111827; font-size: 18px; font-weight: 600;">${invoice.invoiceNumber}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="50%">
                                <span style="color: #6b7280; font-size: 12px;">Gross Sales</span>
                                <p style="margin: 4px 0 0; color: #111827; font-size: 16px; font-weight: 500;">${formatCurrency(invoice.grossAmount)}</p>
                              </td>
                              <td width="50%">
                                <span style="color: #6b7280; font-size: 12px;">Platform Fee (${invoice.platformFeePercentage}%)</span>
                                <p style="margin: 4px 0 0; color: #dc2626; font-size: 16px; font-weight: 500;">-${formatCurrency(invoice.platformFeeAmount)}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 16px; border-top: 2px solid #1d43d8;">
                          <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Net Payout Amount</span>
                          <p style="margin: 4px 0 0; color: #16a34a; font-size: 28px; font-weight: 700;">${formatCurrency(invoice.netAmount)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Stats -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td width="50%" style="padding-right: 10px;">
                    <div style="background-color: #eff6ff; border-radius: 8px; padding: 16px; text-align: center;">
                      <p style="margin: 0; color: #1e40af; font-size: 24px; font-weight: 700;">${invoice.orderCount}</p>
                      <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">Orders</p>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 10px;">
                    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 16px; text-align: center;">
                      <p style="margin: 0; color: #166534; font-size: 24px; font-weight: 700;">${invoice.itemCount}</p>
                      <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">Items Sold</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Your payout will be processed on the upcoming Friday. You can view and download the full invoice from your admin dashboard.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/payouts" style="display: inline-block; background: linear-gradient(135deg, #1d43d8 0%, #3b5fe8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">View Invoice</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-align: center;">
                This is an automated email from Merchkins. Please do not reply.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Merchkins. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    try {
      // Dynamically import Mailgun and formData to avoid bundling issues
      const Mailgun = (await import('mailgun.js')).default;
      const formData = (await import('form-data')).default;

      // Initialize Mailgun
      const mailgun = new Mailgun(formData);
      const mg = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY!,
      });

      // Send email to recipients
      await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
        from: `Merchkins Payouts <payouts@${process.env.MAILGUN_DOMAIN}>`,
        to: recipientEmails,
        subject: `Payout Invoice Ready - ${invoice.invoiceNumber}`,
        html: emailHtml,
      });

      // Update invoice with email sent timestamp
      await ctx.runMutation(internal.payouts.mutations.index.updateInvoiceEmailSent, {
        invoiceId: args.invoiceId,
        type: 'invoice',
      });

      return { success: true, emailsSent: recipientEmails.length };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: (error as Error).message };
    }
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
      const orgAdmins = await ctx.runQuery(api.organizations.queries.index.getOrganizationMembers, {
        organizationId: invoice.organizationId,
        role: 'ADMIN',
        isActive: true,
      });

      if (!orgAdmins || orgAdmins.page.length === 0) {
        return { success: false, error: 'No active admins found for organization and no notification email configured' };
      }

      recipientEmails = orgAdmins.page.map((admin: any) => admin.userInfo.email);
    }

    // Format currency
    const formatCurrency = (amount: number) => `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Format date
    const formatDate = (timestamp: number) =>
      new Date(timestamp).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Processed</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 30px 40px; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">💰 Payment Processed!</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your payout has been sent</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hello ${invoice.organizationInfo.name} Team,
              </p>
              
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                Great news! Your payout for invoice <strong>${invoice.invoiceNumber}</strong> has been processed.
              </p>
              
              <!-- Payment Confirmation Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0fdf4; border: 2px solid #16a34a; border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 32px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #166534; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Amount Paid</p>
                    <p style="margin: 0; color: #16a34a; font-size: 42px; font-weight: 700;">${formatCurrency(invoice.netAmount)}</p>
                    <p style="margin: 16px 0 0; color: #6b7280; font-size: 14px;">Processed on ${formatDate(invoice.paidAt!)}</p>
                  </td>
                </tr>
              </table>
              
              ${
                invoice.paymentReference
                  ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="background-color: #f8fafc; border-radius: 8px; padding: 16px;">
                    <span style="color: #6b7280; font-size: 12px;">Payment Reference</span>
                    <p style="margin: 4px 0 0; color: #111827; font-size: 16px; font-weight: 600;">${invoice.paymentReference}</p>
                  </td>
                </tr>
              </table>
              `
                  : ''
              }
              
              ${
                invoice.paymentNotes
                  ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="background-color: #fffbeb; border-radius: 8px; padding: 16px; border-left: 4px solid #f59e0b;">
                    <span style="color: #92400e; font-size: 12px;">Note from Admin</span>
                    <p style="margin: 4px 0 0; color: #78350f; font-size: 14px;">${invoice.paymentNotes}</p>
                  </td>
                </tr>
              </table>
              `
                  : ''
              }
              
              <p style="margin: 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                The funds should reflect in your bank account within 1-3 business days, depending on your bank.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/payouts" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">View Payment Details</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-align: center;">
                Questions about your payout? Contact us at support@merchkins.com
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Merchkins. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    try {
      // Dynamically import Mailgun and formData to avoid bundling issues
      const Mailgun = (await import('mailgun.js')).default;
      const formData = (await import('form-data')).default;

      // Initialize Mailgun
      const mailgun = new Mailgun(formData);
      const mg = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY!,
      });

      // Send email to recipients
      await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
        from: `Merchkins Payouts <payouts@${process.env.MAILGUN_DOMAIN}>`,
        to: recipientEmails,
        subject: `💰 Payment Processed - ${formatCurrency(invoice.netAmount)} - ${invoice.invoiceNumber}`,
        html: emailHtml,
      });

      // Update invoice with email sent timestamp
      await ctx.runMutation(internal.payouts.mutations.index.updateInvoiceEmailSent, {
        invoiceId: args.invoiceId,
        type: 'payment',
      });

      return { success: true, emailsSent: recipientEmails.length };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: (error as Error).message };
    }
  },
});
