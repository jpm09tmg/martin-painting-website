import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { quoteId } = await request.json();

    // fetches quote from Supabase with client data
    const { data: quote, error } = await supabase
      .from('quotes')
      .select(`
        *, 
        quote_items(*),
        clients(
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', quoteId)
      .single();

    if (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }

    const clientName = quote.clients 
      ? `${quote.clients.first_name} ${quote.clients.last_name}`
      : 'Valued Customer';

    // calculate total
    const total = quote.quote_items?.reduce((sum, item) => 
      sum + (parseFloat(item.total) || 0), 0
    ) || 0;

    // items html generation
    const itemsHTML = quote.quote_items?.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${item.item_name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${item.description || 'N/A'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #1f2937;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937;">$${parseFloat(item.price).toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #1f2937;">$${parseFloat(item.total).toFixed(2)}</td>
      </tr>
    `).join('') || '<tr><td colspan="5" style="padding: 12px; text-align: center; color: #6b7280;">No items</td></tr>';

    // send email
    const { data, error: emailError } = await resend.emails.send({
      from: 'Martin Painting <onboarding@resend.dev>',
      to: 'joshua.martin1@edu.sait.ca',
      subject: `Your Quote #${quote.id} from Martin Painting`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #74A744 0%, #5F9136 100%); padding: 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">MARTIN PAINTING</h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Professional Painting Services</p>
                    </td>
                  </tr>

                  <!-- Greeting -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px;">
                      <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px;">Your Quote is Ready!</h2>
                      <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.5;">Hi ${clientName},</p>
                      <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                        Thank you for requesting a quote. We've prepared a detailed estimate for your ${quote.project_type?.toLowerCase() || 'painting'} painting project.
                      </p>
                    </td>
                  </tr>

                  <!-- Quote Summary Box -->
                  <tr>
                    <td style="padding: 0 40px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <tr>
                          <td style="padding: 25px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="color: #6b7280; font-size: 14px;">Quote Number:</span>
                                  <span style="color: #1f2937; font-size: 14px; font-weight: 600; float: right;">#${quote.id}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="color: #6b7280; font-size: 14px;">Project Type:</span>
                                  <span style="color: #1f2937; font-size: 14px; font-weight: 600; float: right;">${quote.project_type || 'N/A'} - ${quote.property_type || 'N/A'}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="color: #6b7280; font-size: 14px;">Address:</span>
                                  <span style="color: #1f2937; font-size: 14px; font-weight: 600; float: right;">${quote.project_address || 'N/A'}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="color: #6b7280; font-size: 14px;">Valid Until:</span>
                                  <span style="color: #1f2937; font-size: 14px; font-weight: 600; float: right;">${quote.quote_valid_until || 'Contact us'}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 20px 0 0 0; border-top: 2px solid #e5e7eb; margin-top: 15px;">
                                  <span style="color: #6b7280; font-size: 16px;">Total Amount:</span>
                                  <span style="color: #74A744; font-size: 32px; font-weight: bold; float: right;">$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Quote Items -->
                  <tr>
                    <td style="padding: 30px 40px 20px 40px;">
                      <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Quote Breakdown</h3>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 40px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                        <thead>
                          <tr style="background-color: #f9fafb;">
                            <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Item</th>
                            <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Description</th>
                            <th style="padding: 12px; text-align: center; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Qty</th>
                            <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Price</th>
                            <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsHTML}
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  ${quote.project_description ? `
                  <!-- Project Description -->
                  <tr>
                    <td style="padding: 30px 40px 20px 40px;">
                      <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">Project Description</h3>
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">${quote.project_description}</p>
                    </td>
                  </tr>
                  ` : ''}

                  ${quote.notes ? `
                  <!-- Notes -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">Additional Notes</h3>
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">${quote.notes}</p>
                    </td>
                  </tr>
                  ` : ''}

                  <!-- Contact Info -->
                  <tr>
                    <td style="padding: 20px 40px 40px 40px;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        If you have any questions or would like to proceed with this quote, please don't hesitate to contact us.
                      </p>
                      <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">
                        <strong>Phone:</strong> (403) 555-0123<br>
                        <strong>Email:</strong> info@martinpainting.com
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">
                        Thank you for choosing Martin Painting!
                      </p>
                      <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                        This is an automated email. Please do not reply directly.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      throw emailError;
    }

    // updates quote status to "Sent"
    const { error: updateError } = await supabase
      .from('quotes')
      .update({ 
        status: 'Sent'
      })
      .eq('id', quoteId);

      // error handling for update
    if (updateError) {
      console.error('Error updating quote status:', updateError);
      throw new Error('Failed to update quote status');
    }

    console.log(`Quote #${quoteId} status updated to Sent`);

    return Response.json({ 
      success: true, 
      message: 'Quote sent successfully',
      data 
    });

  } catch (error) {
    console.error('Error sending quote:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}