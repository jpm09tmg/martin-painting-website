import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { appointmentId } = await request.json();

    // Fetch appointment from Supabase with client data
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *, 
        clients(
          first_name,
          last_name,
          email,
          phone,
          address
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }

    if (!appointment.clients?.email) {
      throw new Error('Client email not found');
    }

    const clientName = appointment.clients 
      ? `${appointment.clients.first_name} ${appointment.clients.last_name}`
      : 'Valued Customer';

    // Format date nicely
    const appointmentDate = new Date(appointment.preferred_date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Send email
    const { data, error: emailError } = await resend.emails.send({
      from: 'Martin Painting <onboarding@resend.dev>',
      to: 'joshua.martin1@edu.sait.ca',
      subject: `Appointment Confirmed - ${formattedDate}`,
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
                      <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px;">✓ Your Appointment is Confirmed!</h2>
                      <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.5;">Hi ${clientName},</p>
                      <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                        Great news! We've confirmed your painting consultation appointment. We're looking forward to meeting with you.
                      </p>
                    </td>
                  </tr>

                  <!-- Appointment Details Box -->
                  <tr>
                    <td style="padding: 0 40px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 2px solid #74A744;">
                        <tr>
                          <td style="padding: 30px;">
                            <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; text-align: center;">Appointment Details</h3>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                  <span style="color: #6b7280; font-size: 14px;">📅 Date:</span>
                                  <span style="color: #1f2937; font-size: 16px; font-weight: 600; float: right;">${formattedDate}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                  <span style="color: #6b7280; font-size: 14px;">🕐 Time:</span>
                                  <span style="color: #1f2937; font-size: 16px; font-weight: 600; float: right;">${appointment.preferred_time || 'TBD'}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                  <span style="color: #6b7280; font-size: 14px;">🏠 Property Type:</span>
                                  <span style="color: #1f2937; font-size: 16px; font-weight: 600; float: right;">${appointment.property_type || 'N/A'}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                  <span style="color: #6b7280; font-size: 14px;">📍 Location:</span>
                                  <span style="color: #1f2937; font-size: 16px; font-weight: 600; float: right;">${appointment.location_type || 'N/A'}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 0;">
                                  <span style="color: #6b7280; font-size: 14px;">📍 Address:</span>
                                  <span style="color: #1f2937; font-size: 14px; font-weight: 600; float: right; text-align: right;">${appointment.clients?.address || 'N/A'}</span>
                                </td>
                              </tr>
                            </table>

                            ${appointment.details ? `
                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">📝 Project Details:</p>
                              <p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6;">${appointment.details}</p>
                            </div>
                            ` : ''}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- What to Expect -->
                  <tr>
                    <td style="padding: 30px 40px;">
                      <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">What to Expect</h3>
                      <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                        <li>Our team member will arrive at the scheduled time</li>
                        <li>We'll assess your painting needs and project scope</li>
                        <li>You'll receive a detailed quote within 24-48 hours</li>
                        <li>No obligation - free consultation and estimate</li>
                      </ul>
                    </td>
                  </tr>

                  <!-- Need to Reschedule -->
                  <tr>
                    <td style="padding: 0 40px 30px 40px;">
                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px;">
                          <strong>Need to reschedule?</strong> No problem! Just give us a call at <strong>(403) 555-PAINT</strong> or reply to this email.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Contact Info -->
                  <tr>
                    <td style="padding: 0 40px 40px 40px;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        If you have any questions before your appointment, please don't hesitate to reach out.
                      </p>
                      <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">
                        <strong>Phone:</strong> (403) 555-PAINT<br>
                        <strong>Email:</strong> info@martinpainting.com
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">
                        Thank you for choosing <strong style="color: #74A744;">Martin Painting</strong>!
                      </p>
                      <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                        This is an automated confirmation email.
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

    // Update appointment to mark email as sent
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ 
        confirmation_email_sent: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('Error updating appointment:', updateError);
      // Don't throw - email was sent successfully
    }

    console.log(`Appointment confirmation email sent for appointment #${appointmentId}`);

    // Success response
    return Response.json({ 
      success: true, 
      message: 'Appointment confirmation sent successfully',
      data 
    });

  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}